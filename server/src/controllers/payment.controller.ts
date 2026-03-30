/**
 * Controller de Pagamentos — MercadoPago
 *
 * Rotas:
 *   POST /api/payments/pix          → Cria pagamento PIX para um pedido
 *   POST /api/payments/webhook      → Recebe notificações do MercadoPago
 *   GET  /api/payments/:paymentId   → Consulta status de um pagamento
 */

import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  createPixPayment,
  getPaymentStatus,
  validateWebhookSignature,
} from "../services/mercadopago.service";
import { logAction } from "../services/audit.service";
import { releaseSessionReservations } from "../services/reservation.service";
import { invoiceService } from "../modules/orders/services/invoice.service";

// ─── POST /api/payments/pix ──────────────────────────────────────────────────
export const createPix = async (req: Request, res: Response) => {
  try {
    const { orderId, sessionId } = req.body as { orderId: string; sessionId?: string };

    if (!orderId) {
      return res.status(400).json({ error: true, message: "orderId é obrigatório" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: true, message: "Pedido não encontrado" });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(409).json({ error: true, message: "Pedido já pago" });
    }

    const isProduction = process.env.NODE_ENV === "production";
    const baseUrl = process.env.FRONTEND_URL || "https://eletrostart.com.br";

    const pixResult = await createPixPayment({
      orderId,
      amount: order.total,
      description: `Pedido #${orderId.slice(0, 8)} — Eletrostart`,
      payerEmail: order.customerEmail ?? "",   // customerEmail pode ser null no schema
      payerName: order.customerName ?? "Cliente",
      notificationUrl: isProduction
        ? `${process.env.BACKEND_URL || baseUrl}/api/payments/webhook`
        : undefined, // Webhooks não chegam em localhost
    });


    // Atualiza status do pedido para PAYMENT_PENDING
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAYMENT_PENDING",
        paymentMethod: "PIX",
        paymentStatus: "PENDING",
      },
    });

    // Libera a reserva de carinho se houver (o pedido foi criado — estoque real já debitado)
    if (sessionId) {
      await releaseSessionReservations(sessionId).catch(() => {});
    }

    await logAction({
      action: "PAYMENT_INITIATED",
      targetId: orderId,
      targetType: "ORDER",
      details: { mpPaymentId: pixResult.id, paymentMethod: "PIX" },
    }).catch(() => {});

    res.json({
      success: true,
      data: {
        paymentId: pixResult.id,
        status: pixResult.status,
        pixQrCode: pixResult.pixQrCode,
        pixQrCodeBase64: pixResult.pixQrCodeBase64,
        expiresAt: pixResult.expiresAt,
      },
    });
  } catch (error: any) {
    console.error("❌ [Payment] Erro ao criar PIX:", error.message);
    res.status(500).json({
      error: true,
      message: error.message?.includes("MP_ACCESS_TOKEN")
        ? "Gateway de pagamento não configurado. Entre em contato pelo WhatsApp."
        : "Erro ao gerar pagamento PIX. Tente novamente.",
    });
  }
};

// ─── GET /api/payments/:paymentId ────────────────────────────────────────────
export const checkPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const result = await getPaymentStatus(Number(paymentId));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: true, message: "Erro ao consultar pagamento" });
  }
};

// ─── POST /api/payments/webhook ──────────────────────────────────────────────
// Recebe notificações do MercadoPago (IPN/Webhook)
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const xSignature  = req.headers["x-signature"] as string ?? "";
    const xRequestId  = req.headers["x-request-id"] as string ?? "";
    const dataId      = req.body?.data?.id as string ?? "";

    // Validar assinatura (HMAC-SHA256)
    if (xSignature && process.env.MP_WEBHOOK_SECRET) {
      const rawBody = JSON.stringify(req.body);
      const isValid = validateWebhookSignature(rawBody, xSignature, xRequestId, dataId);
      if (!isValid) {
        console.warn("🛡️ [Webhook] Assinatura inválida recebida");
        return res.status(401).json({ error: true, message: "Assinatura inválida" });
      }
    }

    const type = req.body?.type as string;

    // Processar somente notificações de pagamento
    if (type !== "payment" || !dataId) {
      return res.sendStatus(200); // MP espera 200 mesmo para tipos ignorados
    }

    const paymentStatus = await getPaymentStatus(Number(dataId));

    if (paymentStatus.status === "approved" && paymentStatus.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: paymentStatus.orderId },
      });

      if (order && order.paymentStatus !== "PAID") {
        await prisma.order.update({
          where: { id: paymentStatus.orderId },
          data: {
            paymentStatus: "PAID",
            status: "PAID",
          },
        });

        // Registra no histórico de status
        await (prisma as any).orderStatusHistory.create({
          data: {
            orderId: paymentStatus.orderId,
            status: "PAID",
            notes: `Pagamento PIX confirmado pelo MercadoPago (ID: ${dataId})`,
          },
        });

        await logAction({
          action: "PAYMENT_CONFIRMED",
          targetId: paymentStatus.orderId,
          targetType: "ORDER",
          details: { mpPaymentId: dataId, mpStatus: paymentStatus.statusDetail },
        }).catch(() => {});

        console.log(`✅ [Webhook] Pagamento confirmado para pedido ${paymentStatus.orderId}`);

        // ── Gatilho de Automação de NFe ──
        // Dispara a emissão de nota em background sem travar o response do MP
        invoiceService.emitInvoiceForOrder(paymentStatus.orderId).catch(err => {
          console.error(`[Webhook] Async NFe Error:`, err);
        });
      }
    }

    res.sendStatus(200);
  } catch (error: any) {
    console.error("❌ [Webhook] Erro:", error.message);
    res.sendStatus(500);
  }
};
