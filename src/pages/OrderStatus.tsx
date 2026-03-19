import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Clock, CheckCircle, Truck, Package, XCircle, ShoppingBag,
  AlertCircle, Loader2, ExternalLink, Copy, RefreshCcw,
  ClipboardList, Wrench, RotateCcw,
} from "lucide-react";
import { orderService } from "../services/orderService";
import { toast } from "react-hot-toast";
import {
  ORDER_STATUS_META,
  ORDER_PROGRESS_STEPS,
  type OrderStatus,
} from "../constants/orderStatus";

// Ícones por status
const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  CREATED:         ClipboardList,
  PAYMENT_PENDING: Clock,
  PAID:            CheckCircle,
  PROCESSING:      Wrench,
  SHIPPED:         Truck,
  DELIVERED:       Package,
  CANCELED:        XCircle,
  REFUNDED:        RotateCcw,
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const OrderStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["order-public", id],
    queryFn: () => orderService.getOrderPublic(id!),
    enabled: !!id,
    retry: 1,
    staleTime: 30_000,
    refetchInterval: 60_000, // Atualiza a cada 1 min automaticamente
  });

  const status = (order?.status ?? "CREATED") as OrderStatus;
  const meta = ORDER_STATUS_META[status] ?? ORDER_STATUS_META.CREATED;
  const StatusIcon = STATUS_ICONS[status] ?? Clock;
  const isCanceled = status === "CANCELED" || status === "REFUNDED";

  const currentStepIndex = ORDER_PROGRESS_STEPS.indexOf(status);

  const copyId = () => {
    navigator.clipboard.writeText(id || "");
    toast.success("ID copiado!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-[#222998]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-[#222998]" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Rastreamento de Pedido</h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
            <span className="font-mono">#{id?.slice(0, 8)}</span>
            <button onClick={copyId} className="text-gray-400 hover:text-[#222998] transition-colors" title="Copiar ID">
              <Copy size={14} />
            </button>
            <button onClick={() => refetch()} className="text-gray-400 hover:text-[#222998] transition-colors" title="Atualizar">
              <RefreshCcw size={14} />
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-[#222998] animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Pedido não encontrado</h2>
            <p className="text-gray-500 text-sm mb-6">
              Verifique se o ID está correto ou entre em contato pelo WhatsApp.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 bg-[#222998] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors">
              Voltar para a Loja
            </Link>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`rounded-2xl p-6 border ${meta.bg} ${meta.border}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/60`}>
                  <StatusIcon className={`w-7 h-7 ${meta.color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Status Atual</p>
                  <p className={`text-xl font-black ${meta.color}`}>{meta.label}</p>
                </div>
              </div>
            </div>

            {/* Progress Steps — só exibe para pedidos não cancelados/reembolsados */}
            {!isCanceled && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Progresso</h2>
                <div className="relative">
                  {/* Linha de fundo */}
                  <div className="absolute top-5 left-5 right-5 h-1 bg-gray-100 z-0">
                    <div
                      className="h-full bg-[#222998] transition-all duration-700"
                      style={{
                        width: `${currentStepIndex < 0 ? 0
                          : (currentStepIndex / (ORDER_PROGRESS_STEPS.length - 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="relative z-10 flex justify-between">
                    {ORDER_PROGRESS_STEPS.map((step, i) => {
                      const stepMeta = ORDER_STATUS_META[step];
                      const StepIcon = STATUS_ICONS[step];
                      const done = currentStepIndex >= 0 && i <= currentStepIndex;
                      return (
                        <div key={step} className="flex flex-col items-center gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            done ? "bg-[#222998] border-[#222998]" : "bg-white border-gray-200"
                          }`}>
                            <StepIcon size={16} className={done ? "text-white" : "text-gray-400"} />
                          </div>
                          <span className={`text-[10px] font-bold text-center max-w-[60px] leading-tight ${
                            done ? "text-[#222998]" : "text-gray-400"
                          }`}>
                            {stepMeta.label.split(" ")[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Banner de cancelamento/reembolso */}
            {isCanceled && (
              <div className={`rounded-2xl p-5 border ${meta.bg} ${meta.border} flex items-center gap-4`}>
                <StatusIcon className={`w-8 h-8 ${meta.color} shrink-0`} />
                <div>
                  <p className={`font-bold ${meta.color}`}>{meta.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">Entre em contato pelo WhatsApp para mais informações.</p>
                </div>
              </div>
            )}

            {/* Informações do Pedido */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Informações</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Cliente</span>
                  <span className="font-semibold text-gray-900">{order.customerName}</span>
                </div>
                {order.customerEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">E-mail</span>
                    <span className="font-mono text-gray-700">{order.customerEmail}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="font-black text-[#222998]">{fmt(order.total)}</span>
                </div>
                {order.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pagamento</span>
                    <span className="font-semibold capitalize">{order.paymentMethod}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Data do pedido</span>
                  <span className="text-gray-700">{fmtDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Última atualização</span>
                  <span className="text-gray-700">{fmtDate(order.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Código de Rastreio */}
            {order.trackingCode && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex items-center gap-4">
                <Truck className="w-8 h-8 text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">Código de Rastreio</p>
                  <p className="font-mono font-bold text-indigo-900 text-lg">{order.trackingCode}</p>
                  <a
                    href={`https://www.correios.com.br/rastreamento?objeto=${order.trackingCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    Rastrear nos Correios <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}

            {/* Histórico de Status */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Histórico</h2>
                <div className="space-y-4">
                  {[...order.statusHistory].reverse().map((h: any, i: number) => {
                    const hStatus = (h.status ?? "CREATED") as OrderStatus;
                    const hMeta = ORDER_STATUS_META[hStatus] ?? ORDER_STATUS_META.CREATED;
                    const HIcon = STATUS_ICONS[hStatus] ?? Clock;
                    return (
                      <div key={i} className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${hMeta.bg}`}>
                          <HIcon size={14} className={hMeta.color} />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${hMeta.color}`}>{hMeta.label}</p>
                          {h.notes && <p className="text-xs text-gray-500 mt-0.5">{h.notes}</p>}
                          <p className="text-xs text-gray-400 mt-0.5">{fmtDate(h.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Voltar */}
            <div className="text-center pt-4">
              <Link to="/" className="text-sm text-[#222998] font-bold hover:underline">
                ← Voltar para a Loja
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
