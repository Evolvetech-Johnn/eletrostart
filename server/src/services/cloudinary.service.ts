/**
 * Serviço de CDN para Imagens (Cloudinary)
 * 
 * Permite que a aplicação salve imagens na nuvem em vez do disco local do Render,
 * o que evita a perda de imagens (Render deleta discos de free tier em cada deploy)
 * e otimiza a entrega (CDN, WebP, compressão automática).
 * 
 * Uso:
 * 1. O envio (Multer) passa a usar memoryStorage()
 * 2. O Controller chama `uploadToCloudinary(buffer, nome)`
 * 
 * Fallback Gracioso:
 * Se as credenciais do Cloudinary não forem informadas no .env,
 * o serviço salva as imagens na pasta local /uploads normalmente.
 */

import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import * as Sentry from "@sentry/node";

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

const isConfigured = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

if (isConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  console.log("☁️ [Cloudinary] Configurado e ativo");
} else {
  console.warn("⚠️ [Cloudinary] Variáveis de ambiente não configuradas. Fallback para upload em disco ativado.");
}

/**
 * Faz upload do buffer processado pelo multer (memória)
 * @returns {Promise<string>} A URL segura (https) da imagem (CDN ou estática local)
 */
export const uploadImageToStore = async (
  fileBuffer: Buffer,
  originalName: string,
  folder: string = "eletrostart"
): Promise<string> => {
  if (isConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          format: "webp", // Força WebP
          tags: ["eletrostart", folder.split("/").pop() || "general"],
          transformation: [{ quality: "auto" }, { fetch_format: "auto" }] // Otimiza peso visualmente
        },
        (error, result) => {
          if (result) {
            resolve(result.secure_url);
          } else {
            const errorMsg = `[Cloudinary] Erro no upload: ${error?.message || "Erro desconhecido"}`;
            console.error(errorMsg, error);
            
            Sentry.captureException(error, {
              extra: { folder, originalName }
            });
            
            reject(new Error("Erro ao fazer upload para CDN."));
          }
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }

  // --- Fallback Local ---
  // Salva no disco (./uploads/) para que a aplicação não quebre se não houver CDN config
  const filename = `${Date.now()}-${uuidv4()}${path.extname(originalName)}`;
  const uploadsDir = path.join(process.cwd(), "uploads");
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, fileBuffer);
  
  return `/uploads/${filename}`;
};
