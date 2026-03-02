import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { createOrderSchema } from "../schemas/order.schema";
import { logAction } from "../services/audit.service";
import {
  buildOrderEmailTemplates,
  orderToMessageDetails,
  sendEmail,
} from "../services/emailTemplates.service";

export const createOrder = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = createOrderSchema.parse(req.body);

    const { customer, address, items, paymentMethod, notes } = validatedData;

    // Calculate totals and validate stock
    let subtotal = 0;
    const orderItemsData: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[] = [];

    const itemsForDiscord: {
      productName: string;
      quantity: number;
      unitPrice: number;
      code?: string;
    }[] = [];

    // Use transaction to ensure stock is available and updated
    const order = await prisma.$transaction(async (tx) => {
      const stockMovements: {
        productId: string;
        previousStock: number;
        newStock: number;
        quantity: number;
      }[] = [];
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Produto ${item.productId} não encontrado`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Estoque insuficiente para ${product.name}`);
        }

        // Decrement stock
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
        const quantity = Number(item.quantity);
        const total = price * quantity;
        subtotal += total;

        const itemData = {
          productId: product.id,
          productName: product.name,
          quantity: quantity,
          unitPrice: price,
          totalPrice: total,
        };

        orderItemsData.push(itemData);

        itemsForDiscord.push({
          productName: product.name,
          quantity: quantity,
          unitPrice: price,
          code: product.code || undefined,
        });
      }

      const shippingCost = 0; // Fixed for now, or calculate
      const total = subtotal + shippingCost;

      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          customerDoc: customer.doc,

          addressZip: address.zip,
          addressStreet: address.street,
          addressNumber: address.number,
          addressComp: address.comp,
          addressCity: address.city,
          addressState: address.state,

          subtotal,
          shippingCost,
          total,

          paymentMethod,
          notes,

          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      await (tx as any).orderStatusHistory.create({
        data: {
          orderId: createdOrder.id,
          status: createdOrder.status,
          notes: "Pedido criado",
        },
      });

      for (const m of stockMovements) {
        await (tx as any).stockMovement.create({
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
    console.log("EMAIL_PREVIEW_TO:", detailsForEmail.customerEmail);
    console.log("EMAIL_PREVIEW_TEXT:", preview.text);
    try {
      await logAction({
        action: "EXPORT",
        targetType: "ORDER",
        targetId: order.id,
        details: {
          emailSubject: preview.subject,
          emailTo: detailsForEmail.customerEmail,
        },
      });
    } catch {}
    await sendEmail(detailsForEmail);

    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    console.error("Error creating order:", error);

    // Zod validation error handling
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Erro de validação",
        errors: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Erro ao criar pedido",
    });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { status, search, page = "1", limit = "20" } = req.query;

    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status as string;
    if (search) {
      where.OR = [
        { customerName: { contains: search as string } },
        { customerEmail: { contains: search as string } },
        { id: { contains: search as string } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const total = await prisma.order.count({ where });
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        _count: { select: { items: true } },
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar pedidos" });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await (prisma as any).order.findUnique({
      where: { id: id as string },
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

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Pedido não encontrado" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar pedido" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, trackingCode } = req.body;
    const requesterId = (req as any).user?.id || undefined;

    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id: id as string },
        include: { items: true },
      });

      if (!existing) {
        throw new Error("ORDER_NOT_FOUND");
      }

      const data: any = {};
      if (status) data.status = status as string;
      if (paymentStatus) data.paymentStatus = paymentStatus as string;
      if (trackingCode !== undefined) {
        data.trackingCode = trackingCode as string;
      }

      if (status && existing.status !== status) {
        const previousStatus = existing.status as string;
        const nextStatus = status as string;

        if (previousStatus !== "CANCELLED" && nextStatus === "CANCELLED") {
          for (const item of (existing as any).items) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
            });
            const prev = Number(product?.stock ?? 0);
            const qty = Number(item.quantity);
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: qty } },
            });
            const next = prev + qty;
            await (tx as any).stockMovement.create({
              data: {
                productId: item.productId,
                orderId: existing.id,
                type: "ORDER_CANCEL",
                quantity: qty,
                previousStock: prev,
                newStock: next,
                reason: "Cancelamento de pedido",
                createdById: requesterId,
              },
            });
          }
        } else if (
          previousStatus === "CANCELLED" &&
          nextStatus !== "CANCELLED"
        ) {
          for (const item of (existing as any).items) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
            });
            if (!product) {
              throw new Error(`Produto ${item.productId} não encontrado`);
            }
            if (product.stock < item.quantity) {
              throw new Error(
                `Estoque insuficiente para ${item.productName || product.name}`,
              );
            }
          }
          for (const item of (existing as any).items) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
            });
            const prev = Number(product?.stock ?? 0);
            const qty = Number(item.quantity);
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: qty } },
            });
            const next = prev - qty;
            await (tx as any).stockMovement.create({
              data: {
                productId: item.productId,
                orderId: existing.id,
                type: "ORDER_RESTORE",
                quantity: qty,
                previousStock: prev,
                newStock: next,
                reason: "Reativação de pedido cancelado",
                createdById: requesterId,
              },
            });
          }
        }
      }

      const updated = await tx.order.update({
        where: { id: id as string },
        data,
      });

      if (status && existing.status !== status) {
        await (tx as any).orderStatusHistory.create({
          data: {
            orderId: updated.id,
            status: status as string,
            changedById: requesterId,
          },
        });
      }

      return updated;
    });

    try {
      const details: any = {
        previousStatus: (order as any).statusHistory?.at?.(-2)?.status,
        newStatus: order.status,
      };
      if (trackingCode !== undefined) {
        details.trackingCode = trackingCode;
      }
      await logAction({
        action: "UPDATE",
        userId: requesterId,
        targetId: order.id,
        targetType: "ORDER",
        details,
      });
    } catch {
      // Audit failures não devem quebrar fluxo principal
    }

    res.json({ success: true, data: order });
  } catch (error: any) {
    if (error.message === "ORDER_NOT_FOUND") {
      return res
        .status(404)
        .json({ success: false, message: "Pedido não encontrado" });
    }
    if (error.message && error.message.startsWith("Estoque insuficiente")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar status" });
  }
};

