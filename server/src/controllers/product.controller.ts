import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema";

// Helper to format product (MongoDB uses native JSON, no parsing needed)
const formatProduct = (product: any) => {
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

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    res.json({ success: true, data: categories });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar categorias",
      error: error.message, // Expose error for debugging
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findFirst({
      where: { slug: slug as string },
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
    res
      .status(500)
      .json({ success: false, message: "Erro ao buscar categoria" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image } = req.body;

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
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
  } catch (error: any) {
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

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;

    const data: Prisma.CategoryUpdateInput = {};
    if (name) {
      data.name = name;
      data.slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }
    if (description !== undefined) data.description = description;
    if (image !== undefined) data.image = image;

    const category = await prisma.category.update({
      where: { id: id as string },
      data,
    });

    res.json({ success: true, data: category });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar categoria" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId: id as string },
    });

    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Categoria possui ${productsCount} produtos vinculados. Remova ou reclassifique os produtos primeiro.`,
      });
    }

    await prisma.category.delete({ where: { id: id as string } });
    res.json({ success: true, message: "Categoria excluída" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao excluir categoria" });
  }
};

// --- Products ---

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      category,
      subcategory,
      search,
      featured,
      active,
      page = "1",
      limit = "20",
    } = req.query;

    const where: Prisma.ProductWhereInput = {};

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
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(category as string);

      const cat = await prisma.category.findFirst({
        where: isObjectId
          ? { OR: [{ slug: category as string }, { id: category as string }] }
          : { slug: category as string },
      });

      if (cat) {
        where.categoryId = cat.id;
      }
    }

    if (subcategory) {
      where.subcategory = subcategory as string;
    }

    if (featured === "true") where.featured = true;

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { sku: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: products.map(formatProduct),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao buscar produtos" });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id as string);

    // Try to find by ID or SKU
    const product = await prisma.product.findFirst({
      where: isObjectId
        ? { OR: [{ id: id as string }, { sku: id as string }] }
        : { sku: id as string },
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

export const createProduct = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = createProductSchema.parse(req.body);

    const {
      name,
      description,
      price,
      stock,
      sku,
      code,
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
    } = validatedData;

    // Check if SKU already exists if provided
    if (sku) {
      const existingProduct = await prisma.product.findFirst({
        where: { sku: sku },
      });
      if (existingProduct) {
        return res
          .status(400)
          .json({ success: false, message: "SKU já existe" });
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || `${name}. Produto de alta qualidade.`,
        price: price, // Already number from schema
        stock: stock, // Already number from schema
        sku: sku || undefined,
        code: code || undefined,
        image,
        unit: unit || "un",
        categoryId: categoryId || null,
        subcategory: subcategory || null,
        active: active !== undefined ? active : true,
        featured: featured !== undefined ? featured : false,
        // MongoDB native JSON - no stringify needed
        variants: variants || Prisma.JsonNull,
        features: features || Prisma.JsonNull,
        specifications: specifications || Prisma.JsonNull,
        images: images || Prisma.JsonNull,
      },
    });

    res.status(201).json({ success: true, data: formatProduct(product) });
  } catch (error: any) {
    console.error("Error creating product:", error);

    // Zod validation error handling
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Erro de validação",
        errors: error.errors,
      });
    }

    if (error.code === "P2002") {
      return res.status(400).json({ success: false, message: "SKU já existe" });
    }
    res.status(500).json({ success: false, message: "Erro ao criar produto" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate request body
    const validatedData = updateProductSchema.parse(req.body);

    const {
      name,
      description,
      price,
      stock,
      sku,
      code,
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
    } = validatedData;

    const data: Prisma.ProductUpdateInput = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = price;
    if (stock !== undefined) data.stock = stock;
    if (sku) data.sku = sku;
    if (code) data.code = code;
    if (image !== undefined) data.image = image;
    if (unit) data.unit = unit;
    if (categoryId !== undefined) {
      if (categoryId) {
        data.category = { connect: { id: categoryId } };
      } else {
        data.category = { disconnect: true };
      }
    }
    if (subcategory !== undefined) data.subcategory = subcategory;
    if (active !== undefined) data.active = active;
    if (featured !== undefined) data.featured = featured;
    // MongoDB native JSON - no stringify needed
    if (variants !== undefined) data.variants = variants;
    if (features !== undefined) data.features = features;
    if (specifications !== undefined) data.specifications = specifications;
    if (images !== undefined) data.images = images;

    const product = await prisma.product.update({
      where: { id: id as string },
      data,
      include: { category: true },
    });

    res.json({ success: true, data: formatProduct(product) });
  } catch (error: any) {
    console.error("Error updating product:", error);

    // Zod validation error handling
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Erro de validação",
        errors: error.errors,
      });
    }

    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });
    }
    res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar produto" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if product is in any order
    const hasOrders = await prisma.orderItem.findFirst({
      where: { productId: id as string },
    });

    if (hasOrders) {
      // Soft delete - keep product but mark as inactive
      await prisma.product.update({
        where: { id: id as string },
        data: { active: false },
      });
      return res.json({
        success: true,
        message: "Produto desativado pois possui pedidos vinculados",
      });
    }

    await prisma.product.delete({ where: { id: id as string } });
    res.json({ success: true, message: "Produto excluído permanentemente" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });
    }
    res
      .status(500)
      .json({ success: false, message: "Erro ao excluir produto" });
  }
};

// --- Bulk Operations ---

export const bulkUpdateProducts = async (req: Request, res: Response) => {
  try {
    const { ids, data } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "IDs são obrigatórios" });
    }

    const updateData: Prisma.ProductUpdateManyMutationInput = {};
    if (data.active !== undefined) updateData.active = data.active;
    if (data.featured !== undefined) updateData.featured = data.featured;
    // updateMany does not support relation updates like categoryId easily without direct scalar field access
    // if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.price !== undefined) updateData.price = parseFloat(data.price);

    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    });

    res.json({
      success: true,
      message: `${result.count} produtos atualizados`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error bulk updating products:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar produtos" });
  }
};

export const bulkDeleteProducts = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "IDs são obrigatórios" });
    }

    // Check which products have orders
    const productsWithOrders = await prisma.orderItem.findMany({
      where: { productId: { in: ids } },
      select: { productId: true },
      distinct: ["productId"],
    });

    const idsWithOrders = productsWithOrders
      .map((p) => p.productId)
      .filter((id): id is string => id !== null);

    const idsToDelete = ids.filter((id) => !idsWithOrders.includes(id));

    // Soft delete products with orders
    if (idsWithOrders.length > 0) {
      await prisma.product.updateMany({
        where: { id: { in: idsWithOrders } },
        data: { active: false },
      });
    }

    // Hard delete products without orders
    if (idsToDelete.length > 0) {
      await prisma.product.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }

    res.json({
      success: true,
      message: `${idsToDelete.length} produtos excluídos, ${idsWithOrders.length} desativados`,
      deleted: idsToDelete.length,
      deactivated: idsWithOrders.length,
    });
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao excluir produtos" });
  }
};

// --- Stats ---

export const getProductStats = async (req: Request, res: Response) => {
  try {
    const [total, active, featured, outOfStock, categories] = await Promise.all(
      [
        prisma.product.count(),
        prisma.product.count({ where: { active: true } }),
        prisma.product.count({ where: { featured: true } }),
        prisma.product.count({ where: { stock: 0 } }),
        prisma.category.findMany({
          include: { _count: { select: { products: true } } },
        }),
      ],
    );

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        featured,
        outOfStock,
        byCategory: categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          count: c._count.products,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching product stats:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao buscar estatísticas" });
  }
};
