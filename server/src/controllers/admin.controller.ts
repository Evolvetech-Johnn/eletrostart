import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
// import client from "../bot/client.js"; // Moved to message service
import { sendToDiscord } from "../services/discord.service.js";
import { syncCategoriesService } from "../services/categorySync.service.js";
// import { TextChannel } from "discord.js"; // Moved to message service
import * as messageService from "../services/message.service";
import * as dashboardService from "../services/dashboard.service";
import { AppError } from "../utils/AppError";

// Helper for handling async errors without try-catch blocks everywhere
// But since we are replacing the body, we can keep try-catch or use a wrapper.
// I'll keep try-catch for now to match existing style but use AppError.

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await messageService.listMessages(req.query);
    res.json({ success: true, ...result });
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

    if (!id) {
      return res.status(400).json({ error: true, message: "ID inválido" });
    }

    const message = await messageService.getMessageById(id);

    if (!message) {
      throw new AppError("Mensagem não encontrada", 404);
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

    if (!id) {
      return res.status(400).json({ error: true, message: "ID inválido" });
    }

    const message = await messageService.updateMessageStatus(id, status);
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

    if (!id) {
      return res.status(400).json({ error: true, message: "ID inválido" });
    }

    const message = await messageService.updateMessageMeta(id, req.body);
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

    if (!id) {
      return res.status(400).json({ error: true, message: "ID inválido" });
    }

    await messageService.deleteMessage(id);
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
    const { ids, action, value } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError("IDs inválidos", 400);
    }

    await messageService.bulkAction(ids, action, value);
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
    const data = await dashboardService.getDashboardStats();
    res.json({ success: true, data });
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
    const stats = await messageService.syncDiscordMessages();

    res.json({
      success: true,
      message: `Sincronização concluída. ${stats.processed} processadas, ${stats.imported} importadas.`,
      stats,
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
    const messages = await messageService.getAllMessagesForExport();
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
    const tags = await messageService.listTags();
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
    const tag = await messageService.createTag(name, color);
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

    if (!id) {
      return res.status(400).json({ error: true, message: "ID inválido" });
    }

    await messageService.deleteTag(id);
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
      throw new AppError(
        result.error || "Falha ao enviar mensagem de teste",
        500,
      );
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
