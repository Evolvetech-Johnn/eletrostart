import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { CreditCard, Loader2 } from "lucide-react";
import { OrderFormValues } from "../schema/orderSchema";



const PAYMENT_OPTIONS = [
  { value: "pix", label: "PIX", description: "5% desc" },
  { value: "cartao_credito", label: "Cartão de Crédito", description: "Até 12x" },
  { value: "cartao_debito", label: "Cartão de Débito", description: "À vista" },
  { value: "boleto", label: "Boleto", description: "Até 3 dias" },
  { value: "dinheiro", label: "Dinheiro", description: "À vista" },
  { value: "transferencia", label: "Transferência", description: "Bancária" },
];

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface Props {
  isLoading: boolean;
}

const OrderSummaryCard: React.FC<Props> = ({ isLoading }) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<OrderFormValues>();

  const items = useWatch({ control, name: "items" }) || [];
  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  // Calculations
  const subtotal = items.reduce((acc, curr) => {
    const qty = curr.quantity || 1;
    const price = curr.unitPrice || 0;
    return acc + price * qty;
  }, 0);

  // Exemplo de Frete Fixo/Free placeholder
  const shipping = 0; // Você pode evoluir isso para input manual
  const discount = paymentMethod === "pix" ? subtotal * 0.05 : 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 sticky top-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-gray-400" />
        Resumo do Pedido
      </h2>

      {/* Payment Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Forma de Pagamento
        </label>
        <div className="space-y-2">
          {PAYMENT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === opt.value
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  value={opt.value}
                  {...register("paymentMethod")}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-900">
                  {opt.label}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase text-gray-500 bg-white px-2 py-0.5 rounded-md border shadow-sm">
                {opt.description}
              </span>
            </label>
          ))}
        </div>
        {errors.paymentMethod && (
          <p className="mt-2 text-xs text-red-500">
            {errors.paymentMethod.message}
          </p>
        )}
      </div>

      {/* Notes / Obs */}
      <div className="mb-6 pt-6 border-t border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Observações Internas (Opcional)
        </label>
        <textarea
          {...register("notes")}
          rows={3}
          placeholder="Ex: Cliente vai retirar na loja / Embalagem para presente..."
          className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50/50 focus:bg-white transition-all resize-none"
        />
      </div>

      {/* Values Box */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal Itens</span>
          <span className="font-medium text-gray-900">{fmt(subtotal)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-medium">
            <span>Desconto (PIX 5%)</span>
            <span>- {fmt(discount)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200/60 pt-3 flex justify-between items-center mt-3">
          <span className="text-base font-bold text-gray-900">Total Final</span>
          <span className="text-2xl font-black text-primary">
            {fmt(total)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white py-4 px-4 rounded-xl font-bold text-base hover:bg-primary/95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_8px_20px_rgb(34,41,152,0.2)]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processando e Salvando...
            </>
          ) : (
            "Finalizar Pedido"
          )}
        </button>
        <p className="text-center text-[10px] text-gray-400 font-medium uppercase tracking-wider">
          O status inicial do pedido será Pendente
        </p>
      </div>
    </div>
  );
};

export default OrderSummaryCard;
