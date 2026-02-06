import express from 'express';
import { createMessage, getMessagesPublic } from '../controllers/message.controller';

const router = express.Router();

// POST /api/messages - Criar nova mensagem de contato (público)
router.post('/', createMessage);

// GET /api/messages - Estatísticas públicas (sem dados sensíveis)
router.get('/', getMessagesPublic);

export default router;
