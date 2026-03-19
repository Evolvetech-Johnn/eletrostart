/**
 * Rotas de Pagamento — MercadoPago
 *
 * POST /api/payments/pix          → Gerar QR Code PIX para um pedido
 * POST /api/payments/webhook      → Webhook MercadoPago (IPN)
 * GET  /api/payments/:paymentId   → Consultar status de pagamento
 */

import { Router } from "express";
import express from "express";
import { createPix, handleWebhook, checkPaymentStatus } from "../controllers/payment.controller";

const router = Router();

// Criar pagamento PIX (público — chamado logo após criar o pedido)
router.post("/pix", createPix);

// Webhook do MercadoPago — DEVE usar raw body para validação de assinatura
// express.json() padrão é suficiente; a assinatura é validada pelo header x-signature
router.post("/webhook", express.json(), handleWebhook);

// Consultar status de pagamento (público — polling no frontend)
router.get("/:paymentId", checkPaymentStatus);

export default router;
