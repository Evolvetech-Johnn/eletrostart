import { Request, Response, NextFunction } from "express";
import { prisma } from "../index.js";
import client from "../bot/client.js";
import { Prisma } from "@prisma/client";
import { sendToDiscord } from "../services/discord.service.js";
import { syncCategoriesService } from "../services/categorySync.service.js";
import { TextChannel } from "discord.js";

// Helper to safely get string from query params
const getQueryString = (param: any): string | undefined => {
  if (typeof param === "string") return param;
  if (Array.isArray(param) && param.length > 0 && typeof param[0] === "string")
    return param[0];
  return undefined;
};

/**
 * Lista todas as mensagens com paginação e filtros
 */
export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      page = "1",
      limit = "20",
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      tag, // Filter by tag
      priority, // Filter by priority
    } = req.query;

    const pageNum = parseInt((getQueryString(page) || "1") as string);
    const limitNum = parseInt((getQueryString(limit) || "20") as string);
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    // Construir filtros
    const where: Prisma.ContactMessageWhereInput = {};

    const statusStr = getQueryString(status);
    if (statusStr) {
      where.status = statusStr.toUpperCase() as any;
    }

    const priorityStr = getQueryString(priority);
    if (priorityStr) {
      where.priority = priorityStr.toUpperCase();
    }

    const searchStr = getQueryString(search);
    if (searchStr) {
      where.OR = [
        { name: { contains: searchStr, mode: "insensitive" } },
        { email: { contains: searchStr, mode: "insensitive" } },
        { subject: { contains: searchStr, mode: "insensitive" } },
        { message: { contains: searchStr, mode: "insensitive" } },
      ];
    }

    const tagStr = getQueryString(tag);
    if (tagStr) {
      // Assuming filtering by tag name or ID
      // If tag is ID
      if (/^[0-9a-fA-F]{24}$/.test(tagStr)) {
        where.tagIds = { has: tagStr };
      } else {
        // If tag is name, we might need to find tag ID first or use relation filter if Prisma supports it on array of IDs
        // Simplest is to find tag by name first
        const tagObj = await prisma.tag.findUnique({ where: { name: tagStr } });
        if (tagObj) {
          where.tagIds = { has: tagObj.id };
        }
      }
    }

    const total = await prisma.contactMessage.count({ where });
    const messages = await prisma.contactMessage.findMany({
      where,
      skip,
      take,
      orderBy: {
        [getQueryString(sortBy) || "createdAt"]:
          getQueryString(sortOrder) || "desc",
      },
      include: {
        tags: true,
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({
      success: true,
      data: messages,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const message = await prisma.contactMessage.findUnique({
      where: { id },
      include: {
        tags: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Mensagem não encontrada" });
    }

    res.json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

export const updateMessageStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

export const updateMessageMeta = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const { notes, priority, assignedToId, tags } = req.body;

    const data: any = {};
    if (notes !== undefined) data.notes = notes;
    if (priority !== undefined) data.priority = priority;
    if (assignedToId !== undefined) data.assignedToId = assignedToId;
    if (tags !== undefined) {
      // Assuming tags is array of IDs
      data.tagIds = tags;
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data,
      include: { tags: true },
    });

    res.json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    await prisma.contactMessage.delete({ where: { id } });
    res.json({ success: true, message: "Mensagem excluída" });
  } catch (error) {
    next(error);
  }
};

export const bulkMessagesAction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { ids, action, value } = req.body; // action: delete, update_status, etc.

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "IDs inválidos" });
    }

    if (action === "delete") {
      await prisma.contactMessage.deleteMany({
        where: { id: { in: ids } },
      });
    } else if (action === "update_status") {
      await prisma.contactMessage.updateMany({
        where: { id: { in: ids } },
        data: { status: value },
      });
    } else if (action === "archive") {
      await prisma.contactMessage.updateMany({
        where: { id: { in: ids } },
        data: { status: "ARCHIVED" },
      });
    }

    res.json({ success: true, message: "Ação em massa concluída" });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // Estatísticas gerais
    const stats = {
      messages: {
        total: await prisma.contactMessage.count(),
        new: await prisma.contactMessage.count({
          where: { status: "NEW" },
        }),
        today: await prisma.contactMessage.count({
          where: { createdAt: { gte: today } },
        }),
        thisWeek: await prisma.contactMessage.count({
          where: { createdAt: { gte: weekStart } },
        }),
      },
      orders: {
        total: await prisma.order.count(),
        pending: await prisma.order.count({
          where: { status: "PENDING" },
        }),
      },
      users: await prisma.adminUser.count(),
    };

    res.json({ success: true, data: { stats: stats.messages, orders: stats.orders, users: stats.users } });
  } catch (error) {
    next(error);
  }
};

