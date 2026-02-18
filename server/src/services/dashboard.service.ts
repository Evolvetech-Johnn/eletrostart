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

export const getAnalyticsStats = async (query?: any) => {
  // Period selection: default 30 days
  const period = parseInt(String(query?.days || "30"), 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);
  startDate.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: startDate } },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  const messagesByStatusRaw = await prisma.contactMessage.groupBy({
    by: ["status"],
    _count: { _all: true },
  }).catch(async () => {
    // Mongo may not support groupBy; fallback manual
    const msgs = await prisma.contactMessage.findMany({
      where: { createdAt: { gte: startDate } },
      select: { status: true },
    });
    const map: Record<string, number> = {};
    for (const m of msgs) {
      const s = m.status || "UNKNOWN";
      map[s] = (map[s] || 0) + 1;
    }
    return Object.entries(map).map(([status, count]) => ({ status, _count: { _all: count } }));
  });

  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lte: 3 }, active: true },
    select: { id: true, name: true, stock: true, sku: true },
    orderBy: { stock: "asc" },
    take: 20,
  });

  // Aggregate sales and revenue by day
  const dayKey = (d: Date) => d.toISOString().split("T")[0];
  const salesByDayMap: Record<string, number> = {};
  const revenueByDayMap: Record<string, number> = {};
  let totalRevenue = 0;
  let totalOrders = 0;

  for (const order of orders) {
    const key = dayKey(order.createdAt as unknown as Date);
    salesByDayMap[key] = (salesByDayMap[key] || 0) + 1;
    revenueByDayMap[key] = (revenueByDayMap[key] || 0) + Number(order.total || 0);
    totalRevenue += Number(order.total || 0);
    totalOrders += 1;
  }

  const salesByDay = Object.entries(salesByDayMap).map(([date, count]) => ({ date, count }));
  const revenueByDay = Object.entries(revenueByDayMap).map(([date, value]) => ({ date, value }));

  // Top-selling products based on order items
  const orderItems = orders.flatMap((o) => o.items || []);
  const productSalesMap: Record<string, { name?: string; quantity: number; revenue: number }> = {};
  for (const item of orderItems) {
    const pid = item.productId || "unknown";
    const prev = productSalesMap[pid] || { name: item.productName, quantity: 0, revenue: 0 };
    prev.quantity += Number(item.quantity || 0);
    prev.revenue += Number(item.totalPrice || item.unitPrice || 0) * Number(item.quantity || 1);
    productSalesMap[pid] = prev;
  }
  const topSellingProducts = Object.entries(productSalesMap)
    .map(([productId, v]) => ({ productId, name: v.name, quantity: v.quantity, revenue: v.revenue }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 20);

  const ticketMedio = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingOrders = await prisma.order.count({ where: { status: "PENDING" } });

  return {
    salesByDay,
    revenueByDay,
    messagesByStatus: messagesByStatusRaw.map((m: any) => ({
      status: m.status,
      count: m._count?._all ?? m._count,
    })),
    lowStockProducts,
    topSellingProducts,
    ticketMedio,
    pendingOrders,
  };
};
