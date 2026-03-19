import { prisma } from "../../../lib/prisma";
import { Prisma } from "@prisma/client";
import { sequenceService } from "../../../services/sequence.service";
import { orderRepository } from "../repositories/order.repository";
import { logAction } from "../../../services/audit.service";
import {
  buildOrderEmailTemplates,
  orderToMessageDetails,
  sendEmail,
} from "../../../services/emailTemplates.service";
import { ALLOWED_TRANSITIONS, STOCK_DEBITED_STATUSES, OrderStatus } from "../../../constants/orderStatus";

export class OrderService {
  /**
   * Complex business logic for order creation inside an atomic transaction.
   * Debits stock and creates history/movements.
   */
  async createOrder(data: any, customer: any, address: any, items: any[], notes: string) {
    let subtotal = 0;
    const orderItemsData: any[] = [];

    const order = await prisma.$transaction(async (tx) => {
      const stockMovements: any[] = [];
      
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) throw new Error(`Produto ${item.productId} não encontrado`);
        if (product.stock < item.quantity) throw new Error(`Estoque insuficiente para ${product.name}`);

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: Number(item.quantity) } },
        });

        const prev = Number(product.stock);
        const qty = Number(item.quantity);
        const next = prev - qty;
        
        stockMovements.push({
          productId: product.id,
          previousStock: prev,
          newStock: next,
          quantity: qty,
        });

        const price = Number(product.price);
        const total = price * qty;
        subtotal += total;

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          quantity: qty,
          unitPrice: price,
          costPrice: product.costPrice || null,
          totalPrice: total,
        });
      }

      const shippingCost = 0;
      const total = subtotal + shippingCost;

      const orderSeq = await sequenceService.getNextSequence("order");
      const orderNumber = sequenceService.formatOrderNumber(orderSeq);

      const createdOrder = await orderRepository.create({
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerDoc: customer.doc,
        status: "CREATED",
        fulfillmentType: data.fulfillmentType || "delivery",
        addressZip: address?.zip,
        addressStreet: address?.street,
        addressNumber: address?.number,
        addressComp: address?.comp,
        addressCity: address?.city,
        addressState: address?.state,
        subtotal,
        shippingCost,
        total,
        paymentMethod: data.paymentMethod,
        notes,
        orderNumber,
        items: {
          create: orderItemsData,
        },
      }, tx);

      await orderRepository.addStatusHistory({
        orderId: createdOrder.id,
        status: "CREATED",
        notes: "Pedido criado pelo cliente",
      }, tx);

      const txAny: any = tx;
      for (const m of stockMovements) {
        await txAny.stockMovement.create({
          data: {
            productId: m.productId,
            orderId: createdOrder.id,
            type: "ORDER_CREATE",
            quantity: m.quantity,
            previousStock: m.previousStock,
            newStock: m.newStock,
            reason: "Baixa de estoque na criação de pedido",
            createdById: null,
          },
        });
      }

      return createdOrder;
    });

    const detailsForEmail = orderToMessageDetails(order);
    const preview = buildOrderEmailTemplates(detailsForEmail);
    console.log("EMAIL_PREVIEW_SUBJECT:", preview.subject);
    
    try {
      await logAction({
        action: "EXPORT",
        targetType: "ORDER",
        targetId: order.id,
        details: { emailSubject: preview.subject, emailTo: detailsForEmail.customerEmail },
      });
    } catch {}
    
    await sendEmail(detailsForEmail);
    return order;
  }

  /**
   * Fetches paginated orders
   */
  async getOrders(query: any) {
    const { status, search, page = "1", limit = "20" } = query;
    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status as string;
    if (search) {
      where.OR = [
        { customerName: { contains: search as string } },
        { customerEmail: { contains: search as string } },
        { id: { contains: search as string } },
        { orderNumber: { contains: search as string } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [total, orders] = await Promise.all([
      orderRepository.count(where),
      orderRepository.findMany(where, skip, limitNum)
    ]);

    return { total, orders, pageNum, limitNum };
  }

  /**
   * Updates order status enforcing transitions and reverting stock if necessary
   */
  async updateOrderStatus(id: string, requesterId: string | undefined, payload: any) {
    const { status, paymentStatus, trackingCode } = payload;

    const order = await prisma.$transaction(async (tx) => {
      const existing = await orderRepository.findByIdMinimal(id, tx);
      if (!existing) throw new Error("ORDER_NOT_FOUND");

      const updateData: any = {};
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (trackingCode !== undefined) updateData.trackingCode = trackingCode;

      if (status && existing.status !== status) {
        const prevStatus = existing.status as OrderStatus;
        const nextStatus = status as OrderStatus;

        const allowed = ALLOWED_TRANSITIONS[prevStatus] ?? [];
        if (!allowed.includes(nextStatus)) {
          throw new Error(`INVALID_TRANSITION:${prevStatus}→${nextStatus}`);
        }

        updateData.status = nextStatus;

        const isCancelingNow  = !STOCK_DEBITED_STATUSES.includes(nextStatus) && STOCK_DEBITED_STATUSES.includes(prevStatus);
        const isRestoringFromCancel = STOCK_DEBITED_STATUSES.includes(nextStatus) && !STOCK_DEBITED_STATUSES.includes(prevStatus);

        const txAny = tx as any;

        if (isCancelingNow) {
          for (const item of (existing as any).items) {
            const product = await tx.product.findUnique({ where: { id: item.productId } });
            const prev = Number(product?.stock ?? 0);
            const qty = Number(item.quantity);
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: qty } },
            });
            await txAny.stockMovement.create({
              data: {
                productId: item.productId,
                orderId: existing.id,
                type: "ORDER_CANCEL",
                quantity: qty,
                previousStock: prev,
                newStock: prev + qty,
                reason: "Cancelamento de pedido",
                createdById: requesterId,
              },
            });
          }
        } else if (isRestoringFromCancel) {
          for (const item of (existing as any).items) {
            const product = await tx.product.findUnique({ where: { id: item.productId } });
            if (!product) throw new Error(`Produto ${item.productId} não encontrado`);
            if (product.stock < item.quantity) throw new Error(`Estoque insuficiente para produto ${item.productId}`);
          }
          for (const item of (existing as any).items) {
            const product = await tx.product.findUnique({ where: { id: item.productId } });
            const prev = Number(product?.stock ?? 0);
            const qty = Number(item.quantity);
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: qty } },
            });
            await txAny.stockMovement.create({
              data: {
                productId: item.productId,
                orderId: existing.id,
                type: "ORDER_RESTORE",
                quantity: qty,
                previousStock: prev,
                newStock: prev - qty,
                reason: "Reativação de pedido cancelado",
                createdById: requesterId,
              },
            });
          }
        }
      }

      const updated = await orderRepository.update(id, updateData, tx);

      if (status && existing.status !== status) {
        await orderRepository.addStatusHistory({
          orderId: updated.id,
          status,
          changedById: requesterId,
        }, tx);
      }

      return updated;
    });

    try {
      const details: any = { newStatus: order.status };
      if (trackingCode !== undefined) details.trackingCode = trackingCode;
      await logAction({
        action: "UPDATE",
        userId: requesterId,
        targetId: order.id,
        targetType: "ORDER",
        details, // Omissão do previousStatus por simplificação na chamada refatorada
      });
    } catch {}

    return order;
  }

  async deleteOrder(id: string, requesterId: string | undefined) {
    const existing = await orderRepository.findByIdMinimal(id);
    if (!existing) throw new Error("ORDER_NOT_FOUND");

    await prisma.$transaction(async (tx) => {
      if (existing.status !== "CANCELLED" && existing.status !== "CANCELED") {
        for (const item of (existing as any).items) {
          const product = await tx.product.findUnique({ where: { id: item.productId as string } });
          const prev = Number(product?.stock ?? 0);
          const qty = Number(item.quantity);
          await tx.product.update({
             where: { id: item.productId as string },
             data: { stock: { increment: qty } }
          });
          const txAny = tx as any;
          await txAny.stockMovement.create({
             data: {
                productId: item.productId,
                orderId: id,
                type: "ORDER_CANCEL",
                quantity: qty,
                previousStock: prev,
                newStock: prev + qty,
                reason: `Pedido ${id.slice(0,8)} excluído manualmente`,
                createdById: requesterId,
             }
          });
        }
      }

      await orderRepository.delete(id, tx);
    });

    try {
      await logAction({
        action: "DELETE",
        userId: requesterId,
        targetId: id,
        targetType: "ORDER",
        details: { customerName: existing.customerName, total: existing.total, status: existing.status },
      });
    } catch {}
  }
}

export const orderService = new OrderService();
