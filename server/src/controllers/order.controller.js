import { prisma } from '../index.js';

export const createOrder = async (req, res) => {
  try {
    const { 
      customer, // { name, email, phone, doc }
      address,  // { zip, street, number, comp, city, state }
      items,    // [{ productId, quantity }]
      paymentMethod,
      notes
    } = req.body;

    // Calculate totals and validate stock
    let subtotal = 0;
    const orderItemsData = [];

    // Use transaction to ensure stock is available and updated
    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        
        if (!product) {
          throw new Error(`Produto ${item.productId} não encontrado`);
        }
        
        if (product.stock < item.quantity) {
          throw new Error(`Estoque insuficiente para ${product.name}`);
        }
        
        // Decrement stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
        
        const price = parseFloat(product.price);
        const total = price * item.quantity;
        subtotal += total;
        
        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: price,
          totalPrice: total
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
            create: orderItemsData
          }
        },
        include: { items: true }
      });
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(400).json({ success: false, message: error.message || "Erro ao criar pedido" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { id: { contains: search } }
      ];
    }
    
    const total = await prisma.order.count({ where });
    const orders = await prisma.order.findMany({
      where,
      include: { 
        items: true,
        _count: { select: { items: true } }
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar pedidos" });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { 
        items: {
          include: { product: true }
        }
      }
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar pedido" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    
    const data = {};
    if (status) data.status = status;
    if (paymentStatus) data.paymentStatus = paymentStatus;
    
    const order = await prisma.order.update({
      where: { id },
      data
    });
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao atualizar status" });
  }
};
