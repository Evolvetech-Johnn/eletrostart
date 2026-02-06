import { Request, Response, NextFunction } from "express";
import { prisma } from "../index.js";
import client from "../bot/client.js";
import { Prisma } from "@prisma/client";
import { sendToDiscord } from "../services/discord.service.js";

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
      where.status = statusStr.toUpperCase() as any; // Cast to match enum if needed
    }

    const priorityStr = getQueryString(priority);
    if (priorityStr) {
      where.priority = priorityStr.toUpperCase() as any;
    }

    const tagStr = getQueryString(tag);
    if (tagStr) {
      where.tags = {
        some: {
          id: tagStr,
        },
      };
    }

    const searchStr = getQueryString(search);
    if (searchStr) {
      where.OR = [
        { name: { contains: searchStr } },
        { email: { contains: searchStr } },
        { phone: { contains: searchStr } },
        { message: { contains: searchStr } },
        { subject: { contains: searchStr } },
        { notes: { contains: searchStr } }, // Include notes in search
      ];
    }

    // Buscar mensagens
    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        skip,
        take,
        orderBy: {
          [(getQueryString(sortBy) || "createdAt") as string]: (getQueryString(
            sortOrder,
          ) || "desc") as "asc" | "desc",
        },
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
          page: pageNum,
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
        stats: stats.reduce((acc: any, s: any) => {
          if (s.status) {
            acc[s.status.toLowerCase()] = s._count;
          }
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
export const getMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };

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
export const updateMessageStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    // Audit Log
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE_STATUS",
          details: `Status alterado para ${status}`,
          messageId: id,
          userId: req.user.id,
        },
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Atualizar metadados da mensagem (Notes, Priority, Assign, Tags)
 */
export const updateMessageMeta = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    const { notes, priority, assignedToId, tags } = req.body;

    const data: any = {};
    if (notes !== undefined) data.notes = notes;
    if (priority !== undefined) data.priority = priority;
    if (assignedToId !== undefined) data.assignedToId = assignedToId;

    // Handle tags update if provided
    if (tags) {
      // tags should be an array of tag IDs or a single tag ID
      const tagIds = Array.isArray(tags) ? tags : [tags as string];
      data.tags = {
        set: tagIds.map((tagId: string) => ({ id: tagId })),
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
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE_META",
          details: `Metadados atualizados: ${JSON.stringify(req.body)}`,
          messageId: id,
          userId: req.user.id,
        },
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Ações em massa
 */
export const bulkMessagesAction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
            name: msg.name || undefined,
            email: msg.email,
            phone: msg.phone,
            subject: msg.subject,
            message: msg.message,
          });

          // Update status
          await prisma.contactMessage.update({
            where: { id: msg.id },
            data: {
              discordSent: discordResult.success as boolean,
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
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          action: `BULK_${action}`,
          details: `${ids.length} mensagens afetadas. Valor: ${value}`,
          userId: req.user.id,
          targetType: "MESSAGE",
        },
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Arquivar/Deletar mensagem
 */
export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.contactMessage.delete({ where: { id } });

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          action: "DELETE",
          details: `Mensagem ${id} deletada`,
          userId: req.user.id,
          targetId: id,
          targetType: "MESSAGE",
        },
      });
    }

    res.json({ success: true, message: "Mensagem removida" });
  } catch (error) {
    next(error);
  }
};

/**
 * Exportar mensagens para CSV
 */
export const exportMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status, search, tag, startDate, endDate } = req.query;

    const where: any = {};
    const statusStr = getQueryString(status);
    if (statusStr) where.status = statusStr.toUpperCase();

    const tagStr = getQueryString(tag);
    if (tagStr)
      where.tags = {
        some: { id: tagStr },
      };

    const searchStr = getQueryString(search);
    if (searchStr) {
      where.OR = [
        { name: { contains: searchStr } },
        { email: { contains: searchStr } },
        { subject: { contains: searchStr } },
      ];
    }

    const startStr = getQueryString(startDate);
    const endStr = getQueryString(endDate);

    if (startStr && endStr) {
      where.createdAt = {
        gte: new Date(startStr),
        lte: new Date(endStr),
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

    messages.forEach((msg: any) => {
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
        `"${msg.tags.map((t: any) => t.name).join(";")}"`,
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
export const getTags = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tags = await prisma.tag.findMany();
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
    const tag = await prisma.tag.create({ data: { name, color } });
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
    const { id } = req.params as { id: string };
    await prisma.tag.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Users
 */
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

/**
 * Discord Integration
 */
export const testDiscordIntegration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const channelId = process.env.DISCORD_CHANNEL_ID;
    if (!client.isReady()) throw new Error("Bot não está conectado.");

    const channel = (await client.channels.fetch(
      channelId as string,
    )) as TextChannel;
    if (!channel || !channel.isTextBased())
      throw new Error("Canal não encontrado ou não é de texto.");

    await channel.send(
      "🧪 Teste de integração: O sistema está conectado corretamente!",
    );

    await prisma.integrationLog.create({
      data: {
        status: "SUCCESS",
        details: "Teste de envio realizado com sucesso",
      },
    });

    res.json({ success: true, message: "Mensagem de teste enviada!" });
  } catch (error: any) {
    await prisma.integrationLog.create({
      data: { status: "ERROR", details: error.message },
    });
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
export const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Estatísticas gerais
    const stats = {
      totalMessages: await prisma.contactMessage.count(),
      newMessages: await prisma.contactMessage.count({
        where: { status: "NEW" },
      }),
      users: await prisma.adminUser.count(),
      orders: await prisma.order.count(),
    };

    res.json({ success: true, data: stats });
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
    // Placeholder for lost function during migration
    res.json({ success: true, message: "Sincronização em manutenção." });
  } catch (error) {
    next(error);
  }
};
