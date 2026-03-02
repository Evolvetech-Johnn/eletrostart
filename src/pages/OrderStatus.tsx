import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Clock, CheckCircle, Truck, Package, XCircle, ShoppingBag,
  AlertCircle, Loader2, ExternalLink, Copy,
} from "lucide-react";
import { orderService } from "../services/orderService";
import { toast } from "react-hot-toast";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  PENDING:   { label: "Aguardando Confirmação", icon: Clock,         color: "text-amber-600",   bg: "bg-amber-100" },
  PAID:      { label: "Pagamento Confirmado",    icon: CheckCircle,  color: "text-blue-600",    bg: "bg-blue-100" },
  SHIPPED:   { label: "Em Trânsito",             icon: Truck,        color: "text-indigo-600",  bg: "bg-indigo-100" },
  DELIVERED: { label: "Entregue",                icon: Package,      color: "text-emerald-600", bg: "bg-emerald-100" },
  CANCELLED: { label: "Cancelado",               icon: XCircle,      color: "text-red-600",     bg: "bg-red-100" },
};

const STEPS = ["PENDING", "PAID", "SHIPPED", "DELIVERED"] as const;

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const OrderStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order-public", id],
    queryFn: () => orderService.getOrderPublic(id!),
    enabled: !!id,
    retry: 1,
    staleTime: 30_000,
  });

  const currentStepIndex = order ? STEPS.indexOf(order.status as typeof STEPS[number]) : -1;

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
            <button onClick={copyId} className="text-gray-400 hover:text-[#222998] transition-colors">
              <Copy size={14} />
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
            {(() => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              const Icon = cfg.icon;
              return (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cfg.bg}`}>
                      <Icon className={`w-7 h-7 ${cfg.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Status Atual</p>
                      <p className={`text-xl font-black ${cfg.color}`}>{cfg.label}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Progress Bar (only for non-cancelled) */}
            {order.status !== "CANCELLED" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Progresso</h2>
                <div className="relative">
                  {/* Track line */}
                  <div className="absolute top-5 left-5 right-5 h-1 bg-gray-100 z-0">
                    <div
                      className="h-full bg-[#222998] transition-all duration-700"
                      style={{ width: `${currentStepIndex < 0 ? 0 : (currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                    />
                  </div>
                  <div className="relative z-10 flex justify-between">
                    {STEPS.map((step, i) => {
                      const cfg = STATUS_CONFIG[step];
                      const Icon = cfg.icon;
                      const done = i <= currentStepIndex;
                      return (
                        <div key={step} className="flex flex-col items-center gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            done ? "bg-[#222998] border-[#222998]" : "bg-white border-gray-200"
                          }`}>
                            <Icon size={16} className={done ? "text-white" : "text-gray-400"} />
                          </div>
                          <span className={`text-[10px] font-bold text-center max-w-[60px] ${done ? "text-[#222998]" : "text-gray-400"}`}>
                            {cfg.label.split(" ")[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Order Info */}
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

            {/* Tracking Code */}
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

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Histórico</h2>
                <div className="space-y-4">
                  {order.statusHistory.map((h, i) => {
                    const cfg = STATUS_CONFIG[h.status] || STATUS_CONFIG.PENDING;
                    const Icon = cfg.icon;
                    return (
                      <div key={i} className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
                          <Icon size={14} className={cfg.color} />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</p>
                          {h.notes && <p className="text-xs text-gray-500 mt-0.5">{h.notes}</p>}
                          <p className="text-xs text-gray-400 mt-0.5">{fmtDate(h.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Back */}
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
