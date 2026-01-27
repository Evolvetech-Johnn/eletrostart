import { prisma } from "../index.js";

// Helper to format product (MongoDB uses native JSON, no parsing needed)
const formatProduct = (product) => {
  if (!product) return null;
  return {
    ...product,
    variants: product.variants || [],
    features: product.features || [],
    specifications: product.specifications || {},
    images: product.images || [],
    price: parseFloat(product.price),
  };
};

// --- Categories ---

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ 
        success: false, 
        message: "Erro ao buscar categorias",
        error: error.message, // Expose error for debugging
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findFirst({
      where: { slug },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Categoria não encontrada" });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar categoria" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
      },
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ success: false, message: "Categoria já existe" });
    }
    console.error("Error creating category:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao criar categoria" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;

    const data = {};
    if (name) {
      data.name = name;
      data.slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }
    if (description !== undefined) data.description = description;
    if (image !== undefined) data.image = image;

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao atualizar categoria" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId: id }
    });
    
    if (productsCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Categoria possui ${productsCount} produtos vinculados. Remova ou reclassifique os produtos primeiro.` 
      });
    }
    
    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: "Categoria excluída" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao excluir categoria" });
  }
};

// --- Products ---

export const getProducts = async (req, res) => {
  try {
    const { category, subcategory, search, featured, active, page = 1, limit = 20 } = req.query;

    const where = {};

    // Filter by active status (default: only active for public)
    if (active === "false") {
      where.active = false;
    } else if (active === "all") {
      // Show all (admin view)
    } else {
      where.active = true;
    }

    // Filter by category (can be slug or ID)
    if (category) {
      // Try to find category by slug first
      const cat = await prisma.category.findFirst({
        where: { 
          OR: [
            { slug: category },
            { id: category }
          ]
        }
      });
      if (cat) {
        where.categoryId = cat.id;
      }
    }
    
    if (subcategory) {
      where.subcategory = subcategory;
    }
    
    if (featured === "true") where.featured = true;
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: products.map(formatProduct),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao buscar produtos" });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by ID or SKU
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id },
          { sku: id }
        ]
      },
      include: { category: true },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });
    }

    res.json({ success: true, data: formatProduct(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar produto" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      sku,
      image,
      unit,
      categoryId,
      subcategory,
      active,
      featured,
      variants,
      features,
      specifications,
      images,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ success: false, message: "Nome é obrigatório" });
    }

    // Generate SKU if not provided
    const finalSku = sku || name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const product = await prisma.product.create({
      data: {
        name,
        description: description || `${name}. Produto de alta qualidade.`,
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        sku: finalSku,
        image,
        unit: unit || 'un',
        categoryId: categoryId || null,
        subcategory: subcategory || null,
        active: active !== undefined ? active : true,
        featured: featured !== undefined ? featured : false,
        // MongoDB native JSON - no stringify needed
        variants: variants || null,
        features: features || null,
        specifications: specifications || null,
        images: images || null,
      },
    });

    res.status(201).json({ success: true, data: formatProduct(product) });
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ success: false, message: "SKU já existe" });
    }
    res.status(500).json({ success: false, message: "Erro ao criar produto" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      stock,
      sku,
      image,
      unit,
      categoryId,
      subcategory,
      active,
      featured,
      variants,
      features,
      specifications,
      images,
    } = req.body;

    const data = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (stock !== undefined) data.stock = parseInt(stock);
    if (sku) data.sku = sku;
    if (image !== undefined) data.image = image;
    if (unit) data.unit = unit;
    if (categoryId !== undefined) data.categoryId = categoryId || null;
    if (subcategory !== undefined) data.subcategory = subcategory;
    if (active !== undefined) data.active = active;
    if (featured !== undefined) data.featured = featured;
    // MongoDB native JSON - no stringify needed
    if (variants !== undefined) data.variants = variants;
    if (features !== undefined) data.features = features;
    if (specifications !== undefined) data.specifications = specifications;
    if (images !== undefined) data.images = images;

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    res.json({ success: true, data: formatProduct(product) });
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Produto não encontrado" });
    }
    res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar produto" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product is in any order
    const hasOrders = await prisma.orderItem.findFirst({
      where: { productId: id },
    });

    if (hasOrders) {
      // Soft delete - keep product but mark as inactive
      await prisma.product.update({
        where: { id },
        data: { active: false },
      });
      return res.json({
        success: true,
        message: "Produto desativado pois possui pedidos vinculados",
      });
    }

    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: "Produto excluído permanentemente" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Produto não encontrado" });
    }
    res
      .status(500)
      .json({ success: false, message: "Erro ao excluir produto" });
  }
};

// --- Bulk Operations ---

export const bulkUpdateProducts = async (req, res) => {
  try {
    const { ids, data } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "IDs são obrigatórios" });
    }

    const updateData = {};
    if (data.active !== undefined) updateData.active = data.active;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.price !== undefined) updateData.price = parseFloat(data.price);

    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    });

    res.json({ 
      success: true, 
      message: `${result.count} produtos atualizados`,
      count: result.count
    });
  } catch (error) {
    console.error("Error bulk updating products:", error);
    res.status(500).json({ success: false, message: "Erro ao atualizar produtos" });
  }
};

export const bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "IDs são obrigatórios" });
    }

    // Check which products have orders
    const productsWithOrders = await prisma.orderItem.findMany({
      where: { productId: { in: ids } },
      select: { productId: true },
      distinct: ['productId']
    });

    const idsWithOrders = productsWithOrders.map(p => p.productId);
    const idsToDelete = ids.filter(id => !idsWithOrders.includes(id));
    
    // Soft delete products with orders
    if (idsWithOrders.length > 0) {
      await prisma.product.updateMany({
        where: { id: { in: idsWithOrders } },
        data: { active: false }
      });
    }

    // Hard delete products without orders
    if (idsToDelete.length > 0) {
      await prisma.product.deleteMany({
        where: { id: { in: idsToDelete } }
      });
    }

    res.json({ 
      success: true, 
      message: `${idsToDelete.length} produtos excluídos, ${idsWithOrders.length} desativados`,
      deleted: idsToDelete.length,
      deactivated: idsWithOrders.length
    });
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    res.status(500).json({ success: false, message: "Erro ao excluir produtos" });
  }
};

// --- Stats ---

export const getProductStats = async (req, res) => {
  try {
    const [total, active, featured, outOfStock, categories] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({ where: { featured: true } }),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.category.findMany({
        include: { _count: { select: { products: true } } }
      })
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        featured,
        outOfStock,
        byCategory: categories.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          count: c._count.products
        }))
      }
    });
  } catch (error) {
    console.error("Error fetching product stats:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar estatísticas" });
  }
};
