import { Request, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { ORDER_STATUSES } from "../../../constants/orderStatus";

export const getOrdersSummary = async (req: Request, res: Response) => {
  try {
    const counts = await Promise.all(
      ORDER_STATUSES.map(async (status) => {
        const count = await prisma.order.count({ where: { status } });
        return { status, count };
      })
    );

    const summary: Record<string, number> = {};
    counts.forEach((c) => {
      summary[c.status] = c.count;
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        createdAt: true,
      }
    });

    const recentNotifications = await prisma.notification.findMany({
      take: 5,
      where: { read: false },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      summary,
      recentOrders,
      recentNotifications,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ success: false, message: "Erro ao carregar resumo do dashboard" });
  }
};
