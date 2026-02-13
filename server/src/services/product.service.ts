import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { logAction } from "./audit.service";
import { importExportService } from "./importExport.service";
import { googleSheetsService } from "./googleSheets.service";

// Helper to format product
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

export const listProducts = async (params: any) => {
  const {
    category,
    subcategory,
    search,
    featured,
    active,
    page = "1",
    limit = "20",
  } = params;

  const where: Prisma.ProductWhereInput = {};

  if (active === "false") {
    where.active = false;
  } else if (active === "all") {
    // Show all
  } else {
    where.active = true;
  }

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

  if (subcategory) where.subcategory = subcategory as string;
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

  return {
    products: products.map(formatProduct),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export const getProduct = async (idOrSku: string) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSku);

  const product = await prisma.product.findFirst({
    where: isObjectId
      ? { OR: [{ id: idOrSku }, { sku: idOrSku }] }
      : { sku: idOrSku },
    include: { category: true },
  });

  return formatProduct(product);
};

export const createProduct = async (data: any, userId: string = "unknown") => {
  // Check if SKU already exists
  if (data.sku) {
    const existing = await prisma.product.findFirst({ where: { sku: data.sku } });
    if (existing) throw new Error("SKU já existe");
  }

  const product = await prisma.product.create({
    data: {
      ...data,
      variants: data.variants || Prisma.JsonNull,
      features: data.features || Prisma.JsonNull,
      specifications: data.specifications || Prisma.JsonNull,
      images: data.images || Prisma.JsonNull,
    },
  });

  logAction({
    action: "CREATE",
    userId,
    targetId: product.id,
    targetType: "PRODUCT",
    details: { name: product.name, sku: product.sku, price: product.price },
  });

  return formatProduct(product);
};

export const updateProduct = async (id: string, data: any, userId: string = "unknown") => {
  // Handle category connect/disconnect logic if present in data
  // For simplicity, we assume controller passes cleaner data or we handle it here
  // But wait, the controller had specific logic for category connection. 
  // We'll trust the caller passes Prisma-compatible structure or we adapt.
  // The controller logic was:
  // if (categoryId) data.category = { connect: { id: categoryId } }
  // Let's assume the controller prepares `data` or we do it here.
  // To keep service clean, let's assume `data` is ready for Prisma Update, 
  // EXCEPT for the complex fields like variants/json.
  
  // Actually, better to replicate the logic here to keep controller really thin.
  const updateData: any = { ...data };
  
  // JSON fields handling
  if (data.variants !== undefined) updateData.variants = data.variants;
  if (data.features !== undefined) updateData.features = data.features;
  if (data.specifications !== undefined) updateData.specifications = data.specifications;
  if (data.images !== undefined) updateData.images = data.images;

  // Category handling
  if (data.categoryId !== undefined) {
      if (data.categoryId) {
        updateData.category = { connect: { id: data.categoryId } };
      } else {
        updateData.category = { disconnect: true };
      }
      delete updateData.categoryId;
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: { category: true },
  });

  logAction({
    action: "UPDATE",
    userId,
    targetId: product.id,
    targetType: "PRODUCT",
    details: data,
  });

  return formatProduct(product);
};

export const deleteProduct = async (id: string, userId: string = "unknown") => {
  const hasOrders = await prisma.orderItem.findFirst({
    where: { productId: id },
  });

  if (hasOrders) {
    await prisma.product.update({
      where: { id },
      data: { active: false },
    });
    return { action: "deactivated", message: "Produto desativado pois possui pedidos vinculados" };
  }

  await prisma.product.delete({ where: { id } });

  logAction({
    action: "DELETE",
    userId,
    targetId: id,
    targetType: "PRODUCT",
    details: "Permanent deletion",
  });

  return { action: "deleted", message: "Produto excluído permanentemente" };
};

