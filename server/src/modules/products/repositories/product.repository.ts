import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../../../lib/prisma";

export class ProductRepository {
  async findMany(where: Prisma.ProductWhereInput, skip: number, take: number) {
    return prisma.product.findMany({
      where,
      include: { category: true },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  }

  async count(where: Prisma.ProductWhereInput) {
    return prisma.product.count({ where });
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async findByIdOrSku(idOrSku: string) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSku);
    return prisma.product.findFirst({
      where: isObjectId ? { OR: [{ id: idOrSku }, { sku: idOrSku }] } : { sku: idOrSku },
      include: { category: true },
    });
  }

  async findBySku(sku: string) {
    return prisma.product.findFirst({
      where: { sku },
    });
  }

  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async bulkUpdate(ids: string[], data: Prisma.ProductUpdateInput) {
    return prisma.product.updateMany({
      where: { id: { in: ids } },
      data,
    });
  }

  async bulkDelete(ids: string[]) {
    return prisma.product.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async checkOrdersLink(productId: string) {
    return prisma.orderItem.findFirst({
      where: { productId },
    });
  }

  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { active: false },
    });
  }

  async hardDelete(id: string) {
    return prisma.product.delete({ where: { id } });
  }

  // --- Variants ---
  async getVariants(productId: string) {
    return (prisma as any).productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: "asc" },
    });
  }

  async createVariant(data: any) {
    return (prisma as any).productVariant.create({ data });
  }

  async updateVariant(variantId: string, data: any) {
    return (prisma as any).productVariant.update({
      where: { id: variantId },
      data,
    });
  }

  async deleteVariant(variantId: string) {
    return (prisma as any).productVariant.delete({
      where: { id: variantId },
    });
  }

  // --- Images ---
  async getImages(productId: string) {
    return (prisma as any).productImage.findMany({
      where: { productId },
      orderBy: { order: "asc" },
    });
  }

  async clearPrimaryFlags(productId: string) {
    return (prisma as any).productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });
  }

  async createImage(data: any) {
    return (prisma as any).productImage.create({ data });
  }

  async updateImage(imageId: string, data: any) {
    return (prisma as any).productImage.update({
      where: { id: imageId },
      data,
    });
  }

  async deleteImage(imageId: string) {
    return (prisma as any).productImage.delete({
      where: { id: imageId },
    });
  }

  // --- Stock Movements ---
  async createStockMovement(data: any, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return (db as any).stockMovement.create({ data });
  }

  async countStockMovements(where: any) {
    return (prisma as any).stockMovement.count({ where });
  }

  async findStockMovements(args: any) {
    return (prisma as any).stockMovement.findMany(args);
  }

  async transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback);
  }
}

export const productRepository = new ProductRepository();
