/**
 * Regras de Status de Pedido conforme PRD Técnico
 */

export type DeliveryMode = 'retirada' | 'entrega';

export type OrderStatus =
  | 'aguardando'
  | 'em_separacao'
  | 'pronto_para_retirada'
  | 'saiu_para_entrega'
  | 'entregue'
  | 'cancelado';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  aguardando: 'Aguardando',
  em_separacao: 'Em separação',
  pronto_para_retirada: 'Pronto para retirada',
  saiu_para_entrega: 'Saiu para entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export const ALLOWED_STATUSES_BY_MODE: Record<DeliveryMode, OrderStatus[]> = {
  retirada: [
    'aguardando',
    'em_separacao',
    'pronto_para_retirada',
    'entregue',
    'cancelado',
  ],
  entrega: [
    'aguardando',
    'em_separacao',
    'saiu_para_entrega',
    'entregue',
    'cancelado',
  ],
};

/**
 * Valida se um status é permitido para um determinado modo de entrega
 */
export function isStatusAllowed(deliveryMode: DeliveryMode, status: string): boolean {
  const allowed = ALLOWED_STATUSES_BY_MODE[deliveryMode];
  return !!allowed && allowed.includes(status as OrderStatus);
}

/**
 * Retorna os próximos status sugeridos baseados no status atual
 * (Opcional, para facilitar a UI)
 */
export function getNextPossibleStatuses(deliveryMode: DeliveryMode, currentStatus: OrderStatus): OrderStatus[] {
  const allowed = ALLOWED_STATUSES_BY_MODE[deliveryMode];
  
  // Regras simples de fluxo linear sugerido
  const flow: Record<OrderStatus, OrderStatus[]> = {
    aguardando: ['em_separacao', 'cancelado'],
    em_separacao: deliveryMode === 'retirada' ? ['pronto_para_retirada', 'cancelado'] : ['saiu_para_entrega', 'cancelado'],
    pronto_para_retirada: ['entregue', 'cancelado'],
    saiu_para_entrega: ['entregue', 'cancelado'],
    entregue: [],
    cancelado: [],
  };

  return (flow[currentStatus] || []).filter(s => allowed.includes(s));
}