export const getOrderPublic = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        statusHistory: {
          orderBy: { createdAt: "asc" },
          select: { status: true, notes: true, createdAt: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    }

    // Return only non-sensitive fields
    res.json({
      success: true,
      data: {
        id: order.id,
        status: order.status,
        trackingCode: order.trackingCode,
        paymentMethod: order.paymentMethod,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        statusHistory: (order as any).statusHistory ?? [],
        // Partial customer info only
        customerName: order.customerName,
        // Masked email: jo***@gmail.com
        customerEmail: order.customerEmail
          ? order.customerEmail.replace(/(.{2}).*(@.*)/, "$1***$2")
          : null,
      },
    });
  } catch (error: any) {
    console.error("Error fetching public order:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar pedido" });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const body = req.body as Record<string, string | undefined>;
    const {
      customerName, customerEmail, customerPhone, customerDoc,
      addressZip, addressStreet, addressNumber, addressComp, addressCity, addressState,
      notes,
    } = body;
    const requesterId = (req as any).user?.id as string | undefined;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    }

    const data: any = {};
    if (customerName !== undefined)   data.customerName   = customerName;
    if (customerEmail !== undefined)  data.customerEmail  = customerEmail;
    if (customerPhone !== undefined)  data.customerPhone  = customerPhone;
    if (customerDoc !== undefined)    data.customerDoc    = customerDoc;
    if (addressZip !== undefined)     data.addressZip     = addressZip;
    if (addressStreet !== undefined)  data.addressStreet  = addressStreet;
    if (addressNumber !== undefined)  data.addressNumber  = addressNumber;
    if (addressComp !== undefined)    data.addressComp    = addressComp;
    if (addressCity !== undefined)    data.addressCity    = addressCity;
    if (addressState !== undefined)   data.addressState   = addressState;
    if (notes !== undefined)          data.notes          = notes;

    const updated = await prisma.order.update({ where: { id }, data });

    try {
      await logAction({
        action: "UPDATE",
        userId: requesterId,
        targetId: id,
        targetType: "ORDER",
        details: { fields: Object.keys(data) },
      });
    } catch {}

    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: "Erro ao atualizar pedido" });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const requesterId = (req as any).user?.id as string | undefined;

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    }

    await prisma.$transaction(async (tx) => {
      // Restore stock only if order was NOT cancelled (cancelled already restored stock)
      if (existing.status !== "CANCELLED") {
        for (const item of (existing as any).items) {
          const product = await tx.product.findUnique({ where: { id: item.productId as string } });
          const prev = Number(product?.stock ?? 0);
          const qty = Number(item.quantity);
          await tx.product.update({
            where: { id: item.productId as string },
            data: { stock: { increment: qty } },
          });
          await (tx as any).stockMovement.create({
            data: {
              productId: item.productId,
              orderId: existing.id,
              type: "ORDER_CANCEL",
              quantity: qty,
              previousStock: prev,
              newStock: prev + qty,
              reason: `Pedido ${existing.id.slice(0, 8)} excluído manualmente`,
              createdById: requesterId,
            },
          });
        }
      }

      // Delete related records first (cascade not guaranteed)
      await (tx as any).orderStatusHistory.deleteMany({ where: { orderId: id as string } });
      await tx.orderItem.deleteMany({ where: { orderId: id as string } });
      await tx.order.delete({ where: { id: id as string } });
    });

    try {
      await logAction({
        action: "DELETE",
        userId: requesterId,
        targetId: id,
        targetType: "ORDER",
        details: {
          customerName: existing.customerName,
          total: existing.total,
          status: existing.status,
        },
      });
    } catch {}

    res.json({ success: true, message: "Pedido excluído com sucesso" });
  } catch (error: any) {
    console.error("Error deleting order:", error);
    res.status(500).json({ success: false, message: "Erro ao excluir pedido" });
  }
};
