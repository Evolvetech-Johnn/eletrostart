import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, me, createAdmin, logout } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// Rate limiter específico para login — 5 tentativas por minuto por IP
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minuto
  max: 5,                      // 5 tentativas
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não conta tentativas bem-sucedidas
  message: {
    error: true,
    code: "RATE_LIMIT_LOGIN",
    message: "Muitas tentativas de login. Aguarde 1 minuto e tente novamente.",
  },
});

// POST /api/auth/login — com rate limit específico
router.post('/login', loginLimiter, login);

// POST /api/auth/logout — limpa o cookie httpOnly
router.post('/logout', logout);

// GET /api/auth/me — Verificar token e obter dados do usuário
router.get('/me', authenticate, me);

// POST /api/auth/register — Criar novo admin (protegido)
router.post('/register', authenticate, createAdmin);

export default router;
