/**
 * Constantes de Status de Pedido — Fonte Única de Verdade
 * Compartilhado entre backend (/server/src/constants/) e frontend (via cópia em /src/constants/)
 *
 * Fluxo principal:
 *   CREATED → PAYMENT_PENDING → PAID → PROCESSING → SHIPPED → DELIVERED
 *                                                           ↘ CANCELED → REFUNDED
 */

export const ORDER_STATUSES = [
  "CREATED",
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
  "REFUNDED",
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

/**
 * Transições de status permitidas (admin pode mover para estes estados)
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CREATED:         ["PAYMENT_PENDING", "CANCELED"],
  PAYMENT_PENDING: ["PAID", "CANCELED"],
  PAID:            ["PROCESSING", "CANCELED"],
  PROCESSING:      ["SHIPPED", "CANCELED"],
  SHIPPED:         ["DELIVERED", "CANCELED"],
  DELIVERED:       ["REFUNDED"],
  CANCELED:        ["CREATED"],   // reactivação manual
  REFUNDED:        [],
};

/**
 * Metadados de exibição (labels e cores para UI)
 */
export const ORDER_STATUS_META: Record<OrderStatus, {
  label: string;
  labelEn: string;
  color: "amber" | "blue" | "green" | "indigo" | "purple" | "emerald" | "red" | "gray";
}> = {
  CREATED:         { label: "Pedido Criado",          labelEn: "Created",         color: "gray"    },
  PAYMENT_PENDING: { label: "Aguardando Pagamento",   labelEn: "Payment Pending", color: "amber"   },
  PAID:            { label: "Pagamento Confirmado",   labelEn: "Paid",            color: "blue"    },
  PROCESSING:      { label: "Em Preparação",          labelEn: "Processing",      color: "indigo"  },
  SHIPPED:         { label: "Em Trânsito",            labelEn: "Shipped",         color: "purple"  },
  DELIVERED:       { label: "Entregue",               labelEn: "Delivered",       color: "emerald" },
  CANCELED:        { label: "Cancelado",              labelEn: "Canceled",        color: "red"     },
  REFUNDED:        { label: "Reembolsado",            labelEn: "Refunded",        color: "gray"    },
};

/** Status considerados "finais" — sem mais transições permitidas */
export const TERMINAL_STATUSES: OrderStatus[] = ["DELIVERED", "REFUNDED"];

/** Status onde o estoque já foi debitado */
export const STOCK_DEBITED_STATUSES: OrderStatus[] = [
  "CREATED", "PAYMENT_PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED",
];
