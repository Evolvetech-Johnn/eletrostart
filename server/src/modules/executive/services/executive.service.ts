// Executive Module – Service (lógica de negócio, não acessa Prisma diretamente)

import { executiveRepository } from '../repositories/executive.repository';
import {
  PeriodFilter,
  OverviewKPIs,
  FinancialKPIs,
  InventoryKPIs,
  CustomerKPIs,
  ProfitabilityKPIs,
} from '../types/executive.types';

export class ExecutiveService {
  // ─── Overview ────────────────────────────────────────────────────────────────

  async getOverview(): Promise<OverviewKPIs> {
    const now = new Date();

    // Mês atual
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Mês anterior
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalRevenue,
      totalOrders,
      pendingOrders,
      totalProducts,
      totalCustomers,
      revenueThisMonth,
      revenueLastMonth,
    ] = await Promise.all([
      executiveRepository.getTotalRevenue(),
      executiveRepository.getTotalOrders(),
      executiveRepository.getPendingOrders(),
      executiveRepository.getTotalProducts(),
      executiveRepository.getTotalCustomers(),
      executiveRepository.getRevenueForPeriod(startOfMonth, endOfMonth),
      executiveRepository.getRevenueForPeriod(startOfLastMonth, endOfLastMonth),
    ]);

    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const revenueGrowthPct =
      revenueLastMonth > 0
        ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
        : revenueThisMonth > 0
        ? 100
        : 0;

    return {
      totalRevenue,
      totalOrders,
      avgTicket,
      totalProducts,
      totalCustomers,
      pendingOrders,
      revenueThisMonth,
      revenueLastMonth,
      revenueGrowthPct,
    };
  }

  // ─── Financial ────────────────────────────────────────────────────────────────

  async getFinancial(filter: PeriodFilter): Promise<FinancialKPIs> {
    const orders = await executiveRepository.getOrdersWithItems(filter);

    // Agrupar por dia
    const byDay: Record<string, number> = {};
    const byMonth: Record<string, number> = {};
    let totalRevenue = 0;

    for (const order of orders) {
      const rev = Number(order.total ?? 0);
      totalRevenue += rev;

      const dayKey = (order.createdAt as Date).toISOString().split('T')[0];
      const monthKey = dayKey.substring(0, 7);

      byDay[dayKey] = (byDay[dayKey] || 0) + rev;
      byMonth[monthKey] = (byMonth[monthKey] || 0) + rev;
    }

    // Custo estimado: sem campo de custo no produto, usamos 60% do preço como proxy (configurável)
    // Em produção real, adicionar campo `costPrice` ao Product
    const COST_RATIO = 0.60;
    const totalCost = totalRevenue * COST_RATIO;
    const grossProfit = totalRevenue - totalCost;
    const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Crescimento: comparar com período anterior de mesmo tamanho
    let growthPct = 0;
    if (filter.startDate && filter.endDate) {
      const periodMs = filter.endDate.getTime() - filter.startDate.getTime();
      const prevEnd = new Date(filter.startDate.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - periodMs);
      const prevRevenue = await executiveRepository.getRevenueForPeriod(prevStart, prevEnd);
      growthPct =
        prevRevenue > 0
          ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
          : totalRevenue > 0
          ? 100
          : 0;
    }

    return {
      revenueByDay: Object.entries(byDay)
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      revenueByMonth: Object.entries(byMonth)
        .map(([month, value]) => ({ month, value }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      totalRevenue,
      totalCost,
      grossProfit,
      grossMarginPct,
      avgTicket,
      growthPct,
    };
  }

  // ─── Inventory ────────────────────────────────────────────────────────────────

  async getInventory(): Promise<InventoryKPIs> {
    const [products, noSalesProducts] = await Promise.all([
      executiveRepository.getAllActiveProducts(),
      executiveRepository.getProductsWithNoRecentSales(30),
    ]);

    const outOfStock = products.filter((p) => p.stock === 0).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const totalStockValue = products.reduce(
      (acc, p) => acc + Number(p.stock) * Number(p.price),
      0
    );

    const topByStock = [...products]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 10)
      .map((p) => ({ id: p.id, name: p.name, stock: p.stock }));

    return {
      totalProducts: products.length,
      totalStockValue,
      outOfStock,
      lowStock,
      noSalesLast30Days: noSalesProducts.map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        price: Number(p.price),
      })),
      topByStock,
    };
  }

  // ─── Customers ────────────────────────────────────────────────────────────────

  async getCustomers(filter: PeriodFilter): Promise<CustomerKPIs> {
    const orders = await executiveRepository.getCustomerOrderStats(filter);

    // Agrupa por email
    const customerMap: Record<
      string,
      { name: string; email: string; orders: number; totalSpent: number }
    > = {};

    for (const order of orders) {
      const email = order.customerEmail;
      if (!customerMap[email]) {
        customerMap[email] = { name: order.customerName, email, orders: 0, totalSpent: 0 };
      }
      customerMap[email].orders += 1;
      customerMap[email].totalSpent += Number(order.total ?? 0);
    }

    const customers = Object.values(customerMap);
    const totalCustomers = customers.length;

    // Novos no período: customers que aparecem apenas com orders after startDate
    // (proxy: contamos distintos no período)
    const newCustomersThisPeriod = totalCustomers;

    const avgOrdersPerCustomer =
      totalCustomers > 0
        ? customers.reduce((acc, c) => acc + c.orders, 0) / totalCustomers
        : 0;

    const repurchaseCount = customers.filter((c) => c.orders > 1).length;
    const repurchaseRate = totalCustomers > 0 ? (repurchaseCount / totalCustomers) * 100 : 0;

    const topCustomers = [...customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 20);

    return {
      totalCustomers,
      newCustomersThisPeriod,
      avgOrdersPerCustomer,
      topCustomers,
      repurchaseRate,
    };
  }

  // ─── Profitability ────────────────────────────────────────────────────────────

  async getProfitability(filter: PeriodFilter): Promise<ProfitabilityKPIs> {
    const items = await executiveRepository.getOrderItemsWithDetails(filter);

    // Agrupa por produto
    const productMap: Record<
      string,
      { name: string; quantitySold: number; revenue: number }
    > = {};

    for (const item of items) {
      const pid = item.productId || 'unknown';
      if (!productMap[pid]) {
        productMap[pid] = { name: item.productName, quantitySold: 0, revenue: 0 };
      }
      productMap[pid].quantitySold += Number(item.quantity ?? 0);
      productMap[pid].revenue += Number(item.totalPrice ?? 0);
    }

    const sorted = Object.entries(productMap).map(([productId, v]) => ({
      productId,
      name: v.name,
      quantitySold: v.quantitySold,
      revenue: v.revenue,
    }));

    return {
      topProductsByRevenue: [...sorted].sort((a, b) => b.revenue - a.revenue).slice(0, 20),
      topProductsByVolume: [...sorted].sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 20),
    };
  }
}

export const executiveService = new ExecutiveService();
