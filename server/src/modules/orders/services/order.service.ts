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
import { STOCK_DEBITED_STATUSES, OrderStatus, LEGACY_STATUS_MAP } from "../../../constants/orderStatus";
import { isStatusAllowed } from "../../../utils/orderStatusRules";
import { notificationService } from "./notification.service";
import { whatsappService } from "./whatsapp.service";
import { releaseSessionReservations } from "../../../services/reservation.service";

export class OrderService {
  /**
   * Complex business logic for order creation inside an atomic transaction.
   * Debits stock and creates history/movements.
   */
  async createOrder(data: any, customer: any, address: any, items: any[], notes: string) {
    let subtotal = 0;
    const orderItemsData: any[] = [];
    const sessionId = data.sessionId;

    const order = await prisma.$transaction(async (tx) => {
      // 1. Libera reservas se houver uma sessão
      if (sessionId) {
        await releaseSessionReservations(sessionId, tx);
      }

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
        status: "aguardando",
        deliveryMode: data.deliveryMode || "entrega",
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

      const waMessage = whatsappService.generateOrderMessage({
        orderNumber,
        customerName: customer.name,
        status: "aguardando",
        total,
        deliveryMode: data.deliveryMode || "entrega",
      });

      await orderRepository.update(createdOrder.id, {
        whatsappMessage: waMessage,
        whatsappMessageGenerated: true
      }, tx);

      await orderRepository.addStatusHistory({
        orderId: createdOrder.id,
        status: "aguardando",
        fromStatus: null,
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

    await notificationService.createNotification({
      type: "order_created",
      title: "Novo pedido recebido",
      message: `Pedido #${order.orderNumber} de ${order.customerName} no valor de ${order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
      orderId: order.id,
      priority: "medium",
      metadata: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: order.total,
        deliveryMode: order.deliveryMode,
      }
    });

    const emailDetails = orderToMessageDetails(order);
    const emailPreview = buildOrderEmailTemplates(emailDetails);
    
      await logAction({
        action: "ORDER_CREATED",
        targetType: "ORDER",
        targetId: order.id,
        details: { emailSubject: emailPreview.subject, emailTo: order.customerEmail },
      });
    
    // Marcar como notificado internamente
    await orderRepository.update(order.id, { internalNotificationCreated: true });

    await sendEmail(emailDetails);
    return order;
  }

  /**
   * Fetches paginated orders
   */
  async getOrders(query: any) {
    const { status, deliveryMode, search, page = "1", limit = "20" } = query;
    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status as string;
    if (deliveryMode) where.deliveryMode = deliveryMode as string;
    if (search) {
      where.OR = [
        { customerName: { contains: search as string, mode: 'insensitive' } },
        { customerEmail: { contains: search as string, mode: 'insensitive' } },
        { orderNumber: { contains: search as string, mode: 'insensitive' } },
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
        const prevStatus = (existing.status || "aguardando") as OrderStatus;
        const nextStatus = (LEGACY_STATUS_MAP[status] || status) as OrderStatus;

        // Validação rigorosa do PRD
        if (!isStatusAllowed(existing.deliveryMode as any, nextStatus)) {
          throw new Error(`Status ${nextStatus} não é permitido para o modo ${existing.deliveryMode}`);
        }

        updateData.status = nextStatus;

        // Gerar nova mensagem WhatsApp se o status mudou para algo relevante
        const newWAMessage = whatsappService.generateOrderMessage({
          orderNumber: existing.orderNumber,
          customerName: existing.customerName,
          status: nextStatus,
          total: existing.total,
          deliveryMode: existing.deliveryMode,
        });
        updateData.whatsappMessage = newWAMessage;

        const isCancelingNow  = nextStatus === "cancelado" && prevStatus !== "cancelado";
        const isRestoringFromCancel = nextStatus !== "cancelado" && prevStatus === "cancelado";

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
          status: updated.status,
          fromStatus: existing.status,
          changedById: requesterId,
          notes: payload.note || "Status atualizado pelo administrativo",
        }, tx);

        // Notificação interna de mudança de status
        await notificationService.createNotification({
          type: "order_status_updated",
          title: "Status de pedido atualizado",
          message: `Pedido #${existing.orderNumber} mudou para ${updated.status}.`,
          orderId: existing.id,
          priority: "low",
          metadata: { orderNumber: existing.orderNumber, status: updated.status }
        });
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
