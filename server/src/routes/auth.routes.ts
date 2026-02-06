import express from 'express';
import { login, me, createAdmin } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// POST /api/auth/login - Login de administrador
router.post('/login', login);

// GET /api/auth/me - Verificar token e obter dados do usuário
router.get('/me', authenticate, me);

// POST /api/auth/register - Criar novo admin (protegido)
router.post('/register', authenticate, createAdmin);

export default router;
