import { Request, Response } from "express";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema";
import * as productService from "../services/product.service";
import { CATEGORY_MIN_PRICE_BY_SLUG } from "../services/product.service";
import { prisma } from "../lib/prisma";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import ExcelJS from "exceljs";

// --- Products ---

export const getProducts = async (req: Request, res: Response) => {
  try {
    const result = await productService.listProducts(req.query);
    res.json({
      success: true,
      data: result.products,
      pagination: result.pagination,
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
    const product = await productService.getProduct(id as string);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar produto" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = createProductSchema.parse(req.body);
    const userId = (req as any).user?.id || "unknown";

    const product = await productService.createProduct(validatedData, userId);

    res.status(201).json({ success: true, data: product });
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

    if (error.message.includes("SKU já existe") || error.code === "P2002") {
      return res.status(400).json({ success: false, message: "SKU já existe" });
    }
    res.status(500).json({ success: false, message: "Erro ao criar produto" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || "unknown";

    // Validate request body
    const validatedData = updateProductSchema.parse(req.body);

    const product = await productService.updateProduct(
      id as string,
      validatedData,
      userId,
    );

    res.json({ success: true, data: product });
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
    const userId = (req as any).user?.id || "unknown";

    const result = await productService.deleteProduct(id as string, userId);

    res.json({ success: true, message: result.message });
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

export const getProductVariants = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const variants = await (prisma as any).productVariant.findMany({
      where: { productId: id },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: variants });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao buscar variantes" });
  }
};

export const createProductVariant = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, price, stock, sku } = req.body;
    const variant = await (prisma as any).productVariant.create({
      data: {
        productId: id,
        name,
        price,
        stock,
        sku,
      },
    });
    res.status(201).json({ success: true, data: variant });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao criar variante" });
  }
};

export const updateProductVariant = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const variantId = req.params.variantId as string;
    const { name, price, stock, sku } = req.body;
    const variant = await (prisma as any).productVariant.update({
      where: { id: variantId },
      data: {
        name,
        price,
        stock,
        sku,
        productId: id,
      },
    });
    res.json({ success: true, data: variant });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Variante não encontrada" });
    }
    res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar variante" });
  }
};

export const deleteProductVariant = async (req: Request, res: Response) => {
  try {
    const variantId = req.params.variantId as string;
    await (prisma as any).productVariant.delete({
      where: { id: variantId },
    });
    res.json({ success: true, message: "Variante removida" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Variante não encontrada" });
    }
    res
      .status(500)
      .json({ success: false, message: "Erro ao remover variante" });
  }
};

export const getProductImages = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const images = await (prisma as any).productImage.findMany({
      where: { productId: id },
      orderBy: { order: "asc" },
    });
    res.json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar imagens" });
  }
};

export const createProductImage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { url, isPrimary, order } = req.body;

    if (isPrimary) {
      await (prisma as any).productImage.updateMany({
        where: { productId: id },
        data: { isPrimary: false },
      });
    }

    const image = await (prisma as any).productImage.create({
      data: {
        productId: id,
        url,
        isPrimary: Boolean(isPrimary),
        order: typeof order === "number" ? order : 0,
      },
    });
    res.status(201).json({ success: true, data: image });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao criar imagem do produto" });
  }
};

export const updateProductImage = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const imageId = req.params.imageId as string;
    const { url, isPrimary, order } = req.body;

    if (isPrimary) {
      await (prisma as any).productImage.updateMany({
        where: { productId: id },
        data: { isPrimary: false },
      });
    }

    const image = await (prisma as any).productImage.update({
      where: { id: imageId },
      data: {
        url,
        isPrimary: isPrimary !== undefined ? Boolean(isPrimary) : undefined,
        order: typeof order === "number" ? order : undefined,
      },
    });
    res.json({ success: true, data: image });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Imagem não encontrada" });
    }
    res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar imagem" });
  }
};

export const deleteProductImage = async (req: Request, res: Response) => {
  try {
    const imageId = req.params.imageId as string;
    await (prisma as any).productImage.delete({
      where: { id: imageId },
    });
    res.json({ success: true, message: "Imagem removida" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Imagem não encontrada" });
    }
    res.status(500).json({ success: false, message: "Erro ao remover imagem" });
  }
};

export const uploadProductImages = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const files = (req as any).files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Nenhuma imagem enviada" });
    }

    const baseDir = path.resolve(
      process.cwd(),
      "public",
      "img",
      "produtos",
      id,
    );
    fs.mkdirSync(baseDir, { recursive: true });

    const created: any[] = [];
    for (const file of files) {
      const ext = file.mimetype.includes("jpeg")
        ? ".jpg"
        : file.mimetype.includes("png")
          ? ".png"
          : file.mimetype.includes("webp")
            ? ".webp"
            : "";

      if (!ext) continue;
      const filename = `${uuidv4()}${ext}`;
      const filepath = path.join(baseDir, filename);
      fs.writeFileSync(filepath, file.buffer);

      const publicUrl = `/img/produtos/${id}/${filename}`;
      const image = await (prisma as any).productImage.create({
        data: {
          productId: id,
          url: publicUrl,
          isPrimary: false,
          order: 0,
        },
      });
      created.push(image);
    }

    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Erro ao enviar imagens" });
  }
};

