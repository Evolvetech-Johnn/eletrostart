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
      tag, // Filter by tag
      priority, // Filter by priority
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construir filtros
    const where = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (priority) {
      where.priority = priority.toUpperCase();
    }

    if (tag) {
      where.tags = {
        some: {
          id: tag,
        },
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { message: { contains: search } },
        { subject: { contains: search } },
        { notes: { contains: search } }, // Include notes in search
      ];
    }

    // Buscar mensagens
    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          tags: true,
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
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
      include: {
        tags: true,
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            user: { select: { name: true } },
          },
        },
      },
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

    res.json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

/**
 * Atualizar status da mensagem
 */
export const updateMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_STATUS",
        details: `Status alterado para ${status}`,
        messageId: id,
        userId: req.user.userId,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Atualizar metadados da mensagem (Notes, Priority, Assign, Tags)
 */
export const updateMessageMeta = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, priority, assignedToId, tags } = req.body;

    const data = {};
    if (notes !== undefined) data.notes = notes;
    if (priority !== undefined) data.priority = priority;
    if (assignedToId !== undefined) data.assignedToId = assignedToId;

    // Handle tags update if provided
    if (tags) {
      // tags should be an array of tag IDs
      data.tags = {
        set: tags.map((tagId) => ({ id: tagId })),
      };
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data,
      include: {
        tags: true,
        assignedTo: { select: { id: true, name: true } },
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_META",
        details: `Metadados atualizados: ${JSON.stringify(req.body)}`,
        messageId: id,
        userId: req.user.userId,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Ações em massa
 */
export const bulkMessagesAction = async (req, res, next) => {
  try {
    const { ids, action, value } = req.body; // ids: [], action: 'MARK_READ', 'ARCHIVE', 'DELETE', 'DISCORD', 'ASSIGN'

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ error: true, message: "IDs não fornecidos" });
    }

    let result;

    switch (action) {
      case "UPDATE_STATUS":
        result = await prisma.contactMessage.updateMany({
          where: { id: { in: ids } },
          data: { status: value }, // value ex: 'READ', 'ARCHIVED'
        });
        break;

      case "DELETE":
        result = await prisma.contactMessage.deleteMany({
          where: { id: { in: ids } },
        });
        break;

      case "RESEND_DISCORD":
        const messagesToSend = await prisma.contactMessage.findMany({
          where: { id: { in: ids } },
        });

        let successCount = 0;
        let failCount = 0;

        for (const msg of messagesToSend) {
          // Send to Discord
          const discordResult = await sendToDiscord({
            id: msg.id,
            name: msg.name,
            email: msg.email,
            phone: msg.phone,
            subject: msg.subject,
            message: msg.message,
          });

          // Update status
          await prisma.contactMessage.update({
            where: { id: msg.id },
            data: {
              discordSent: discordResult.success,
              discordMessageId: discordResult.messageId || null,
            },
          });

          if (discordResult.success) successCount++;
          else failCount++;
        }

        result = {
          count: successCount,
          message: `${successCount} mensagens enviadas para o Discord. ${failCount} falhas.`,
        };
        break;

      default:
        return res.status(400).json({ error: true, message: "Ação inválida" });
    }

    // Audit Log Bulk
    await prisma.auditLog.create({
      data: {
        action: `BULK_${action}`,
        details: `${ids.length} mensagens afetadas. Valor: ${value}`,
        userId: req.user.userId,
        targetType: "MESSAGE",
      },
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Arquivar/Deletar mensagem
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.contactMessage.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        details: `Mensagem ${id} deletada`,
        userId: req.user.userId,
        targetId: id,
        targetType: "MESSAGE",
      },
    });

    res.json({ success: true, message: "Mensagem removida" });
  } catch (error) {
    next(error);
  }
};

/**
 * Exportar mensagens para CSV
 */
