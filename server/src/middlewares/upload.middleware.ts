import multer from "multer";

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
