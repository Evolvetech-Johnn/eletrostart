import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

// Middleware de autenticação JWT
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("🔒 [AUTH] Token ausente na requisição a", req.originalUrl);
      return res.status(401).json({
        error: true,
        code: "AUTH_MISSING",
        message: "Token de autenticação não fornecido",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    // Buscar usuário no banco
    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.active) {
      console.log(`🔒 [AUTH] Usuário inativo ou deletado no banco. ID: ${decoded.userId}`);
      return res.status(401).json({
        error: true,
        code: "AUTH_USER_NOT_FOUND",
        message: "Usuário não encontrado ou inativo",
      });
    }

    // Adicionar usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name || "", // Handle potential null name
      role: (user.role || "").toUpperCase(),
    };

    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      console.log("🔒 [AUTH] Token corrompido ou com assinatura inválida");
      return res.status(401).json({
        error: true,
        code: "TOKEN_INVALID",
        message: "Token inválido",
      });
    }
    if (error.name === "TokenExpiredError") {
      console.log("🔒 [AUTH] Token expirado");
      return res.status(401).json({
        error: true,
        code: "TOKEN_EXPIRED",
        message: "Token expirado",
      });
    }
    next(error);
  }
};

// Middleware para verificar role de admin (aceita ADMIN e SUPER_ADMIN)
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const role = (req.user?.role || "").toUpperCase();
  if (!req.user || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
      console.log(`🔒 [AUTH] Acesso negado por ROLE. Role atual: ${role}, Usuário ID: ${req.user?.id}, Rota: ${req.originalUrl}`);
    return res.status(403).json({
      error: true,
      code: "NOT_ADMIN",
      message: "Acesso negado. Permissão de administrador necessária.",
    });
  }
  next();
};
