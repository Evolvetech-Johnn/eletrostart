import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, Clock, RefreshCcw, Copy, Loader2, QrCode, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import apiClient from "../services/apiClient";

interface PixPaymentProps {
  orderId: string;
  amount: number;
  sessionId?: string;
  onPaymentConfirmed: () => void;
}

interface PixData {
  paymentId: number;
  status: string;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  expiresAt?: string;
}

const PixPayment: React.FC<PixPaymentProps> = ({
  orderId,
  amount,
  // customerName e customerEmail foram removidos pois não são usados na renderização
  sessionId,
  onPaymentConfirmed,
}) => {
  const [loading, setLoading] = useState(true);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [polling, setPolling] = useState(false);

  // Formatar valor BRL
  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  // Criar pagamento PIX ao montar o componente
  useEffect(() => {
    const createPix = async () => {
      try {
        setLoading(true);
        const res = await apiClient.post("/payments/pix", {
          orderId,
          sessionId,
        }) as any;
        setPixData(res.data);
      } catch (err: any) {
        setError(err.message || "Erro ao gerar QR Code PIX. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    createPix();
  }, [orderId, sessionId]);

  // Polling para verificar confirmação de pagamento a cada 5 segundos
  const checkStatus = useCallback(async () => {
    if (!pixData?.paymentId || confirmed) return;
    setPolling(true);
    try {
      const res = await apiClient.get(`/payments/${pixData.paymentId}`) as any;
      if (res.data?.status === "approved") {
        setConfirmed(true);
        toast.success("Pagamento PIX confirmado! 🎉");
        onPaymentConfirmed();
      }
    } catch {} finally {
      setPolling(false);
    }
  }, [pixData?.paymentId, confirmed, onPaymentConfirmed]);

  useEffect(() => {
    if (!pixData || confirmed) return;
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [pixData, confirmed, checkStatus]);

  const copyPixCode = () => {
    if (pixData?.pixQrCode) {
      navigator.clipboard.writeText(pixData.pixQrCode);
      toast.success("Código PIX copiado!");
    }
  };

  // ── Confirmed ──────────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-black text-emerald-800 mb-2">Pagamento Confirmado!</h3>
        <p className="text-emerald-700 text-sm">Seu pedido foi pago com sucesso via PIX.</p>
      </div>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-10 h-10 text-[#222998] animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Gerando QR Code PIX...</p>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium text-sm">{error}</p>
      </div>
    );
  }

  // ── PIX QR Code ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <QrCode className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-black text-gray-900">Pagar com PIX</h3>
          <p className="text-xs text-gray-400">Escaneie o QR Code ou copie o código</p>
        </div>
        <span className="ml-auto font-black text-[#222998] text-xl">{fmt(amount)}</span>
      </div>

      {/* QR Code Image */}
      {pixData?.pixQrCodeBase64 ? (
        <div className="flex justify-center">
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm">
            <img
              src={`data:image/png;base64,${pixData.pixQrCodeBase64}`}
              alt="QR Code PIX"
              className="w-48 h-48 object-contain"
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center">
            <QrCode className="w-16 h-16 text-gray-300" />
          </div>
        </div>
      )}

      {/* Copia-e-Cola */}
      {pixData?.pixQrCode && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Pix Copia e Cola</p>
          <div className="flex gap-2 items-center">
            <code className="text-xs text-gray-700 flex-1 break-all bg-white border border-gray-100 rounded-lg p-2 font-mono max-h-16 overflow-y-auto">
              {pixData.pixQrCode}
            </code>
            <button
              onClick={copyPixCode}
              className="shrink-0 w-9 h-9 bg-[#222998] text-white rounded-lg flex items-center justify-center hover:bg-blue-800 transition-colors"
              title="Copiar código PIX"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Status de verificação */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
        {polling ? (
          <Loader2 size={14} className="animate-spin text-[#222998]" />
        ) : (
          <Clock size={14} />
        )}
        <span>Verificando pagamento automaticamente...</span>
        <button onClick={checkStatus} className="text-[#222998] hover:underline font-medium flex items-center gap-1">
          <RefreshCcw size={12} />
        </button>
      </div>

      {/* Expiração */}
      {pixData?.expiresAt && (
        <p className="text-center text-xs text-amber-600 font-medium">
          ⏱ QR Code válido até:{" "}
          {new Date(pixData.expiresAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit", minute: "2-digit",
          })}
        </p>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 text-center">
        💡 Após o pagamento, a confirmação é automática. Não feche esta janela.
      </div>
    </div>
  );
};

export default PixPayment;
