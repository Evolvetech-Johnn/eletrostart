import { Request, Response } from "express";
import { notificationService } from "../services/notification.service";
import { normalizeQueryParam, normalizeRouteParam } from "../../../utils/query.util";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { read } = req.query;
    // limit pode vir como string[], normaliza para string antes de parsear
    const limitRaw = normalizeQueryParam(req.query.limit);

    const notifications = await notificationService.getNotifications({
      read:
        read === "true" ? true : read === "false" ? false : undefined,
      limit: limitRaw ? parseInt(limitRaw, 10) : 20,
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar notificações" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const id = normalizeRouteParam(req.params.id);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de notificação inválido ou ausente.",
      });
    }

    await notificationService.markAsRead(id);
    res.json({ success: true, message: "Notificação lida" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao atualizar notificação" });
  }
};

