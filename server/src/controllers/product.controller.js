import { prisma } from '../index.js';

// --- Categories ---

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } }
      }
    });
    
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar categorias" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image
      }
    });
    
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: "Categoria já existe" });
    }
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: "Erro ao criar categoria" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: "Categoria excluída" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao excluir categoria" });
  }
};

// --- Products ---

export const getProducts = async (req, res) => {
  try {
    const { category, search, featured, page = 1, limit = 20 } = req.query;
    
    const where = { active: true };
    
    if (category) where.categoryId = category;
    if (featured === 'true') where.featured = true;
    if (search) {
      where.OR = [
        { name: { contains: search } }, // sqlite case-insensitive depends on collation, usually simple contains
        { description: { contains: search } },
        { sku: { contains: search } }
      ];
    }

    // Admin view might want inactive products too, handled by separate endpoint or param
    if (req.user && req.user.role === 'ADMIN' && req.query.all === 'true') {
        delete where.active;
    }

    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar produtos" });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Produto não encontrado" });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar produto" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { 
      name, description, price, stock, sku, image, unit, 
      categoryId, active, featured 
    } = req.body;
    
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        sku,
        image,
        unit,
        categoryId,
        active: active !== undefined ? active : true,
        featured: featured !== undefined ? featured : false
      }
    });
    
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: "SKU já existe" });
    }
    res.status(500).json({ success: false, message: "Erro ao criar produto" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, description, price, stock, sku, image, unit, 
      categoryId, active, featured 
    } = req.body;
    
    const data = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (price) data.price = parseFloat(price);
    if (stock !== undefined) data.stock = parseInt(stock);
    if (sku) data.sku = sku;
    if (image !== undefined) data.image = image;
    if (unit) data.unit = unit;
    if (categoryId) data.categoryId = categoryId;
    if (active !== undefined) data.active = active;
    if (featured !== undefined) data.featured = featured;

    const product = await prisma.product.update({
      where: { id },
      data
    });
    
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Erro ao atualizar produto" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if product is in any order
    const hasOrders = await prisma.orderItem.findFirst({ where: { productId: id } });
    
    if (hasOrders) {
      // Soft delete
      await prisma.product.update({
        where: { id },
        data: { active: false }
      });
      return res.json({ success: true, message: "Produto desativado pois possui pedidos vinculados" });
    }
    
    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: "Produto excluído" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao excluir produto" });
  }
};
