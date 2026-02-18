import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.includes("csv") ||
      file.mimetype.includes("excel") ||
      file.mimetype.includes("spreadsheetml") ||
      file.mimetype.includes("text/plain") // sometimes CSVs are text/plain
    ) {
      cb(null, true);
    } else {
      cb(new Error("Formato de arquivo inválido. Apenas CSV e Excel são permitidos."));
    }
  },
});

// Image upload (memory -> filesystem saved in controller)
const imageStorage = multer.memoryStorage();

export const uploadImages = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per image
  },
  fileFilter: (req, file, cb) => {
    const isImage =
      file.mimetype.startsWith("image/") &&
      !file.mimetype.includes("svg"); // avoid svg for security
    if (isImage) cb(null, true);
    else cb(new Error("Apenas imagens são permitidas (jpg, png, webp)."));
  },
});
