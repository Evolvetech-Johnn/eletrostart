/**
 * Rota de Assinatura para Signed Upload Cloudinary
 *
 * Protegida por autenticação JWT — somente admins podem gerar assinaturas.
 * GET /api/cloudinary/signature?folder=eletrostart/produtos/ID
 */

import express, { Request, Response } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { generateUploadSignature, isCloudinaryConfigured } from "../services/cloudinary.service";

const router = express.Router();

// Regex para validar a pasta (evita path traversal)
const SAFE_FOLDER_PATTERN = /^[a-zA-Z0-9/_-]+$/;
const MAX_FOLDER_DEPTH = 5;

/**
 * GET /api/cloudinary/signature
 * Query: ?folder=eletrostart/produtos/abc123
 *
 * Retorna: { timestamp, signature, api_key, cloud_name, folder }
 * NUNCA retorna o API_SECRET.
 */
router.get("/signature", authenticate, requireAdmin, (req: Request, res: Response) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        code: "CLOUDINARY_NOT_CONFIGURED",
        message: "Cloudinary não está configurado no servidor. Configure as variáveis de ambiente.",
      });
    }

    // Valida e sanitiza a pasta
    const rawFolder = (req.query.folder as string) || "eletrostart/produtos";
    const folder = rawFolder.trim().replace(/^\/|\/$/g, ""); // Remove barras no início/fim

    if (!SAFE_FOLDER_PATTERN.test(folder)) {
      return res.status(400).json({
        success: false,
        message: "Nome de pasta inválido. Use apenas letras, números, hífens e underscores.",
      });
    }

    if (folder.split("/").length > MAX_FOLDER_DEPTH) {
      return res.status(400).json({
        success: false,
        message: `Profundidade máxima de pasta excedida (máx: ${MAX_FOLDER_DEPTH} níveis).`,
      });
    }

    const signatureData = generateUploadSignature(folder);

    return res.json({ success: true, data: signatureData });
  } catch (error: any) {
    console.error("[CloudinaryRoute] Erro ao gerar assinatura:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Erro interno ao gerar assinatura.",
    });
  }
});

/**
 * GET /api/cloudinary/status
 * Verifica se o Cloudinary está configurado (para diagnóstico admin)
 */
router.get("/status", authenticate, requireAdmin, (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      configured: isCloudinaryConfigured(),
      provider: "Cloudinary",
    },
  });
});

export default router;
