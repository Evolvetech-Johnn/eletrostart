import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = (req.query.search as string) || "";
    const activeRaw = req.query.active as string;
    
    // Pagination offset
    const skip = (page - 1) * limit;

    // Filters
    const whereCondition: any = {};
    
    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { document: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (activeRaw === "true") whereCondition.active = true;
    if (activeRaw === "false") whereCondition.active = false;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.customer.count({ where: whereCondition }),
    ]);

    res.json({
      success: true,
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: id as string },
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Cliente não encontrado" });
    }

    // Buscar últimos pedidos baseando-se no customerId ou customerEmail
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customerId: customer.id },
          ...(customer.email ? [{ customerEmail: customer.email }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20, // max 20 order history
      select: {
        id: true,
        createdAt: true,
        total: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        trackingCode: true,
      }
    });

    res.json({
      success: true,
      data: {
        customer,
        orders,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, document, active, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Nome e Telefone são obrigatórios" });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email: email || null,
        phone,
        document: document || null,
        active: active !== undefined ? active : true,
        notes: notes || null,
      },
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, email, phone, document, active, notes } = req.body;

    const customer = await prisma.customer.update({
      where: { id: id as string },
      data: {
        name,
        email: email || null,
        phone,
        document: document || null,
        active,
        notes: notes || null,
      },
    });

    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const toggleCustomerStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== "boolean") {
      return res.status(400).json({ success: false, message: "Status 'active' booleano é obrigatório" });
    }

    const customer = await prisma.customer.update({
      where: { id: id as string },
      data: { active },
    });

    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};
