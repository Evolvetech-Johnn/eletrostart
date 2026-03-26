import { OrderStatus, ORDER_STATUS_LABELS } from "../../../utils/orderStatusRules";

export const whatsappService = {
  /**
   * Gera o link wa.me com mensagem formatada
   */
  generateWhatsAppUrl(phone: string | null, message: string): string {
    if (!phone) return "";
    const cleanPhone = phone.replace(/\D/g, "");
    // Adiciona 55 se não tiver DDI
    const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
  },

  /**
   * Gera templates de mensagem baseados no status do pedido
   */
  generateOrderMessage(order: {
    orderNumber: string | null;
    customerName: string;
    status: OrderStatus;
    total: number;
    deliveryMode: string;
  }): string {
    const num = order.orderNumber ? `#${order.orderNumber}` : "do seu pedido";
    const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;
    const modeLabel = order.deliveryMode === 'retirada' ? 'Retirada' : 'Entrega';

    switch (order.status) {
      case 'aguardando':
        return `Olá, ${order.customerName}! Recebemos seu pedido ${num} na Eletrostart.\n\n` +
               `Tipo: ${modeLabel}\n` +
               `Status: Aguardando\n` +
               `Total: ${order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\n` +
               `Em breve seu pedido será separado. Obrigado!`;

      case 'pronto_para_retirada':
        return `Olá, ${order.customerName}! Seu pedido ${num} está pronto para retirada na Eletrostart!\n\n` +
               `Status: Pronto para retirada\n\n` +
               `Aguardamos você.`;

      case 'saiu_para_entrega':
        return `Olá, ${order.customerName}! Seu pedido ${num} saiu para entrega.\n\n` +
               `Status: Saiu para entrega\n\n` +
               `Agradecemos a preferência!`;

      case 'entregue':
        return `Olá, ${order.customerName}! Seu pedido ${num} foi finalizado com sucesso.\n\n` +
               `Status: Entregue\n\n` +
               `Esperamos que goste dos produtos!`;

      case 'cancelado':
        return `Olá, ${order.customerName}. Seu pedido ${num} foi cancelado.\n\n` +
               `Caso tenha dúvidas, entre em contato conosco.`;

      default:
        return `Olá, ${order.customerName}! O status do seu pedido ${num} foi atualizado para: ${statusLabel}.`;
    }
  }
};
