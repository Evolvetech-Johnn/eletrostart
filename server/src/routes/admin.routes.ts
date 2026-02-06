import express from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import {
  getMessages,
  getMessage,
  updateMessageStatus,
  updateMessageMeta,
  bulkMessagesAction,
  deleteMessage,
  getDashboard,
  syncDiscordMessages,
  exportMessages,
  getTags,
  createTag,
  deleteTag,
  testDiscordIntegration,
  getDiscordLogs,
  getUsers,
  syncCategories,
} from "../controllers/admin.controller";

const router = express.Router();

// Todas as rotas admin requerem autenticação
router.use(authenticate);
router.use(requireAdmin);

// POST /api/admin/categories/sync - Sincronizar categorias e produtos
router.post("/categories/sync", syncCategories);

// POST /api/admin/messages/sync - Sincronizar mensagens do Discord
router.post("/messages/sync", syncDiscordMessages);

// GET /api/admin/dashboard - Estatísticas do dashboard
router.get("/dashboard", getDashboard);

// GET /api/admin/messages/export - Exportar mensagens (antes de :id)
router.get("/messages/export", exportMessages);

// PATCH /api/admin/messages/bulk - Ações em massa
router.patch("/messages/bulk", bulkMessagesAction);

// GET /api/admin/messages - Lista mensagens com paginação e filtros
router.get("/messages", getMessages);

// GET /api/admin/messages/:id - Detalhes de uma mensagem
router.get("/messages/:id", getMessage);

// PATCH /api/admin/messages/:id - Atualizar status
router.patch("/messages/:id", updateMessageStatus);

// PATCH /api/admin/messages/:id/meta - Atualizar metadados (notas, prioridade, assign)
router.patch("/messages/:id/meta", updateMessageMeta);

// DELETE /api/admin/messages/:id - Arquivar mensagem
router.delete("/messages/:id", deleteMessage);

// Tags
router.get("/tags", getTags);
router.post("/tags", createTag);
router.delete("/tags/:id", deleteTag);

// Integrações
router.post("/integrations/discord/test", testDiscordIntegration);
router.get("/integrations/discord/logs", getDiscordLogs);

// Users
router.get("/users", getUsers);

export default router;
