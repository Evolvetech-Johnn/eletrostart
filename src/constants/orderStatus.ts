/**
 * Constantes de Status de Pedido — Frontend
 * Espelho de server/src/constants/orderStatus.ts
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

export const ORDER_STATUS_META: Record<OrderStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
}> = {
  CREATED:         { label: "Pedido Criado",          color: "text-gray-600",    bg: "bg-gray-100",    border: "border-gray-200"   },
  PAYMENT_PENDING: { label: "Aguardando Pagamento",   color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200"  },
  PAID:            { label: "Pagamento Confirmado",   color: "text-blue-600",    bg: "bg-blue-50",     border: "border-blue-200"   },
  PROCESSING:      { label: "Em Preparação",          color: "text-indigo-600",  bg: "bg-indigo-50",   border: "border-indigo-200" },
  SHIPPED:         { label: "Em Trânsito",            color: "text-purple-600",  bg: "bg-purple-50",   border: "border-purple-200" },
  DELIVERED:       { label: "Entregue",               color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200"},
  CANCELED:        { label: "Cancelado",              color: "text-red-600",     bg: "bg-red-50",      border: "border-red-200"    },
  REFUNDED:        { label: "Reembolsado",            color: "text-gray-600",    bg: "bg-gray-100",    border: "border-gray-200"   },
};

/** Passos visíveis na linha do tempo (excluindo terminais negativos) */
export const ORDER_PROGRESS_STEPS: OrderStatus[] = [
  "CREATED",
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];
