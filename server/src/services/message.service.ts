import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

// Helper for query strings (duplicated from controller, maybe should be in utils, but fine here for now)
const getQueryString = (param: any): string | undefined => {
  if (typeof param === "string") return param;
  if (Array.isArray(param) && param.length > 0 && typeof param[0] === "string")
    return param[0];
  return undefined;
};

interface GetMessagesParams {
  page?: string | number;
  limit?: string | number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  tag?: string;
  priority?: string;
}

export const listMessages = async (params: GetMessagesParams) => {
  const {
    page = "1",
    limit = "20",
    status,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    tag,
    priority,
  } = params;

  const pageNum = parseInt(String(page));
  const limitNum = parseInt(String(limit));
  const skip = (pageNum - 1) * limitNum;
  const take = limitNum;

  const where: Prisma.ContactMessageWhereInput = {};

  if (status) {
    where.status = status.toUpperCase() as any;
  }

  if (priority) {
    where.priority = priority.toUpperCase();
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } },
      { message: { contains: search, mode: "insensitive" } },
    ];
  }

  if (tag) {
    if (/^[0-9a-fA-F]{24}$/.test(tag)) {
      where.tagIds = { has: tag };
    } else {
      const tagObj = await prisma.tag.findUnique({ where: { name: tag } });
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
      [sortBy as string]: sortOrder,
    },
    include: {
      tags: true,
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });

  return {
    data: messages,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const getMessageById = async (id: string) => {
  return await prisma.contactMessage.findUnique({
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
};

export const updateMessageStatus = async (id: string, status: string) => {
  return await prisma.contactMessage.update({
    where: { id },
    data: { status },
  });
};

export const updateMessageMeta = async (id: string, data: any) => {
  const updateData: any = {};
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
  if (data.tags !== undefined) updateData.tagIds = data.tags;

  return await prisma.contactMessage.update({
    where: { id },
    data: updateData,
    include: { tags: true },
  });
};

export const deleteMessage = async (id: string) => {
  return await prisma.contactMessage.delete({ where: { id } });
};

export const bulkAction = async (ids: string[], action: string, value?: any) => {
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
  return true;
};

export const getAllMessagesForExport = async () => {
  return await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
};

// Tag Services
export const listTags = async () => {
  return await prisma.tag.findMany({ orderBy: { name: "asc" } });
};

export const createTag = async (name: string, color: string) => {
  return await prisma.tag.create({
    data: { name, color: color || "#222998" },
  });
};

export const deleteTag = async (id: string) => {
  return await prisma.tag.delete({ where: { id } });
};
// Discord Integration
import client from "../bot/client";
import { TextChannel } from "discord.js";

export const syncDiscordMessages = async () => {
  if (!client.isReady()) {
    throw new Error("Bot do Discord não está conectado. Verifique o servidor.");
  }

  const channelId = process.env.DISCORD_CHANNEL_ID;
  if (!channelId) {
    throw new Error("ID do canal do Discord não configurado no .env");
  }

  const channel = await client.channels.fetch(channelId);
  if (!channel || !channel.isTextBased()) {
    throw new Error("Canal inválido ou não é de texto");
  }

  const textChannel = channel as TextChannel;
  const messages = await textChannel.messages.fetch({ limit: 50 });

  let processedCount = 0;
  let newCount = 0;

  for (const [id, msg] of messages) {
    if (msg.author.bot) continue;

    processedCount++;

    const existing = await prisma.contactMessage.findFirst({
      where: {
        OR: [
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
          email: "discord-user@placeholder.com",
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

  return { processed: processedCount, imported: newCount };
};
