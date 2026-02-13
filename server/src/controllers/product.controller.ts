import { Request, Response } from "express";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema";
import * as productService from "../services/product.service";

// --- Products ---

export const getProducts = async (req: Request, res: Response) => {
  try {
    const result = await productService.listProducts(req.query);
    res.json({ success: true, data: result.products, pagination: result.pagination });
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

    const product = await productService.updateProduct(id as string, validatedData, userId);

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
      return res.status(400).json({ success: false, message: "Arquivo obrigatório" });
    }
    const userId = (req as any).user?.id || "unknown";

    const result = await productService.processImport(
      req.file.buffer,
      req.file.mimetype,
      userId
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
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=produtos-eletrostart.xlsx"
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
      return res.status(400).json({ success: false, message: "URL da planilha obrigatória" });
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
    res.status(500).json({ success: false, message: "Erro ao buscar estatísticas" });
  }
};
