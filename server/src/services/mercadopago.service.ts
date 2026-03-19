/**
 * Serviço MercadoPago — PIX e Checkout Pro
 *
 * Variáveis de ambiente necessárias (server/.env):
 *   MP_ACCESS_TOKEN=APP_USR-xxxxxxxx   (Token de Produção ou Sandbox)
 *   MP_WEBHOOK_SECRET=xxxxxxxxxx       (Assinatura do webhook — configurado no painel MP)
 *
 * Documentação: https://www.mercadopago.com.br/developers/pt/docs
 */

import { MercadoPagoConfig, Payment } from "mercadopago";

// ─── Cliente MercadoPago ─────────────────────────────────────────────────────
const getClient = () => {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MP_ACCESS_TOKEN não configurado nas variáveis de ambiente.");
  }
  return new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
};

// ─── Tipos ───────────────────────────────────────────────────────────────────
export interface CreatePaymentParams {
  orderId: string;
  amount: number;          // Valor em R$ (BRL)
  description: string;     // Ex: "Pedido #abc123 — Eletrostart"
  payerEmail: string;
  payerName: string;
  notificationUrl?: string;
}

export interface PaymentResult {
  id: number;
  status: string;              // "pending" | "approved" | "rejected"
  statusDetail: string;
  pixQrCode?: string;          // Copia-e-cola PIX
  pixQrCodeBase64?: string;    // QR Code em Base64 para exibição
  expiresAt?: string;          // ISO DateTime de expiração
}

// ─── Criar Pagamento PIX ─────────────────────────────────────────────────────
export async function createPixPayment(
  params: CreatePaymentParams
): Promise<PaymentResult> {
  const client = getClient();
  const payment = new Payment(client);

  const body = {
    transaction_amount: params.amount,
    description: params.description,
    payment_method_id: "pix",
    payer: {
      email: params.payerEmail,
      first_name: params.payerName.split(" ")[0],
      last_name: params.payerName.split(" ").slice(1).join(" ") || "-",
    },
    metadata: {
      order_id: params.orderId,
    },
    notification_url: params.notificationUrl,
  };

  const response = await payment.create({ body });

  return {
    id: response.id!,
    status: response.status ?? "pending",
    statusDetail: response.status_detail ?? "",
    pixQrCode: response.point_of_interaction?.transaction_data?.qr_code,
    pixQrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64,
    expiresAt: response.date_of_expiration ?? undefined,
  };
}

// ─── Verificar status de pagamento ───────────────────────────────────────────
export async function getPaymentStatus(paymentId: number): Promise<{
  status: string;
  statusDetail: string;
  orderId?: string;
}> {
  const client = getClient();
  const payment = new Payment(client);
  const response = await payment.get({ id: paymentId });

  return {
    status: response.status ?? "unknown",
    statusDetail: response.status_detail ?? "",
    orderId: (response.metadata as any)?.order_id,
  };
}

// ─── Validar assinatura do webhook ───────────────────────────────────────────
import crypto from "crypto";

export function validateWebhookSignature(
  rawBody: string,
  xSignature: string,
  xRequestId: string,
  dataId: string,
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return false; // Webhook secret não configurado — aceita (dev mode)

  // Template: "id:{dataId};request-id:{requestId};ts:{ts};"
  const [tsEntry] = xSignature.split(",").filter((p) => p.startsWith("ts="));
  const [v1Entry] = xSignature.split(",").filter((p) => p.startsWith("v1="));
  if (!tsEntry || !v1Entry) return false;

  const ts = tsEntry.split("=")[1];
  const v1 = v1Entry.split("=")[1];

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(v1));
}
