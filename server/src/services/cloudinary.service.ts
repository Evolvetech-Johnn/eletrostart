/**
 * Serviço de CDN para Imagens (Cloudinary)
 *
 * Permite que a aplicação salve imagens na nuvem em vez do disco local do Render,
 * o que evita a perda de imagens (Render deleta discos de free tier em cada deploy)
 * e otimiza a entrega (CDN, WebP, compressão automática).
 *
 * Fluxo Principal (Signed Upload — Enterprise):
 *   Frontend → GET /api/cloudinary/signature → Upload direto → Cloudinary → URL salva no DB
 *
 * Fluxo Legado (Backend Upload — mantido para importações):
 *   Frontend → Backend (Multer) → Cloudinary SDK → URL salva no DB
 *
 * Fallback Gracioso:
 *   Se as credenciais não forem informadas, usa disco local (apenas para dev/testes).
 */

import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import * as Sentry from "@sentry/node";

type ResolvedCloudinaryEnv = {
  configured: boolean;
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
};

let resolvedEnv: ResolvedCloudinaryEnv | null = null;

const resolveCloudinaryEnv = (): ResolvedCloudinaryEnv => {
  if (resolvedEnv) return resolvedEnv;

  const rawUrl = (process.env.CLOUDINARY_URL || "").trim();

  let cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  let apiKey = (process.env.CLOUDINARY_API_KEY || process.env.API_KEY || "").trim();
  let apiSecret = (process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET || "").trim();

  if ((!cloudName || !apiKey || !apiSecret) && rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      if (!cloudName) cloudName = (parsed.hostname || "").trim();
      if (!apiKey) apiKey = decodeURIComponent(parsed.username || "").trim();
      if (!apiSecret) apiSecret = decodeURIComponent(parsed.password || "").trim();
    } catch {}
  }

  const configured = Boolean(cloudName && apiKey && apiSecret);
  resolvedEnv = { configured, cloudName, apiKey, apiSecret };

  if (configured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    console.log("☁️ [Cloudinary] Configurado e ativo");
  } else {
    const missing = [];
    if (!cloudName) missing.push("CLOUDINARY_CLOUD_NAME");
    if (!apiKey) missing.push("CLOUDINARY_API_KEY");
    if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");
    if (rawUrl && missing.length > 0) missing.push("CLOUDINARY_URL (inválida/incompleta)");

    console.warn(
      `⚠️ [Cloudinary] Credenciais não configuradas (${missing.join(", ")}). Fallback para disco ativado. ` +
        "Configure as variáveis no .env ou no Render Dashboard para evitar perda de imagens.",
    );
  }

  return resolvedEnv;
};

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CloudinaryUploadResult {
  url: string;
  publicId?: string;
}

export interface CloudinarySignature {
  timestamp: number;
  signature: string;
  api_key: string;
  cloud_name: string;
  folder: string;
}

// ─── Upload via Backend (legado / importações) ────────────────────────────────

/**
 * Faz upload de um buffer (Multer memoryStorage) para o Cloudinary ou disco local.
 * @returns { url, publicId? }
 */
export const uploadImageToStore = async (
  fileBuffer: Buffer,
  originalName: string,
  folder: string = "eletrostart"
): Promise<CloudinaryUploadResult> => {
  if (resolveCloudinaryEnv().configured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          tags: ["eletrostart", folder.split("/").pop() || "general"],
          quality: "auto",
          fetch_format: "auto",
        },
        (error, result) => {
          if (result) {
            resolve({ url: result.secure_url, publicId: result.public_id });
          } else {
            Sentry.captureException(error, { extra: { folder, originalName } });
            reject(new Error("Erro ao fazer upload para CDN."));
          }
        }
      );
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }

  // --- Fallback Local (desenvolvimento sem Cloudinary) ---
  const filename = `${Date.now()}-${uuidv4()}${path.extname(originalName)}`;
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  fs.writeFileSync(path.join(uploadsDir, filename), fileBuffer);
  console.warn(`⚠️ [Cloudinary] Imagem salva localmente (FALLBACK): ${filename}`);
  return { url: `/uploads/${filename}`, publicId: undefined };
};

// ─── Signed Upload (Frontend → Cloudinary direto) ─────────────────────────────

/**
 * Gera parâmetros de assinatura para upload direto do frontend ao Cloudinary.
 * NUNCA retorna o API_SECRET — apenas a assinatura HMAC já computada.
 *
 * Fluxo Seguro:
 *   1. Frontend → GET /api/cloudinary/signature?folder=eletrostart/produtos/ID
 *   2. Backend gera e retorna { timestamp, signature, api_key, cloud_name, folder }
 *   3. Frontend monta FormData e faz POST direto ao Cloudinary
 *   4. Frontend recebe { secure_url, public_id } e salva via API /products/:id/images
 *
 * @throws Error se Cloudinary não estiver configurado
 */
export const generateUploadSignature = (folder: string = "eletrostart/produtos"): CloudinarySignature => {
  const envConfig = resolveCloudinaryEnv();
  if (!envConfig.configured) {
    throw new Error(
      "Cloudinary não configurado. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET."
    );
  }

  const timestamp = Math.round(Date.now() / 1000);

  // Os parâmetros aqui DEVEM ser exatamente os que o frontend vai incluir no FormData
  const paramsToSign: Record<string, string | number> = { folder, timestamp };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, envConfig.apiSecret!);

  return {
    timestamp,
    signature,
    api_key: envConfig.apiKey!,
    cloud_name: envConfig.cloudName!,
    folder,
  };
};

// ─── URL Helpers (CDN Transformations) ────────────────────────────────────────

/**
 * Injeta transformações de otimização em URLs Cloudinary.
 * /upload/ → /upload/f_auto,q_auto,w_800,c_limit/
 */
export const getOptimizedUrl = (url: string, width = 800): string => {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
};

/**
 * Gera URL de thumbnail quadrado a partir de URL Cloudinary.
 * /upload/ → /upload/c_fill,h_300,w_300,f_auto,q_auto/
 */
export const getThumbnailUrl = (url: string, size = 300): string => {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/c_fill,h_${size},w_${size},f_auto,q_auto/`);
};

// ─── Deleção Remota ───────────────────────────────────────────────────────────

/**
 * Remove um asset do Cloudinary pelo publicId.
 * Falhas são silenciosas — não bloqueiam a resposta da API.
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!resolveCloudinaryEnv().configured || !publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok" && result.result !== "not found") {
      console.warn(`[Cloudinary] Resposta inesperada ao deletar '${publicId}':`, result);
    }
  } catch (err: any) {
    console.error(`[Cloudinary] Falha ao deletar '${publicId}':`, err.message);
  }
};

// ─── Status ───────────────────────────────────────────────────────────────────

export const isCloudinaryConfigured = (): boolean =>
  resolveCloudinaryEnv().configured;