// --- Bulk Operations ---

export const bulkUpdateProducts = async (req: Request, res: Response) => {
  try {
    const { ids, data } = req.body;
    const userId = (req as any).user?.id || "unknown";

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "IDs são obrigatórios" });
    }

    const count = await productService.bulkUpdate(ids, data, userId);

    res.json({
      success: true,
      message: `${count} produtos atualizados`,
      count,
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
    const userId = (req as any).user?.id || "unknown";

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "IDs são obrigatórios" });
    }

    const result = await productService.bulkDelete(ids, userId);

    res.json({
      success: true,
      message: `${result.deleted} produtos excluídos, ${result.deactivated} desativados`,
      deleted: result.deleted,
      deactivated: result.deactivated,
    });
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao excluir produtos" });
  }
};

// --- Import / Export / Sync ---

export const importProducts = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Arquivo obrigatório" });
    }
    const userId = (req as any).user?.id || "unknown";

    const result = await productService.processImport(
      req.file.buffer,
      req.file.mimetype,
      userId,
    );

    res.json({
      success: true,
      message: "Importação concluída",
      stats: result,
    });
  } catch (error: any) {
    console.error("Error importing products:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportProducts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || "unknown";
    const buffer = await productService.generateExport(userId);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=produtos-eletrostart.xlsx",
    );
    res.send(buffer);
  } catch (error: any) {
    console.error("Error exporting products:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncSheet = async (req: Request, res: Response) => {
  try {
    const { sheetUrl } = req.body;
    if (!sheetUrl) {
      return res
        .status(400)
        .json({ success: false, message: "URL da planilha obrigatória" });
    }
    const userId = (req as any).user?.id || "unknown";

    const stats = await productService.processSheetSync(sheetUrl, userId);

    res.json({
      success: true,
      message: "Sincronização concluída",
      stats,
    });
  } catch (error: any) {
    console.error("Error syncing sheet:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductStats = async (req: Request, res: Response) => {
  try {
    const data = await productService.getStats();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching product stats:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao buscar estatísticas" });
  }
};

export const getMinPriceConfig = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: CATEGORY_MIN_PRICE_BY_SLUG,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar configuração de preços",
    });
  }
};

export const adjustProductStock = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { newStock, reason } = req.body;
    const userId = (req as any).user?.id as string | undefined;

    const parsedNewStock = Number(newStock);
    if (!Number.isFinite(parsedNewStock)) {
      return res
        .status(400)
        .json({ success: false, message: "Novo estoque inválido" });
    }
    if (parsedNewStock < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Estoque não pode ser negativo" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const updatedProduct = await tx.product.update({
        where: { id },
        data: { stock: parsedNewStock },
      });

      await (tx as any).stockMovement.create({
        data: {
          productId: updatedProduct.id,
          orderId: null,
          type: "MANUAL_ADJUST",
          quantity: parsedNewStock - existing.stock,
          previousStock: existing.stock,
          newStock: parsedNewStock,
          reason: reason || null,
          createdById: userId,
        },
      });

      return updatedProduct;
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.message === "PRODUCT_NOT_FOUND") {
      return res
        .status(404)
        .json({ success: false, message: "Produto não encontrado" });
    }
    res
      .status(500)
      .json({ success: false, message: "Erro ao ajustar estoque" });
  }
};

export const getLowStockProducts = async (req: Request, res: Response) => {
  try {
    const thresholdParam = req.query.threshold as string | undefined;
    let threshold = Number(thresholdParam);
    if (!Number.isFinite(threshold)) {
      threshold = 5;
    }
    if (threshold < 0) {
      threshold = 0;
    }

    const products = await prisma.product.findMany({
      where: {
        active: true,
        stock: { lte: threshold },
      },
      include: { category: true },
      orderBy: { stock: "asc" },
    });

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      category: p.category
        ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
        : null,
      price: p.price,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao buscar estoque baixo" });
  }
};

