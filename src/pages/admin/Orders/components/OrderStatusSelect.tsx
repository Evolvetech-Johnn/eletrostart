import React, { useState } from 'react';
import { OrderStatus, ORDER_STATUS_META } from '../../../../constants/orderStatus';
import { Check, ChevronDown, Loader2 } from 'lucide-react';

interface OrderStatusSelectProps {
  currentStatus: OrderStatus;
  deliveryMode: 'retirada' | 'entrega';
  onStatusChange: (newStatus: OrderStatus, note?: string) => Promise<void>;
  disabled?: boolean;
}

export const OrderStatusSelect: React.FC<OrderStatusSelectProps> = ({
  currentStatus,
  deliveryMode,
  onStatusChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState("");

  const allowedStatuses: OrderStatus[] = deliveryMode === 'retirada' 
    ? ["aguardando", "em_separacao", "pronto_para_retirada", "entregue", "cancelado"]
    : ["aguardando", "em_separacao", "saiu_para_entrega", "entregue", "cancelado"];

  const handleSelect = async (status: OrderStatus) => {
    if (status === currentStatus) return;
    setIsOpen(false);
    setShowNoteDialog(status);
  };

  const confirmChange = async () => {
    if (!showNoteDialog) return;
    setLoading(true);
    try {
      await onStatusChange(showNoteDialog, note);
      setShowNoteDialog(null);
      setNote("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
      >
        <span className="flex items-center">
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
          ) : (
            <div className={`w-2 h-2 rounded-full mr-2 ${ORDER_STATUS_META[currentStatus]?.bg.replace('bg-', 'bg-')}`} 
                 style={{ backgroundColor: 'currentColor' }} />
          )}
          {ORDER_STATUS_META[currentStatus]?.label || currentStatus}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 w-56 mt-1 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {allowedStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleSelect(status)}
                  className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                    status === currentStatus ? 'text-primary font-semibold' : 'text-gray-700'
                  }`}
                >
                  {ORDER_STATUS_META[status]?.label}
                  {status === currentStatus && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {showNoteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar alteração de status
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Deseja alterar o status para <strong>{ORDER_STATUS_META[showNoteDialog]?.label}</strong>? 
              Você pode adicionar uma observação interna opcional.
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Cliente solicitou alteração, em separação iniciada..."
              className="w-full h-24 p-2 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowNoteDialog(null); setNote(""); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmChange}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? "Processando..." : "Confirmar Alteração"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
