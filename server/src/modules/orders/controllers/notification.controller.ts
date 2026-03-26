import { Request, Response } from "express";
import { notificationService } from "../services/notification.service";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { read, limit } = req.query;
    const notifications = await notificationService.getNotifications({
      read: read === "true" ? true : read === "false" ? false : undefined,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar notificações" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await notificationService.markAsRead(id);
    res.json({ success: true, message: "Notificação lida" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao atualizar notificação" });
  }
};
