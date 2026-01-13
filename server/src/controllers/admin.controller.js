import { prisma } from "../index.js";
import client from "../bot/client.js";

/**
 * Lista todas as mensagens com paginação e filtros
 */
export const getMessages = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construir filtros
    const where = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search } }, // Removed mode: insensitive for SQLite
        { email: { contains: search } },
        { phone: { contains: search } },
        { message: { contains: search } },
        { subject: { contains: search } },
      ];
    }

    // Buscar mensagens
    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.contactMessage.count({ where }),
    ]);

    // Estatísticas
    const stats = await prisma.contactMessage.groupBy({
      by: ["status"],
      _count: true,
    });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
        stats: stats.reduce((acc, s) => {
          acc[s.status.toLowerCase()] = s._count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obter detalhes de uma mensagem específica
 */
export const getMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return res.status(404).json({
        error: true,
        message: "Mensagem não encontrada",
      });
    }

    // Marcar como lida se estiver como NEW
    if (message.status === "NEW") {
      await prisma.contactMessage.update({
        where: { id },
        data: { status: "READ" },
      });
      message.status = "READ";
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Atualizar status de uma mensagem
 */
export const updateMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["NEW", "READ", "REPLIED", "ARCHIVED"];

    if (!status || !validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        error: true,
        message: `Status inválido. Use: ${validStatuses.join(", ")}`,
      });
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { status: status.toUpperCase() },
    });

    res.json({
      success: true,
      message: "Status atualizado",
      data: message,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        error: true,
        message: "Mensagem não encontrada",
      });
    }
    next(error);
  }
};

/**
 * Deletar uma mensagem (soft delete - muda para ARCHIVED)
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.contactMessage.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    res.json({
      success: true,
      message: "Mensagem arquivada",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        error: true,
        message: "Mensagem não encontrada",
      });
    }
    next(error);
  }
};

/**
 * Dashboard stats
 */
export const getDashboard = async (req, res, next) => {
  try {
    const [total, newCount, todayCount, weekCount] = await Promise.all([
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: "NEW" } }),
      prisma.contactMessage.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.contactMessage.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Últimas mensagens
    const recentMessages = await prisma.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        status: true,
        createdAt: true,
        source: true,
        discordSent: true,
      },
    });

    res.json({
      success: true,
      data: {
        stats: {
          total,
          new: newCount,
          today: todayCount,
          thisWeek: weekCount,
        },
        recentMessages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sincroniza mensagens do Discord
 * Tenta buscar mensagens no canal e salvar no banco
 */
export const syncDiscordMessages = async (req, res, next) => {
  try {
    if (!client.isReady()) {
      return res.status(503).json({
        error: true,
        message: "Bot do Discord não está conectado",
      });
    }

    const channelId = process.env.DISCORD_CHANNEL_ID;
    if (!channelId) {
      return res.status(400).json({
        error: true,
        message: "Canal do Discord não configurado",
      });
    }

    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      return res.status(404).json({
        error: true,
        message: "Canal não encontrado ou inválido",
      });
    }

    // Buscar últimas 50 mensagens
    const messages = await channel.messages.fetch({ limit: 50 });
    let syncedCount = 0;

    for (const msg of messages.values()) {
      // Ignora mensagens do próprio bot (se já foram salvas, ok, mas queremos evitar duplicação de envio)
      // Na verdade, queremos pegar mensagens que TALVEZ o bot tenha enviado mas o banco perdeu, OU mensagens de users

      // Vamos tentar extrair dados de Embeds (formato padrão do nosso bot)
      if (msg.embeds.length > 0) {
        const embed = msg.embeds[0];

        // Tenta encontrar ID no footer ou fields para evitar duplicação
        // Se a mensagem tem um ID nosso, usamos ele
        let existingId = null;
        const idField = embed.fields.find((f) => f.name.includes("ID"));
        if (idField) existingId = idField.value;

        if (existingId && existingId !== "N/A") {
          const exists = await prisma.contactMessage.findUnique({
            where: { id: existingId },
          });
          if (exists) continue; // Já existe
        }

        // Se não existe, cria
        // Extrair campos
        const name =
          embed.fields.find((f) => f.name.includes("Nome"))?.value ||
          "Discord User";
        const email = embed.fields.find((f) =>
          f.name.includes("E-mail")
        )?.value;
        const phone = embed.fields.find((f) =>
          f.name.includes("Telefone")
        )?.value;
        const subject = embed.fields.find((f) =>
          f.name.includes("Assunto")
        )?.value;
        const messageBody =
          embed.fields.find((f) => f.name.includes("Mensagem"))?.value ||
          embed.description ||
          "Sem conteúdo";

        await prisma.contactMessage.create({
          data: {
            id: existingId !== "N/A" ? existingId : undefined, // Se tiver ID válido, usa
            name,
            email,
            phone,
            subject,
            message: messageBody,
            source: "discord_sync",
            discordSent: true,
            discordMessageId: msg.id,
            createdAt: msg.createdAt,
            status: "READ", // Assume lida se veio do Discord antigo
          },
        });
        syncedCount++;
      }
    }

    res.json({
      success: true,
      message: `Sincronização concluída. ${syncedCount} mensagens importadas.`,
      data: { syncedCount },
    });
  } catch (error) {
    console.error("Erro ao sincronizar Discord:", error);
    next(error);
  }
};
