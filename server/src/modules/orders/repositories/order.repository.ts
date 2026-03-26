import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../../../lib/prisma";

export class OrderRepository {
  /**
   * Find orders matching criteria with pagination
   */
  async findMany(where: Prisma.OrderWhereInput, skip: number, take: number) {
    return prisma.order.findMany({
      where,
      include: {
        items: true,
        _count: { select: { items: true } },
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Count orders matching criteria
   */
  async count(where: Prisma.OrderWhereInput) {
    return prisma.order.count({ where });
  }

  /**
   * Find a single order by ID with all relations
   */
  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        statusHistory: {
          include: {
            changedBy: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  /**
   * Find a single order by ID with minimal relations for public view
   */
  async findByIdPublic(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        statusHistory: {
          orderBy: { createdAt: "asc" },
          select: { status: true, notes: true, createdAt: true },
        },
      },
    });
  }

  /**
   * Find a single order for internal transaction logic (minimal includes)
   */
  async findByIdMinimal(id: string, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return db.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  /**
   * Create order
   */
  async create(data: Prisma.OrderCreateInput, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return db.order.create({
      data,
      include: { items: true },
    });
  }

  /**
   * Update order
   */
  async update(id: string, data: Prisma.OrderUpdateInput, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return db.order.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete order completely
   */
  async delete(id: string, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    await (db as any).orderStatusHistory.deleteMany({ where: { orderId: id } });
    await db.orderItem.deleteMany({ where: { orderId: id } });
    return db.order.delete({ where: { id } });
  }

  /**
   * Add status history entry
   */
  async addStatusHistory(
    data: { orderId: string; status: string; fromStatus?: string | null; notes?: string; changedById?: string },
    tx?: Prisma.TransactionClient
  ) {
    const db = (tx as any) || (prisma as any);
    return db.orderStatusHistory.create({ data });
  }
}

export const orderRepository = new OrderRepository();
