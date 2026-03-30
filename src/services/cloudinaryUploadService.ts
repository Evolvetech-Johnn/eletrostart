/**
 * Serviço de Upload Direto para Cloudinary (Signed Upload)
 *
 * Implementa o padrão enterprise de upload seguro:
 *   1. Solicita assinatura ao backend → nunca expõe API_SECRET
 *   2. Envia arquivo diretamente ao Cloudinary via XHR (progresso real)
 *   3. Retorna URL otimizada + publicId + thumbnail
 *
 * Restrições:
 *   - Apenas imagens: JPEG, PNG, WebP
 *   - Máximo 5MB por arquivo
 *   - Máximo 10 imagens por produto
 */

import apiClient from "./apiClient";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SignatureData {
  timestamp: number;
  signature: string;
  api_key: string;
  cloud_name: string;
  folder: string;
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  thumbnail: string;
  width: number;
  height: number;
  format: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

export const MAX_FILE_SIZE_MB = 5;
export const MAX_IMAGES_PER_PRODUCT = 10;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// ─── Validação ────────────────────────────────────────────────────────────────

/**
 * Valida um arquivo de imagem antes do upload.
 * @returns string com mensagem de erro, ou null se válido
 */
export const validateImageFile = (file: File): string | null => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `Tipo não suportado: "${file.type}". Use JPEG, PNG ou WebP.`;
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `Arquivo "${file.name}" muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo ${MAX_FILE_SIZE_MB}MB.`;
  }
  return null;
};

// ─── URL Helpers ──────────────────────────────────────────────────────────────

/**
 * Aplica transformações de otimização em URLs Cloudinary.
 * /upload/ → /upload/f_auto,q_auto,w_800,c_limit/
 */
export const getOptimizedUrl = (url: string, width = 800): string => {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
};

/**
 * Gera URL de thumbnail quadrado.
 * /upload/ → /upload/c_fill,h_300,w_300,f_auto,q_auto/
 */
export const getThumbnailUrl = (url: string, size = 300): string => {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/c_fill,h_${size},w_${size},f_auto,q_auto/`);
};

// ─── Upload Individual ────────────────────────────────────────────────────────

/**
 * Faz upload de uma imagem diretamente ao Cloudinary usando signed upload.
 *
 * @param file - Arquivo a ser enviado
 * @param folder - Pasta destino no Cloudinary (ex: "eletrostart/produtos/id123")
 * @param onProgress - Callback de progresso (0–100)
 */
export const uploadImageToCloudinary = async (
  file: File,
  folder: string,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> => {
  // 1. Validar arquivo
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  // 2. Solicitar assinatura ao backend (protegida por Auth)
  const sigResponse = await apiClient.get<any, any>(
    `/cloudinary/signature?folder=${encodeURIComponent(folder)}`
  );
  const sig: SignatureData = sigResponse.data;

  if (!sig?.signature || !sig?.cloud_name) {
    throw new Error("Resposta de assinatura inválida do servidor.");
  }

  // 3. Montar FormData para envio direto ao Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.api_key);
  formData.append("timestamp", String(sig.timestamp));
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder);

  // 4. Upload direto ao Cloudinary com acompanhamento de progresso via XHR
  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.onprogress = (e: ProgressEvent) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url: getOptimizedUrl(data.secure_url),
            publicId: data.public_id,
            thumbnail: getThumbnailUrl(data.secure_url),
            width: data.width ?? 0,
            height: data.height ?? 0,
            format: data.format ?? "",
          });
        } catch {
          reject(new Error("Resposta inválida do Cloudinary."));
        }
      } else {
        let errorMsg = "Erro no upload para Cloudinary.";
        try {
          const errData = JSON.parse(xhr.responseText);
          errorMsg = errData.error?.message || errorMsg;
        } catch {}
        reject(new Error(`${errorMsg} (Status: ${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error("Erro de rede ao fazer upload. Verifique sua conexão."));
    xhr.ontimeout = () => reject(new Error("Timeout no upload. Tente novamente."));

    xhr.timeout = 60000; // 60 segundos
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`);
    xhr.send(formData);
  });
};

// ─── Upload Múltiplo ──────────────────────────────────────────────────────────

/**
 * Faz upload de múltiplos arquivos sequencialmente (evita sobrecarga de rede).
 *
 * @param files - Lista de arquivos
 * @param folder - Pasta destino no Cloudinary
 * @param onFileProgress - Callback (índice do arquivo, progresso 0–100)
 * @param onFileComplete - Callback quando cada arquivo termina
 */
export const uploadMultipleImages = async (
  files: File[],
  folder: string,
  onFileProgress?: (fileIndex: number, progress: number) => void,
  onFileComplete?: (fileIndex: number, result: CloudinaryUploadResult) => void
): Promise<CloudinaryUploadResult[]> => {
  if (files.length > MAX_IMAGES_PER_PRODUCT) {
    throw new Error(`Máximo de ${MAX_IMAGES_PER_PRODUCT} imagens permitidas por produto.`);
  }

  const results: CloudinaryUploadResult[] = [];
  const errors: { index: number; file: string; error: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadImageToCloudinary(
        files[i],
        folder,
        (progress) => onFileProgress?.(i, progress)
      );
      results.push(result);
      onFileComplete?.(i, result);
    } catch (err: any) {
      errors.push({ index: i, file: files[i].name, error: err.message });
      // Não interrompe — tenta próximos arquivos
      console.error(`[CloudinaryUpload] Falha no arquivo ${files[i].name}:`, err.message);
    }
  }

  if (errors.length > 0 && results.length === 0) {
    // Todos falharam
    throw new Error(`Nenhuma imagem foi enviada. Erro: ${errors[0].error}`);
  }

  // Se houve erros parciais, retorna o que conseguiu + loga
  if (errors.length > 0) {
    console.warn(`[CloudinaryUpload] ${errors.length} de ${files.length} falharam:`, errors);
  }

  return results;
};