export const syncDiscordMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Verificar se o Bot está pronto
    if (!client.isReady()) {
      return res.status(503).json({
        success: false,
        message: "Bot do Discord não está conectado. Verifique o servidor.",
      });
    }

    const channelId = process.env.DISCORD_CHANNEL_ID;
    if (!channelId) {
      return res.status(400).json({
        success: false,
        message: "ID do canal do Discord não configurado no .env",
      });
    }

    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      return res.status(400).json({
        success: false,
        message: "Canal inválido ou não é de texto",
      });
    }

    const textChannel = channel as TextChannel;

    // Buscar últimas 50 mensagens
    const messages = await textChannel.messages.fetch({ limit: 50 });

    let processedCount = 0;
    let newCount = 0;

    for (const [id, msg] of messages) {
      // Ignorar mensagens do próprio bot
      if (msg.author.bot) continue;

      processedCount++;

      // Verificar se já existe no banco (pelo discordId ou conteúdo similar)
      const existing = await prisma.contactMessage.findFirst({
        where: {
          OR: [
            // Se tivéssemos um campo discordId, usaríamos aqui.
            // Como não temos, vamos tentar evitar duplicatas por conteúdo + data aproximada
            {
              message: msg.content,
              createdAt: {
                gte: new Date(msg.createdTimestamp - 60000),
                lte: new Date(msg.createdTimestamp + 60000),
              },
            },
          ],
        },
      });

      if (!existing) {
        await prisma.contactMessage.create({
          data: {
            name: msg.author.username,
            email: "discord-user@placeholder.com", // Placeholder
            subject: "Mensagem do Discord",
            message: msg.content,
            source: "DISCORD",
            status: "NEW",
            createdAt: new Date(msg.createdTimestamp),
          },
        });
        newCount++;
      }
    }

    res.json({
      success: true,
      message: `Sincronização concluída. ${processedCount} processadas, ${newCount} importadas.`,
      stats: { processed: processedCount, imported: newCount },
    });
  } catch (error) {
    console.error("Erro na sincronização do Discord:", error);
    next(error);
  }
};

export const exportMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

export const getTags = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
    res.json({ success: true, data: tags });
  } catch (error) {
    next(error);
  }
};

export const createTag = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, color } = req.body;
    const tag = await prisma.tag.create({
      data: { name, color: color || "#222998" },
    });
    res.json({ success: true, data: tag });
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    await prisma.tag.delete({ where: { id } });
    res.json({ success: true, message: "Tag excluída" });
  } catch (error) {
    next(error);
  }
};

export const testDiscordIntegration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const testData = {
      name: "Teste de Integração",
      email: "admin@teste.com",
      phone: "00 00000-0000",
      subject: "Teste de Conectividade",
      message:
        "Esta é uma mensagem de teste enviada pelo painel administrativo para validar a integração com o Discord.",
      id: "TEST-" + Date.now().toString().slice(-4),
    };

    const result = await sendToDiscord(testData);

    if (result.success) {
      res.json({
        success: true,
        message: "Mensagem de teste enviada com sucesso!",
        details: result,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Falha ao enviar mensagem de teste",
        error: result.error,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getDiscordLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const logs = await prisma.integrationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

export const syncCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await syncCategoriesService();
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
