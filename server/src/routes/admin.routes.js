import express from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { 
  getMessages, 
  getMessage, 
  updateMessageStatus, 
  deleteMessage,
  getDashboard,
  syncDiscordMessages
} from '../controllers/admin.controller.js';

const router = express.Router();

// Todas as rotas admin requerem autenticação
router.use(authenticate);
router.use(requireAdmin);

// POST /api/admin/messages/sync - Sincronizar mensagens do Discord
router.post('/messages/sync', syncDiscordMessages);

// GET /api/admin/dashboard - Estatísticas do dashboard
router.get('/dashboard', getDashboard);

// GET /api/admin/messages - Lista mensagens com paginação e filtros
router.get('/messages', getMessages);

// GET /api/admin/messages/:id - Detalhes de uma mensagem
router.get('/messages/:id', getMessage);

// PATCH /api/admin/messages/:id - Atualizar status
router.patch('/messages/:id', updateMessageStatus);

// DELETE /api/admin/messages/:id - Arquivar mensagem
router.delete('/messages/:id', deleteMessage);

export default router;
