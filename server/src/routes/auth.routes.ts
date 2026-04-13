import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, me, createAdmin, logout, getCsrfToken } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Rate limiter específico para login — 5 tentativas por 15 minutos por IP em caso de falha
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,      // 15 minutos
  max: 5,                        // 5 tentativas
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,  // Não conta tentativas bem-sucedidas
  message: {
    error: true,
    code: "RATE_LIMIT_LOGIN",
    message: "Muitas tentativas de login com erro. Aguarde 15 minutos e tente novamente.",
  },
});

// POST /api/auth/login — com rate limit específico
router.post('/login', loginLimiter, login);

// GET /api/auth/csrf — Obter token CSRF para o frontend (útil se o cookie for bloqueado)
router.get('/csrf', loginLimiter, getCsrfToken);

// POST /api/auth/logout — limpa o cookie httpOnly
router.post('/logout', logout);

// GET /api/auth/me — Verificar token e obter dados do usuário
router.get('/me', authenticate, me);

// POST /api/auth/register — Criar novo admin (protegido)
const bootstrapOrAuthenticate = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const adminCount = await prisma.adminUser.count();
    if (adminCount === 0) return next();
    return authenticate(req, res, next);
  } catch (error) {
    return next(error);
  }
};

router.post('/register', bootstrapOrAuthenticate, createAdmin);

export default router;
