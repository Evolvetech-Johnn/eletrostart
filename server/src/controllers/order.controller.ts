import { Request, Response } from "express";
import { prisma } from "../index.js";
import { Prisma } from "@prisma/client";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      customer, // { name, email, phone, doc }
      address, // { zip, street, number, comp, city, state }
      items, // [{ productId, quantity }]
      paymentMethod,
      notes,
    } = req.body;

    // Calculate totals and validate stock
    let subtotal = 0;
    const orderItemsData: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[] = [];

    // Use transaction to ensure stock is available and updated
    const order = await prisma.$transaction(async (tx) => {
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

        const price = Number(product.price);
        const quantity = Number(item.quantity);
        const total = price * quantity;
        subtotal += total;

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          quantity: quantity,
          unitPrice: price,
          totalPrice: total,
        });
      }

      const shippingCost = 0; // Fixed for now, or calculate
      const total = subtotal + shippingCost;

      // Create Order
      return await tx.order.create({
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
    });

    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    console.error("Error creating order:", error);
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
    const order = await prisma.order.findUnique({
      where: { id: id as string },
      include: {
        items: {
          include: { product: true },
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
    const { status, paymentStatus } = req.body;

    const data: Prisma.OrderUpdateInput = {};
    if (status) data.status = status as string;
    if (paymentStatus) data.paymentStatus = paymentStatus as string;

    const order = await prisma.order.update({
      where: { id: id as string },
      data,
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar status" });
  }
};
