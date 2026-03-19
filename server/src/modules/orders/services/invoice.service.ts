import { prisma } from "../../../lib/prisma";
import { logAction } from "../../../services/audit.service";

/**
 * Serviço de Integração de Nota Fiscal Eletrônica (NF-e).
 *
 * Em um cenário real, este serviço comunicaria com APIs como Focus NFe, Bling, Tiny, etc.
 * Para o MVP, simulamos o tempo de resposta e disparamos um log de auditoria documentando o processo.
 */
export class InvoiceService {
  async emitInvoiceForOrder(orderId: string) {
    try {
      console.log(`[InvoiceService] Iniciando emissão de NF-e para o pedido: ${orderId}...`);

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error("Pedido não encontrado para emissão de NF-e");
      }

      if (order.paymentStatus !== "PAID") {
        throw new Error("A NF-e só pode ser emitida para pedidos já pagos");
      }

      // Simulação de processamento na SEFAZ (2 segundos)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockNfeKey = `NFE-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      // Atualizar o histórico do pedido
      await (prisma as any).orderStatusHistory.create({
        data: {
          orderId,
          status: order.status,
          notes: `NF-e emitida com sucesso. Chave: ${mockNfeKey}`,
        },
      });

      // Registrar na auditoria
      await logAction({
        action: "INVOICE_EMITTED",
        targetId: orderId,
        targetType: "ORDER",
        details: { nfeKey: mockNfeKey, total: order.total },
      }).catch(() => {});

      console.log(`✅ [InvoiceService] NF-e emitida para ${orderId}. Chave: ${mockNfeKey}`);
      
      return { success: true, key: mockNfeKey };
    } catch (error: any) {
      console.error(`❌ [InvoiceService] Falha ao emitir NF-e para ${orderId}:`, error.message);
      
      // Registrar falha na auditoria
      await logAction({
        action: "INVOICE_FAILED",
        targetId: orderId,
        targetType: "ORDER",
        details: { error: error.message },
      }).catch(() => {});
      
      throw error;
    }
  }
}

export const invoiceService = new InvoiceService();
