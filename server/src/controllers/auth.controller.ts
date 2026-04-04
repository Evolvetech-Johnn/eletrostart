import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import * as crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

// Cookie name constant — single source of truth
const AUTH_COOKIE = "auth_token";

// Helper: parse maxAge from JWT_EXPIRES_IN env (e.g. "7d" → ms)
const getMaxAgeMs = (): number => {
  const raw = process.env.JWT_EXPIRES_IN || "7d";
  const match = raw.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d
  const [, num, unit] = match;
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return parseInt(num) * (multipliers[unit] ?? multipliers.d);
};

/**
 * Login de administrador
 * Emite JWT via httpOnly Cookie (não no body) para evitar XSS via localStorage
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    console.log(`🔐 Tentativa de login para: ${email || "e-mail ausente"}`);

    if (!email || !password) {
      console.warn("⚠️ Falha no login: E-mail ou senha ausentes no body.");
      return res.status(400).json({
        error: true,
        message: "E-mail e senha são obrigatórios",
      });
    }

    // Buscar usuário
    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        error: true,
        message: "Credenciais inválidas",
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: "Credenciais inválidas",
      });
    }

    // Verificar se usuário está ativo
    if (!user.active) {
      return res.status(403).json({
        error: true,
        message: "Usuário inativo",
      });
    }

    // Atualizar último login
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: (process.env.JWT_EXPIRES_IN ||
          "7d") as jwt.SignOptions["expiresIn"],
      },
    );

    const isProduction = process.env.NODE_ENV === "production";

    // Emitir token via httpOnly Cookie (seguro contra XSS)
    res.cookie(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax", // 'none' permite cross-site cookie
      maxAge: getMaxAgeMs(),
      path: "/",
    });

    // Emitir apenas os dados do usuário. O token é enviado via Cookie httpOnly (seguro).
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verificar token e retornar dados do usuário
 */
export const me = async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
};

/**
 * Logout — limpa o cookie de autenticação
 */
export const logout = async (req: Request, res: Response) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie(AUTH_COOKIE, { 
    path: "/",
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
  });
  res.json({ success: true, message: "Logout realizado com sucesso" });
};

/**
 * Criar usuário admin (apenas para setup inicial ou por outro admin)
 */
export const createAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "E-mail e senha são obrigatórios",
      });
    }

    // Verificar se já existe
    const existing = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return res.status(409).json({
        error: true,
        message: "E-mail já cadastrado",
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = await prisma.adminUser.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
        role: "ADMIN",
      },
    });

    res.status(201).json({
      success: true,
      message: "Administrador criado com sucesso",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retorna o token CSRF atual ou gera um novo
 */
export const getCsrfToken = async (req: Request, res: Response) => {
  const CSRF_COOKIE = "csrf_token";
  const CSRF_TOKEN_LENGTH = 32;
  const isProduction = process.env.NODE_ENV === "production";

  let token = req.cookies?.[CSRF_COOKIE];

  if (!token) {
    token = crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      secure: true,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
  }

  res.json({ success: true, token });
};