export const bulkUpdate = async (ids: string[], data: any, userId: string = "unknown") => {
  const updateData: Prisma.ProductUpdateManyMutationInput = {};
  if (data.active !== undefined) updateData.active = data.active;
  if (data.featured !== undefined) updateData.featured = data.featured;
  if (data.price !== undefined) updateData.price = parseFloat(data.price);

  const result = await prisma.product.updateMany({
    where: { id: { in: ids } },
    data: updateData,
  });

  logAction({
    action: "BULK_UPDATE",
    userId,
    targetType: "PRODUCT",
    details: { idsCount: ids.length, updates: updateData },
  });

  return result.count;
};

export const bulkDelete = async (ids: string[], userId: string = "unknown") => {
  const productsWithOrders = await prisma.orderItem.findMany({
    where: { productId: { in: ids } },
    select: { productId: true },
    distinct: ["productId"],
  });

  const idsWithOrders = productsWithOrders
    .map((p) => p.productId)
    .filter((id): id is string => id !== null);

  const idsToDelete = ids.filter((id) => !idsWithOrders.includes(id));

  if (idsWithOrders.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: idsWithOrders } },
      data: { active: false },
    });
  }

  if (idsToDelete.length > 0) {
    await prisma.product.deleteMany({
      where: { id: { in: idsToDelete } },
    });
  }

  logAction({
    action: "BULK_DELETE",
    userId,
    targetType: "PRODUCT",
    details: { deleted: idsToDelete.length, deactivated: idsWithOrders.length },
  });

  return { deleted: idsToDelete.length, deactivated: idsWithOrders.length };
};

export const processImport = async (fileBuffer: Buffer, mimeType: string, userId: string = "unknown") => {
  const importedData = await importExportService.parseImportFile(fileBuffer, mimeType);

  let createdCount = 0;
  let updatedCount = 0;
  let errors: any[] = [];

  for (const item of importedData) {
    try {
      const existing = await prisma.product.findFirst({
        where: { sku: item.sku },
      });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: item.name || undefined,
            price: item.price,
            stock: item.stock,
            active: item.active,
            description: item.description || undefined,
            image: item.image || undefined,
          },
        });
        updatedCount++;
      } else {
        await prisma.product.create({
          data: {
            sku: item.sku,
            name: item.name,
            price: item.price || 0,
            stock: item.stock || 0,
            active: item.active !== undefined ? item.active : true,
            description: item.description || "",
            image: item.image,
          },
        });
        createdCount++;
      }
    } catch (err: any) {
      errors.push({ sku: item.sku, error: err.message });
    }
  }

  logAction({
    action: "IMPORT",
    userId,
    targetType: "PRODUCT",
    details: { created: createdCount, updated: updatedCount, errorsCount: errors.length },
  });

  return { created: createdCount, updated: updatedCount, errors };
};

export const generateExport = async (userId: string = "unknown") => {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  });

  const buffer = await importExportService.generateExport(products);

  logAction({
    action: "EXPORT",
    userId,
    targetType: "PRODUCT",
    details: { count: products.length },
  });

  return buffer;
};

export const processSheetSync = async (sheetUrl: string, userId: string = "unknown") => {
  const importedData = await googleSheetsService.syncFromPublicSheet(sheetUrl);

  let createdCount = 0;
  let updatedCount = 0;

  for (const item of importedData) {
    const existing = await prisma.product.findFirst({
      where: { sku: item.sku },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          price: item.price,
          stock: item.stock,
          active: item.active,
        },
      });
      updatedCount++;
    } else {
      await prisma.product.create({
        data: {
          sku: item.sku,
          name: item.name,
          price: item.price || 0,
          stock: item.stock || 0,
          active: item.active !== undefined ? item.active : true,
        },
      });
      createdCount++;
    }
  }

  logAction({
    action: "SYNC",
    userId,
    targetType: "PRODUCT",
    details: { source: "GoogleSheet", created: createdCount, updated: updatedCount },
  });

  return { created: createdCount, updated: updatedCount };
};

export const getStats = async () => {
  const [total, active, featured, outOfStock, categories] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { featured: true } }),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    }),
  ]);

  return {
    total,
    active,
    inactive: total - active,
    featured,
    outOfStock,
    byCategory: categories.map((c) => ({
      name: c.name,
      count: c._count.products,
    })),
  };
};