export const exportMessages = async (req, res, next) => {
  try {
    const { status, search, tag, startDate, endDate } = req.query;

    const where = {};
    if (status) where.status = status.toUpperCase();
    if (tag) where.tags = { some: { id: tag } };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { subject: { contains: search } },
      ];
    }
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { tags: true, assignedTo: true },
    });

    // Generate CSV
    const fields = [
      "ID",
      "Data",
      "Nome",
      "Email",
      "Telefone",
      "Assunto",
      "Mensagem",
      "Status",
      "Prioridade",
      "Responsável",
      "Tags",
    ];
    let csv = fields.join(",") + "\n";

    messages.forEach((msg) => {
      const row = [
        msg.id,
        msg.createdAt.toISOString(),
        `"${msg.name || ""}"`,
        `"${msg.email || ""}"`,
        `"${msg.phone || ""}"`,
        `"${msg.subject || ""}"`,
        `"${(msg.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
        msg.status,
        msg.priority,
        msg.assignedTo?.name || "",
        `"${msg.tags.map((t) => t.name).join(";")}"`,
      ];
      csv += row.join(",") + "\n";
    });

    res.header("Content-Type", "text/csv");
    res.attachment("messages_export.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * Tags CRUD
 */
export const getTags = async (req, res, next) => {
  try {
    const tags = await prisma.tag.findMany();
    res.json({ success: true, data: tags });
  } catch (error) {
    next(error);
  }
};

export const createTag = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const tag = await prisma.tag.create({ data: { name, color } });
    res.json({ success: true, data: tag });
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.tag.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Users
 */
export const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastLogin: true,
      },
    });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * Discord Integration
 */
export const testDiscordIntegration = async (req, res, next) => {
  try {
    const channelId = process.env.DISCORD_CHANNEL_ID;
    if (!client.isReady()) throw new Error("Bot não está conectado.");

    const channel = await client.channels.fetch(channelId);
    if (!channel) throw new Error("Canal não encontrado.");

    await channel.send(
      "🧪 Teste de integração: O sistema está conectado corretamente!"
    );

    await prisma.integrationLog.create({
      data: {
        status: "SUCCESS",
        details: "Teste de envio realizado com sucesso",
      },
    });

    res.json({ success: true, message: "Mensagem de teste enviada!" });
  } catch (error) {
    await prisma.integrationLog.create({
      data: { status: "ERROR", details: error.message },
    });
    next(error);
  }
};

export const getDiscordLogs = async (req, res, next) => {
  try {
    const logs = await prisma.integrationLog.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

/**
 * Obter dados do dashboard
 */
export const getDashboard = async (req, res, next) => {
  try {
    // Estatísticas gerais
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

    // Mensagens recentes
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
 * Sincronizar mensagens do canal do Discord
 */
export const syncDiscordMessages = async (req, res, next) => {
  try {
    if (!client.isReady()) {
      return res
        .status(503)
        .json({ error: true, message: "Bot do Discord não está conectado" });
    }

    const channelId = process.env.DISCORD_CHANNEL_ID;
    if (!channelId) {
      return res
        .status(400)
        .json({ error: true, message: "Canal do Discord não configurado" });
    }

    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      return res
        .status(404)
        .json({ error: true, message: "Canal não encontrado ou inválido" });
    }

    // Buscar últimas 50 mensagens
    const messages = await channel.messages.fetch({ limit: 50 });
    let syncedCount = 0;

    for (const msg of messages.values()) {
      // Ignorar mensagens do próprio bot
      if (msg.author.id === client.user.id) continue;

      // Verificar se já existe pelo ID do Discord
      const existing = await prisma.contactMessage.findFirst({
        where: { discordMessageId: msg.id },
      });

      if (existing) continue;

      let messageData = null;
      let existingId = null;

      // Tentar extrair de Embed (se for forward do form antigo ou outro bot)
      if (msg.embeds.length > 0) {
        const embed = msg.embeds[0];

        // Tentar extrair ID se houver
        existingId = embed.fields.find((f) => f.name.includes("ID"))?.value;
        if (existingId === "N/A") existingId = null;

        messageData = {
          name:
            embed.fields.find((f) => f.name.includes("Nome"))?.value ||
            "Discord User",
          email: embed.fields.find((f) => f.name.includes("E-mail"))?.value,
          phone: embed.fields.find((f) => f.name.includes("Telefone"))?.value,
          subject: embed.fields.find((f) => f.name.includes("Assunto"))?.value,
          message:
            embed.fields.find((f) => f.name.includes("Mensagem"))?.value ||
            embed.description ||
            "Sem conteúdo",
        };
      } else if (msg.content) {
        // Mensagem de texto normal
        messageData = {
          name: msg.author.username,
          email: null,
          phone: null,
          subject: "Mensagem do Discord",
          message: msg.content,
        };
      }

      if (messageData) {
        // Se achou um ID no embed, verifica se já existe no banco
        if (existingId) {
          const idCheck = await prisma.contactMessage.findUnique({
            where: { id: existingId },
          });
          if (idCheck) continue; // Já existe
        }

        await prisma.contactMessage.create({
          data: {
            ...messageData,
            source: "discord",
            discordMessageId: msg.id,
            discordChannel: channel.name,
            discordSent: true, // Veio do discord, então "enviado"
            sentAt: msg.createdAt,
            status: "NEW", // Sempre NEW ao importar
          },
        });
        syncedCount++;
      }
    }

    res.json({
      success: true,
      message: `${syncedCount} mensagens sincronizadas com sucesso`,
      count: syncedCount,
    });
  } catch (error) {
    next(error);
  }
};
