import multer from "multer";
import path from "path";

// ─────────────────────────────────────────────
//  Allowed MIME types (explicit whitelist)
// ─────────────────────────────────────────────
const ALLOWED_SPREADSHEET_MIMES = new Set([
  "text/csv",
  "text/plain",                                           // some CSVs arrive as text/plain
  "application/vnd.ms-excel",                             // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
]);

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_CV_MIMES = new Set([
  "application/pdf",
  "application/msword",                                   // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]);

// ─────────────────────────────────────────────
//  Multer: CSV / Excel import (products)
// ─────────────────────────────────────────────
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,                   // apenas 1 arquivo por vez
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_SPREADSHEET_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(
        `Formato de arquivo inválido: "${file.mimetype}". ` +
        "Apenas CSV e Excel (.xlsx, .xls) são permitidos."
      ));
    }
  },
});

// ─────────────────────────────────────────────
//  Multer: Imagens de produto
// ─────────────────────────────────────────────
export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB por imagem (reduzido de 10 MB)
    files: 10,                  // máximo 10 imagens por requisição
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(
        `Formato de imagem inválido: "${file.mimetype}". ` +
        "Formatos aceitos: JPEG, PNG, WebP, GIF."
      ));
    }
  },
});

// ─────────────────────────────────────────────
//  Multer: Currículo (Trabalhe Conosco)
// ─────────────────────────────────────────────
export const uploadCV = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_CV_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(
        `Tipo inválido: "${file.mimetype}". ` +
        "Envie apenas PDF, DOC ou DOCX."
      ));
    }
  },
});

// ─────────────────────────────────────────────
//  Magic Number Validation (MIME Sniffing)
// ─────────────────────────────────────────────

import { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";

/**
 * Sanitiza o nome do arquivo para evitar caracteres especiais, espaços e extensões duplas.
 */
export const sanitizeFilename = (filename: string): string => {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  
  // Remove tudo que não for letra, número, hífen ou underline
  const safeBase = base
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
    
  return `${safeBase}${ext.toLowerCase()}`;
};

/**
 * Middleware para validar o conteúdo binário real do arquivo (Magic Numbers),
 * evitando renomear arquivo malicioso como `.jpg` e passar pelo multer.
 */
export const validateMagicNumbers = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const files: Express.Multer.File[] = [];
  if (req.file) files.push(req.file);
  else if (Array.isArray(req.files)) files.push(...req.files);
  else if (req.files && typeof req.files === "object") {
    Object.values(req.files).forEach((val) => {
      files.push(...(Array.isArray(val) ? val : [val]));
    });
  }

  if (files.length === 0) return next();

  for (const file of files) {
    // Sanitização preventiva do nome original
    file.originalname = sanitizeFilename(file.originalname);

    if (!file.buffer || file.buffer.length < 4) continue;

    const hex = file.buffer.toString("hex", 0, 4).toUpperCase();
    let isSafe = false;

    if (ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
      if (hex.startsWith("FFD8FF")) isSafe = true; // JPEG
      else if (hex === "89504E47") isSafe = true; // PNG
      else if (hex === "47494638") isSafe = true; // GIF
      else if (hex === "52494646") { // WEBP/RIFF
        const format = file.buffer.toString("ascii", 8, 12);
        if (format === "WEBP") isSafe = true;
      }
    } 
    else if (ALLOWED_CV_MIMES.has(file.mimetype)) {
      if (hex === "25504446") isSafe = true; // PDF
      else if (hex === "D0CF11E0") isSafe = true; // .doc
      else if (hex === "504B0304") isSafe = true; // .docx
    }
    else if (ALLOWED_SPREADSHEET_MIMES.has(file.mimetype)) {
      if (hex === "504B0304") isSafe = true; // .xlsx
      else if (hex === "D0CF11E0") isSafe = true; // .xls
      else if (file.mimetype === "text/csv" || file.mimetype === "text/plain") {
        isSafe = true; // Csv files dont have magic numbers consistently
      }
    }

    if (!isSafe) {
      const errorMsg = `🚨 [SECURITY] Magic Number mismatch: ${file.originalname} | Mimetype: ${file.mimetype} | Hex: ${hex}`;
      console.warn(errorMsg);
      
      Sentry.captureMessage(errorMsg, {
        level: "warning",
        extra: {
          originalname: file.originalname,
          mimetype: file.mimetype,
          hex,
          size: file.size,
        },
      });

      return res.status(400).json({
        success: false,
        message: `Conteúdo de arquivo suspeito detectado para o tipo ${file.mimetype}. O arquivo foi rejeitado por segurança.`,
      });
    }
  }

  next();
};
