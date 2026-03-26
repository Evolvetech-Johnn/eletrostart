/**
 * Constantes de Status de Pedido — Alinhado com PRD Técnico Eletrostart
 */

export const ORDER_STATUSES = [
  "aguardando",
  "em_separacao",
  "pronto_para_retirada",
  "saiu_para_entrega",
  "entregue",
  "cancelado",
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

/**
 * Metadados de exibição (labels e cores para UI)
 */
export const ORDER_STATUS_META: Record<OrderStatus, {
  label: string;
  color: "amber" | "blue" | "purple" | "orange" | "green" | "red" | "gray";
}> = {
  aguardando:           { label: "Aguardando",           color: "amber"  },
  em_separacao:         { label: "Em separação",         color: "blue"   },
  pronto_para_retirada: { label: "Pronto para retirada", color: "purple" },
  saiu_para_entrega:    { label: "Saiu para entrega",    color: "orange" },
  entregue:             { label: "Entregue",             color: "green"  },
  cancelado:            { label: "Cancelado",            color: "red"    },
};

/** Status onde o estoque está debitado */
export const STOCK_DEBITED_STATUSES: OrderStatus[] = [
  "aguardando", "em_separacao", "pronto_para_retirada", "saiu_para_entrega", "entregue",
];

// Fallbacks para compatibilidade com pedidos antigos (opcional, para mapeamento)
export const LEGACY_STATUS_MAP: Record<string, OrderStatus> = {
  "PENDING": "aguardando",
  "CREATED": "aguardando",
  "PAID": "em_separacao",
  "SHIPPED": "saiu_para_entrega",
  "DELIVERED": "entregue",
  "CANCELED": "cancelado",
  "CANCELLED": "cancelado",
};
