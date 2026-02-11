import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error("❌ Unexpected Error:", err);

  // Prisma Errors (basic handling)
  if ((err as any).code?.startsWith("P")) {
    return res.status(400).json({
      success: false,
      message: "Database operation failed",
      error: process.env.NODE_ENV === "development" ? (err as any).message : undefined,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
