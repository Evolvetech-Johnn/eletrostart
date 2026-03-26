/**
 * CSRF Protection — Double Submit Cookie Pattern
 *
 * Como funciona:
 * 1. O servidor gera um token CSRF aleatório e o envia num cookie legível pelo JS (csrf_token, httpOnly: false).
 * 2. O frontend lê o cookie e envia o mesmo valor no header `X-CSRF-Token` de cada request mutante (POST/PUT/PATCH/DELETE).
 * 3. Este middleware verifica se o valor do header bate com o do cookie.
 *    Se bater → requisição legítima (mesmo origin/cookie domain).
 *    Se faltar → 403 Forbidden.
 *
 * Por que Double-Submit Cookie é adequado para SPA:
 * - Não requer estado no servidor (sessão/DB).
 * - Compatível com JWT stateless.
 * - Funciona com CORS + credentials.
 */

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";
const CSRF_TOKEN_LENGTH = 32; // 32 bytes → 64 hex chars
const CSRF_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Gera e injeta um token CSRF no cookie (legível por JS).
 * Chamar UMA VEZ nas rotas que iniciam sessão (ex: após login bem-sucedido)
 * ou como middleware global de estabelecimento de token.
 */
export const issueCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.[CSRF_COOKIE] || crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
  const isProduction = process.env.NODE_ENV === "production";

  // Se o cookie não existir, cria-o
  if (!req.cookies?.[CSRF_COOKIE]) {
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,    // DEVE ser false para o JS poder ler em domínios iguais
      secure: true,       // Sempre true em produção para sameSite: 'none' operar
      sameSite: isProduction ? "none" : "lax",
      maxAge: CSRF_COOKIE_MAX_AGE,
      path: "/",
    });
  }

  // SEMPRE envia no header para suportar cross-domain (onde o JS não lê o cookie)
  res.set("X-CSRF-Token", token);

  next();
};

/**
 * Valida o token CSRF: compara o cookie com o header X-CSRF-Token.
 * Aplicar em todas as rotas admin que mutam dados (POST, PUT, PATCH, DELETE).
 */
export const verifyCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // Métodos seguros (GET, HEAD, OPTIONS) não precisam de CSRF
  const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
  if (safeMethods.has(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE] as string | undefined;
  const headerToken = req.headers[CSRF_HEADER] as string | undefined;

  if (!cookieToken || !headerToken) {
    console.warn(`🛡️ [CSRF] Missing token. Cookie: ${!!cookieToken}, Header: ${!!headerToken}. Rota: ${req.originalUrl}`);
    return res.status(403).json({
      error: true,
      code: "CSRF_MISSING",
      message: "Token de segurança ausente. Recarregue a página e tente novamente.",
    });
  }

  // Comparação em tempo constante para evitar timing attacks
  try {
    const cookieBuf = Buffer.from(cookieToken, "hex");
    const headerBuf = Buffer.from(headerToken, "hex");

    if (
      cookieBuf.length !== headerBuf.length ||
      !crypto.timingSafeEqual(cookieBuf, headerBuf)
    ) {
      console.warn(`🛡️ [CSRF] Token mismatch. Cookie: ${cookieToken?.substring(0, 8)}..., Header: ${headerToken?.substring(0, 8)}...`);
      return res.status(403).json({
        error: true,
        code: "CSRF_INVALID",
        message: "Token de segurança inválido. Recarregue a página e tente novamente.",
      });
    }
  } catch {
    return res.status(403).json({
      error: true,
      code: "CSRF_INVALID",
      message: "Token de segurança inválido.",
    });
  }

  next();
};
