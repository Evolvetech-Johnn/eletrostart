// Executive Module – Repository (encapsula todas as queries Prisma)

import { prisma } from '../../../lib/prisma';
import { PeriodFilter } from '../types/executive.types';

export class ExecutiveRepository {
  // ─── Overview ────────────────────────────────────────────────────────────────

  async getTotalRevenue(): Promise<number> {
    const orders = await prisma.order.findMany({
      where: { status: { notIn: ['CANCELLED'] } },
      select: { total: true },
    });
    return orders.reduce((acc, o) => acc + Number(o.total ?? 0), 0);
  }

  async getTotalOrders(): Promise<number> {
    return prisma.order.count({ where: { status: { notIn: ['CANCELLED'] } } });
  }

  async getPendingOrders(): Promise<number> {
    return prisma.order.count({ where: { status: 'PENDING' } });
  }

  async getTotalProducts(): Promise<number> {
    return prisma.product.count({ where: { active: true } });
  }

  async getTotalCustomers(): Promise<number> {
    // Distinct customers by email from orders
    const orders = await prisma.order.findMany({
      select: { customerEmail: true },
      distinct: ['customerEmail'],
      where: { status: { notIn: ['CANCELLED'] } },
    });
    return orders.length;
  }

  async getRevenueForPeriod(startDate: Date, endDate: Date): Promise<number> {
    const orders = await prisma.order.findMany({
      where: {
        status: { notIn: ['CANCELLED'] },
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { total: true },
    });
    return orders.reduce((acc, o) => acc + Number(o.total ?? 0), 0);
  }

  // ─── Financial ────────────────────────────────────────────────────────────────

  async getOrdersWithItems(filter: PeriodFilter) {
    return prisma.order.findMany({
      where: {
        status: { notIn: ['CANCELLED'] },
        ...(filter.startDate && filter.endDate
          ? { createdAt: { gte: filter.startDate, lte: filter.endDate } }
          : {}),
      },
      select: {
        id: true,
        total: true,
        subtotal: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── Inventory ────────────────────────────────────────────────────────────────

  async getAllActiveProducts() {
    return prisma.product.findMany({
      where: { active: true },
      select: { id: true, name: true, stock: true, price: true },
    });
  }

  async getProductsWithNoRecentSales(daysSince: number) {
    const since = new Date();
    since.setDate(since.getDate() - daysSince);

    // Produtos com vendas recentes
    const recentItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: since },
          status: { notIn: ['CANCELLED'] },
        },
      },
      select: { productId: true },
      distinct: ['productId'],
    });

    const recentProductIds = recentItems
      .map((i) => i.productId)
      .filter((id): id is string => !!id);

    return prisma.product.findMany({
      where: {
        active: true,
        stock: { gt: 0 },
        ...(recentProductIds.length > 0
          ? { id: { notIn: recentProductIds } }
          : {}),
      },
      select: { id: true, name: true, stock: true, price: true },
      orderBy: { stock: 'desc' },
      take: 50,
    });
  }

  // ─── Customers ────────────────────────────────────────────────────────────────

  async getCustomerOrderStats(filter: PeriodFilter) {
    return prisma.order.findMany({
      where: {
        status: { notIn: ['CANCELLED'] },
        ...(filter.startDate && filter.endDate
          ? { createdAt: { gte: filter.startDate, lte: filter.endDate } }
          : {}),
      },
      select: {
        customerName: true,
        customerEmail: true,
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Profitability ────────────────────────────────────────────────────────────

  async getOrderItemsWithDetails(filter: PeriodFilter) {
    return prisma.orderItem.findMany({
      where: {
        order: {
          status: { notIn: ['CANCELLED'] },
          ...(filter.startDate && filter.endDate
            ? { createdAt: { gte: filter.startDate, lte: filter.endDate } }
            : {}),
        },
      },
      select: {
        productId: true,
        productName: true,
        quantity: true,
        unitPrice: true,
        totalPrice: true,
      },
    });
  }

  // ─── Snapshots ────────────────────────────────────────────────────────────────

  async upsertSnapshot(data: {
    periodType: string;
    periodRef: string;
    revenue: number;
    cost: number;
    grossProfit: number;
    ordersCount: number;
    avgTicket: number;
  }) {
    // Remove snapshot existente para o mesmo período e cria novo
    await prisma.analyticsSnapshot.deleteMany({
      where: { periodType: data.periodType, periodRef: data.periodRef },
    });
    return prisma.analyticsSnapshot.create({ data });
  }

  async getSnapshots(periodType: string, limit = 30) {
    return prisma.analyticsSnapshot.findMany({
      where: { periodType },
      orderBy: { periodRef: 'desc' },
      take: limit,
    });
  }
}

export const executiveRepository = new ExecutiveRepository();
