/**
 * Constantes de Status de Pedido — Frontend
 * Alinhado com PRD Técnico Eletrostart
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

export const ORDER_STATUS_META: Record<OrderStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
}> = {
  aguardando:           { label: "Aguardando",           color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200"  },
  em_separacao:         { label: "Em separação",         color: "text-blue-600",    bg: "bg-blue-50",     border: "border-blue-200"   },
  pronto_para_retirada: { label: "Pronto para retirada", color: "text-purple-600",  bg: "bg-purple-50",   border: "border-purple-200" },
  saiu_para_entrega:    { label: "Saiu para entrega",    color: "text-orange-600",  bg: "bg-orange-50",   border: "border-orange-200" },
  entregue:             { label: "Entregue",             color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200"},
  cancelado:            { label: "Cancelado",            color: "text-red-600",     bg: "bg-red-50",      border: "border-red-200"    },
};

/** Passos visíveis na linha do tempo conforme o fluxo operacional */
export const ORDER_PROGRESS_STEPS: Record<'retirada' | 'entrega', OrderStatus[]> = {
  retirada: ["aguardando", "em_separacao", "pronto_para_retirada", "entregue"],
  entrega: ["aguardando", "em_separacao", "saiu_para_entrega", "entregue"],
};
