import { prisma } from "../../../lib/prisma";

export const notificationService = {
  /**
   * Cria uma nova notificação interna
   */
  async createNotification(data: {
    type: string;
    title: string;
    message: string;
    orderId?: string;
    priority?: "low" | "medium" | "high";
    metadata?: any;
  }) {
    try {
      // Evitar duplicação para o mesmo pedido e tipo (se orderId presente)
      if (data.orderId && data.type === 'order_created') {
        const existing = await prisma.notification.findFirst({
          where: { orderId: data.orderId, type: data.type }
        });
        if (existing) return existing;
      }

      return await prisma.notification.create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          orderId: data.orderId,
          priority: data.priority || "medium",
          metadata: data.metadata || {},
        }
      });
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
      // Não trava o fluxo principal se a notificação falhar
    }
  },

  /**
   * Lista notificações
   */
  async getNotifications(filters: { read?: boolean; limit?: number } = {}) {
    return await prisma.notification.findMany({
      where: {
        read: filters.read !== undefined ? filters.read : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
    });
  },

  /**
   * Marca como lida
   */
  async markAsRead(id: string) {
    return await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
  }
};