export const getStockMovements = async (req: Request, res: Response) => {
  try {
    const {
      productId,
      type,
      origin,
      from,
      to,
      userId,
      delta,
      emptySku,
      page = "1",
      limit = "20",
    } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const where: any = {};
    if (productId) where.productId = productId as string;
    if (type) {
      where.type = type as string;
    } else if (origin) {
      const map: Record<string, string> = {
        manual: "MANUAL_ADJUST",
        order_create: "ORDER_CREATE",
        order_cancel: "ORDER_CANCEL",
        order_restore: "ORDER_RESTORE",
      };
      const mapped = map[String(origin)];
      if (mapped) where.type = mapped;
    }
    if (userId) where.createdById = userId as string;
    if (delta === "positive") {
      where.quantity = { gt: 0 };
    } else if (delta === "negative") {
      where.quantity = { lt: 0 };
    }
    if (emptySku === "true") {
      where.product = {
        OR: [{ sku: null }, { sku: "" }],
      };
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from as string);
      if (to) where.createdAt.lte = new Date(to as string);
    }

    const total = await (prisma as any).stockMovement.count({ where });
    const movements = await (prisma as any).stockMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        order: { select: { id: true, status: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({
      success: true,
      data: movements,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao buscar movimentações" });
  }
};

export const exportStockMovements = async (req: Request, res: Response) => {
  try {
    const {
      productId,
      type,
      origin,
      from,
      to,
      userId,
      delta,
      emptySku,
      dateFormat,
      dateTz,
    } = req.query;

    const where: any = {};
    if (productId) where.productId = productId as string;
    if (type) {
      where.type = type as string;
    } else if (origin) {
      const map: Record<string, string> = {
        manual: "MANUAL_ADJUST",
        order_create: "ORDER_CREATE",
        order_cancel: "ORDER_CANCEL",
        order_restore: "ORDER_RESTORE",
      };
      const mapped = map[String(origin)];
      if (mapped) where.type = mapped;
    }
    if (userId) where.createdById = userId as string;
    if (delta === "positive") {
      where.quantity = { gt: 0 };
    } else if (delta === "negative") {
      where.quantity = { lt: 0 };
    }
    if (emptySku === "true") {
      where.product = {
        OR: [{ sku: null }, { sku: "" }],
      };
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from as string);
      if (to) where.createdAt.lte = new Date(to as string);
    }

    const movements = await (prisma as any).stockMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10000,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        order: { select: { id: true, status: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    const header = [
      "Data",
      "Produto",
      "SKU",
      "ProductId",
      "Tipo",
      "Origem",
      "Delta",
      "Antes",
      "Depois",
      "Usuário",
      "Email",
      "Pedido",
      "StatusPedido",
      "Motivo",
    ];

    const escape = (value: string | number | null | undefined) => {
      if (value === null || value === undefined) return "";
      const s = String(value);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const rows = movements.map((m: any) => {
      const date = m.createdAt
        ? dateFormat === "local"
          ? new Intl.DateTimeFormat("pt-BR", {
              timeZone: (dateTz as string) || undefined,
              hour12: false,
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }).format(new Date(m.createdAt))
          : new Date(m.createdAt).toISOString()
        : "";
      const productName = m.product?.name || "";
      const sku = m.product?.sku || "";
      const typeValue = m.type || "";
      let origin = "";
      if (m.type === "MANUAL_ADJUST") {
        origin = "Ajuste manual";
      } else if (m.type === "ORDER_CREATE") {
        origin = m.order?.id ? `Pedido ${m.order.id}` : "Pedido criado";
      } else if (m.type === "ORDER_CANCEL") {
        origin = m.order?.id
          ? `Cancelamento pedido ${m.order.id}`
          : "Cancelamento de pedido";
      } else if (m.type === "ORDER_RESTORE") {
        origin = m.order?.id
          ? `Reativação pedido ${m.order.id}`
          : "Reativação de pedido";
      } else {
        origin = m.type || "";
      }
      const deltaValue = m.quantity;
      const before = m.previousStock;
      const after = m.newStock;
      const userName = m.createdBy?.name || "";
      const userEmail = m.createdBy?.email || "";
      const orderId = m.order?.id || "";
      const orderStatus = m.order?.status || "";
      const reason = m.reason || "";

      return [
        escape(date),
        escape(productName),
        escape(sku),
        escape(m.productId),
        escape(typeValue),
        escape(origin),
        escape(deltaValue),
        escape(before),
        escape(after),
        escape(userName),
        escape(userEmail),
        escape(orderId),
        escape(orderStatus),
        escape(reason),
      ].join(",");
    });

    const csv = [header.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=stock-movements.csv",
    );
    res.send(csv);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao exportar movimentações" });
  }
};

export const exportStockMovementsXlsx = async (req: Request, res: Response) => {
  try {
    const {
      productId,
      type,
      origin,
      from,
      to,
      userId,
      delta,
      emptySku,
      dateFormat,
      dateTz,
    } = req.query;

    const where: any = {};
    if (productId) where.productId = productId as string;
    if (type) {
      where.type = type as string;
    } else if (origin) {
      const map: Record<string, string> = {
        manual: "MANUAL_ADJUST",
        order_create: "ORDER_CREATE",
        order_cancel: "ORDER_CANCEL",
        order_restore: "ORDER_RESTORE",
      };
      const mapped = map[String(origin)];
      if (mapped) where.type = mapped;
    }
    if (userId) where.createdById = userId as string;
    if (delta === "positive") {
      where.quantity = { gt: 0 };
    } else if (delta === "negative") {
      where.quantity = { lt: 0 };
    }
    if (emptySku === "true") {
      where.product = {
        OR: [{ sku: null }, { sku: "" }],
      };
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from as string);
      if (to) where.createdAt.lte = new Date(to as string);
    }

    const movements = await (prisma as any).stockMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10000,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        order: { select: { id: true, status: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Movimentações");

    worksheet.columns = [
      { header: "Data", key: "date", width: 20 },
      { header: "Produto", key: "product", width: 30 },
      { header: "SKU", key: "sku", width: 15 },
      { header: "ProductId", key: "productId", width: 24 },
      { header: "Tipo", key: "type", width: 20 },
      { header: "Origem", key: "origin", width: 28 },
      { header: "Delta", key: "delta", width: 10 },
      { header: "Antes", key: "before", width: 12 },
      { header: "Depois", key: "after", width: 12 },
      { header: "Usuário", key: "user", width: 22 },
      { header: "Email", key: "email", width: 26 },
      { header: "Pedido", key: "order", width: 24 },
      { header: "StatusPedido", key: "orderStatus", width: 18 },
      { header: "Motivo", key: "reason", width: 40 },
    ];

    movements.forEach((m: any) => {
      let originText = "";
      if (m.type === "MANUAL_ADJUST") {
        originText = "Ajuste manual";
      } else if (m.type === "ORDER_CREATE") {
        originText = m.order?.id ? `Pedido ${m.order.id}` : "Pedido criado";
      } else if (m.type === "ORDER_CANCEL") {
        originText = m.order?.id
          ? `Cancelamento pedido ${m.order.id}`
          : "Cancelamento de pedido";
      } else if (m.type === "ORDER_RESTORE") {
        originText = m.order?.id
          ? `Reativação pedido ${m.order.id}`
          : "Reativação de pedido";
      } else {
        originText = m.type || "";
      }

      worksheet.addRow({
        date: m.createdAt
          ? dateFormat === "local"
            ? new Intl.DateTimeFormat("pt-BR", {
                timeZone: (dateTz as string) || undefined,
                hour12: false,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }).format(new Date(m.createdAt))
            : new Date(m.createdAt).toISOString()
          : "",
        product: m.product?.name || "",
        sku: m.product?.sku || "",
        productId: m.productId,
        type: m.type || "",
        origin: originText,
        delta: m.quantity,
        before: m.previousStock,
        after: m.newStock,
        user: m.createdBy?.name || "",
        email: m.createdBy?.email || "",
        order: m.order?.id || "",
        orderStatus: m.order?.status || "",
        reason: m.reason || "",
      });
    });

    const buffer = (await workbook.xlsx.writeBuffer()) as any as Buffer;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=movimentacoes-estoque.xlsx",
    );
    res.send(buffer);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao exportar movimentações XLSX" });
  }
};
export const getProductStockMovements = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const where = { productId: id as string };
    const total = await (prisma as any).stockMovement.count({ where });
    const movements = await (prisma as any).stockMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, status: true } },
      },
    });

    res.json({
      success: true,
      data: movements,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar movimentações do produto",
    });
  }
};

export const getEmptySkuStockMovementsCount = async (
  req: Request,
  res: Response,
) => {
  try {
    const { productId, type, origin, from, to, userId, delta } = req.query;
    const where: any = {};
    if (productId) where.productId = productId as string;
    if (type) {
      where.type = type as string;
    } else if (origin) {
      const map: Record<string, string> = {
        manual: "MANUAL_ADJUST",
        order_create: "ORDER_CREATE",
        order_cancel: "ORDER_CANCEL",
        order_restore: "ORDER_RESTORE",
      };
      const mapped = map[String(origin)];
      if (mapped) where.type = mapped;
    }
    if (userId) where.createdById = userId as string;
    if (delta === "positive") {
      where.quantity = { gt: 0 };
    } else if (delta === "negative") {
      where.quantity = { lt: 0 };
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from as string);
      if (to) where.createdAt.lte = new Date(to as string);
    }
    where.product = {
      OR: [{ sku: null }, { sku: "" }],
    };

    const count = await (prisma as any).stockMovement.count({ where });
    res.json({ success: true, count });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao contar SKU vazio" });
  }
};
