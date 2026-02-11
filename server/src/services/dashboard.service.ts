import { prisma } from "../lib/prisma";

export const getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  // General stats
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

  return { stats: stats.messages, orders: stats.orders, users: stats.users };
};
