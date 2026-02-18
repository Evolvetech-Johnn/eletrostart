import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
// import client from "../bot/client.js"; // Moved to message service
import { syncCategoriesService } from "../services/categorySync.service.js";
import * as messageService from "../services/message.service";
import * as dashboardService from "../services/dashboard.service";
import { AppError } from "../utils/AppError";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import {
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  resetPasswordSchema,
} from "../schemas/user.schema";
import { logAction } from "../services/audit.service";

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

export const getDashboardAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await dashboardService.getAnalyticsStats(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Integração Discord removida

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

// Integração Discord removida

// Integração Discord removida

export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      page = "1",
      limit = "20",
      userId,
      targetType,
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string, 10) || 20),
    );
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.AuditLogWhereInput = {};

    if (userId && typeof userId === "string") {
      where.userId = userId;
    }

    if (targetType && typeof targetType === "string") {
      where.targetType = targetType.toUpperCase();
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate && typeof startDate === "string") {
        (where.createdAt as any).gte = new Date(startDate);
      }
      if (endDate && typeof endDate === "string") {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        (where.createdAt as any).lte = d;
      }
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
    ]);

    res.json({
      success: true,
      data: logs,
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
        active: true,
      },
    });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = createUserSchema.parse(req.body);
    const requesterId = (req as any).user?.id || undefined;

    const existing = await prisma.adminUser.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (existing) {
      throw new AppError("E-mail já cadastrado", 400);
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.adminUser.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,
        role: data.role,
        active: data.active ?? true,
      },
      select: { id: true, name: true, email: true, role: true, active: true },
    });

    logAction({
      action: "CREATE",
      userId: requesterId,
      targetId: user.id,
      targetType: "USER",
      details: { email: user.email, role: user.role },
    });

    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Erro de validação",
        data: error.errors,
      });
    }
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const data = updateUserSchema.parse(req.body);
    const requesterId = (req as any).user?.id || undefined;

    const updates: any = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.email !== undefined) updates.email = data.email;
    if (data.role !== undefined) updates.role = data.role;
    if (data.active !== undefined) updates.active = data.active;
    if (data.password !== undefined) {
      updates.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.adminUser.update({
      where: { id },
      data: updates,
      select: { id: true, name: true, email: true, role: true, active: true },
    });

    logAction({
      action: "UPDATE",
      userId: requesterId,
      targetId: id,
      targetType: "USER",
      details: updates,
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Usuário não encontrado",
      });
    }
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Erro de validação",
        data: error.errors,
      });
    }
    next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const { role } = updateUserRoleSchema.parse(req.body);
    const requesterId = (req as any).user?.id || undefined;

    const user = await prisma.adminUser.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    logAction({
      action: "UPDATE",
      userId: requesterId,
      targetId: id,
      targetType: "USER",
      details: { role },
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, error: "Usuário não encontrado" });
    }
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Erro de validação",
        data: error.errors,
      });
    }
    next(error);
  }
};

export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const { active } = updateUserStatusSchema.parse(req.body);
    const requesterId = (req as any).user?.id || undefined;

    const user = await prisma.adminUser.update({
      where: { id },
      data: { active },
      select: { id: true, name: true, email: true, role: true, active: true },
    });

    logAction({
      action: "UPDATE",
      userId: requesterId,
      targetId: id,
      targetType: "USER",
      details: { active },
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, error: "Usuário não encontrado" });
    }
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Erro de validação",
        data: error.errors,
      });
    }
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const requesterId = (req as any).user?.id || undefined;

    // In a real system, validate token against a ResetToken store; here, accept any non-empty token
    const user = await prisma.adminUser.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const hashed = await bcrypt.hash(data.newPassword, 10);
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    logAction({
      action: "UPDATE",
      userId: requesterId,
      targetId: user.id,
      targetType: "USER",
      details: { event: "RESET_PASSWORD" },
    });

    res.json({
      success: true,
      data: { message: "Senha redefinida com sucesso" },
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: "Erro de validação",
        data: error.errors,
      });
    }
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
