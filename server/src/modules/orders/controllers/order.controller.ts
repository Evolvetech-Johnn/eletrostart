import { Request, Response } from "express";
import { createOrderSchema } from "../../../schemas/order.schema";
import { orderService } from "../services/order.service";
import { orderRepository } from "../repositories/order.repository";
import { prisma } from "../../../lib/prisma"; // only for getOrderPublic direct read if needed, though better through repo

export const createOrder = async (req: Request, res: Response) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    const { customer, address, items, paymentMethod, notes } = validatedData;

    const order = await orderService.createOrder(validatedData, customer, address, items, notes || "");

    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, message: "Erro de validação", errors: error.errors });
    }
    console.error("Error creating order:", error);
    res.status(400).json({ success: false, message: error.message || "Erro ao criar pedido" });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const result = await orderService.getOrders(req.query);
    res.json({
      success: true,
      data: result.orders,
      pagination: {
        total: result.total,
        page: result.pageNum,
        limit: result.limitNum,
        totalPages: Math.ceil(result.total / result.limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar pedidos" });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const order = await orderRepository.findById(req.params.id as string);
    if (!order) return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar pedido" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const requesterId = (req as any).user?.id;
    const order = await orderService.updateOrderStatus(req.params.id as string, requesterId, req.body);
    res.json({ success: true, data: order });
  } catch (error: any) {
    if (error.message === "ORDER_NOT_FOUND") return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    if (error.message?.startsWith("INVALID_TRANSITION")) {
      const [, transition] = error.message.split(":");
      return res.status(400).json({ success: false, message: `Transição inválida: ${transition}` });
    }
    if (error.message?.startsWith("Estoque insuficiente")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("Error updating status:", error);
    res.status(500).json({ success: false, message: "Erro ao atualizar status" });
  }
};

export const getOrderPublic = async (req: Request, res: Response) => {
  try {
    const order = await orderRepository.findByIdPublic(req.params.id as string);
    if (!order) return res.status(404).json({ success: false, message: "Pedido não encontrado" });

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
        customerName: order.customerName,
        customerEmail: order.customerEmail ? order.customerEmail.replace(/(.{2}).*(@.*)/, "$1***$2") : null,
      },
    });
  } catch (error) {
    console.error("Error fetching public order:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar pedido" });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const requesterId = (req as any).user?.id;
    const body = req.body;

    const existing = await orderRepository.findByIdMinimal(id);
    if (!existing) return res.status(404).json({ success: false, message: "Pedido não encontrado" });

    const data: any = {};
    const updatable = ["customerName", "customerEmail", "customerPhone", "customerDoc", "addressZip", "addressStreet", "addressNumber", "addressComp", "addressCity", "addressState", "notes"];
    updatable.forEach((field) => { if (body[field] !== undefined) data[field] = body[field]; });

    const updated = await orderRepository.update(id, data);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao atualizar pedido" });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const requesterId = (req as any).user?.id;
    await orderService.deleteOrder(req.params.id as string, requesterId);
    res.json({ success: true, message: "Pedido excluído com sucesso" });
  } catch (error: any) {
    if (error.message === "ORDER_NOT_FOUND") return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    console.error("Error deleting order:", error);
    res.status(500).json({ success: false, message: "Erro ao excluir pedido" });
  }
};
