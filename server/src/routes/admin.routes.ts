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
  getDashboardAnalytics,
  exportMessages,
  getTags,
  createTag,
  deleteTag,
  getAuditLogs,
  getUsers,
  createUser,
  updateUser,
  updateUserRole,
  updateUserStatus,
  resetPassword,
  syncCategories,
} from "../controllers/admin.controller";

const router = express.Router();

// Todas as rotas admin requerem autenticação
router.use(authenticate);
router.use(requireAdmin);

// POST /api/admin/categories/sync - Sincronizar categorias e produtos
router.post("/categories/sync", syncCategories);

// GET /api/admin/dashboard - Estatísticas do dashboard
router.get("/dashboard", getDashboard);
// GET /api/admin/dashboard/analytics - Estatísticas avançadas
router.get("/dashboard/analytics", getDashboardAnalytics);

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

// Audit Logs
router.get("/audit/logs", getAuditLogs);

// Users
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/status", updateUserStatus);
router.post("/users/reset-password", resetPassword);

export default router;
