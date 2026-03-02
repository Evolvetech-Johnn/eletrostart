import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import React, { useMemo } from "react";
import { PackageOpen, Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productService, Product } from "../../../../services/productService";
import { OrderFormValues } from "../schema/orderSchema";
import { toast } from "react-hot-toast";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const OrderItemsTable = () => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<OrderFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Watch products to calculate line totals
  const itemsWatched = useWatch({
    control,
    name: "items",
  });

  // Fetch active products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "active"],
    queryFn: async () => {
      const all = await productService.getProducts();
      return all.filter((p) => p.active && p.stock > 0);
    },
  });

  // Product Dictionary for O(1) lookups
  const productDict = useMemo(() => {
    return products.reduce((acc: Record<string, Product>, p: Product) => {
      acc[p.id] = p;
      return acc;
    }, {});
  }, [products]);

  const handleProductSelect = (index: number, productId: string) => {
    setValue(`items.${index}.productId`, productId, { shouldValidate: true });
    
    // Auto-fill price
    if (productId && productDict[productId]) {
      setValue(`items.${index}.unitPrice`, productDict[productId].price, {
        shouldValidate: true,
      });
    }
  };

  const handleQtyChange = (index: number, qtyString: string, maxStock?: number) => {
    let raw = parseInt(qtyString, 10);
    if (isNaN(raw) || raw < 1) raw = 1;

    if (maxStock && raw > maxStock) {
      toast.error(`Estoque máximo: ${maxStock}`, { id: `stock-${index}` });
      raw = maxStock;
    }

    setValue(`items.${index}.quantity`, raw, { shouldValidate: true });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <PackageOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Itens do Pedido
            </h2>
            <p className="text-sm text-gray-500">Selecione os produtos e controle as quantidades.</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-100/80 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
          <div className="col-span-6 md:col-span-5">Produto</div>
          <div className="col-span-3 md:col-span-2 text-center">Preço Uni.</div>
          <div className="col-span-3 md:col-span-2 text-center">Qtd</div>
          <div className="col-span-12 md:col-span-2 text-right hidden md:block">Subtotal</div>
          <div className="col-span-1 text-center hidden md:block">Ação</div>
        </div>

        {/* Table Body */}
        {fields.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Nenhum produto adicionado
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {fields.map((field, index) => {
              const currentProductId = itemsWatched[index]?.productId;
              const currentProduct = currentProductId ? productDict[currentProductId] : null;
              const price = itemsWatched[index]?.unitPrice || 0;
              const qty = itemsWatched[index]?.quantity || 1;
              const subtotal = price * qty;
              const rowErrors = errors?.items?.[index] as any;

              return (
                <div key={field.id} className="grid grid-cols-12 gap-y-3 gap-x-4 p-4 items-center hover:bg-white transition-colors">
                  
                  {/* Select Produto */}
                  <div className="col-span-12 md:col-span-5">
                    <select
                      value={currentProductId || ""}
                      onChange={(e) => handleProductSelect(index, e.target.value)}
                      className={`w-full bg-white border outline-none focus:ring-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                        rowErrors?.productId ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-primary/20 focus:border-primary"
                      }`}
                    >
                      <option value="">Buscar produto...</option>
                      {isLoading ? (
                        <option disabled>Carregando...</option>
                      ) : (
                        products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code ? `[${p.code}] ` : ""}{p.name}
                          </option>
                        ))
                      )}
                    </select>
                    {currentProduct && (
                      <div className="text-[10px] text-gray-400 mt-1 pl-1">
                        Estoque disponível: <span className="font-bold text-gray-600">{currentProduct.stock}</span>
                      </div>
                    )}
                  </div>

                  {/* Preço Unitário (Somente Leitura por enquanto) */}
                  <div className="col-span-4 md:col-span-2 flex justify-center">
                    <div className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg w-full text-center">
                      {fmt(price)}
                    </div>
                  </div>

                  {/* Quantidade */}
                  <div className="col-span-4 md:col-span-2 flex justify-center">
                    <input
                      type="number"
                      min={1}
                      max={currentProduct?.stock || 9999}
                      value={qty}
                      onChange={(e) => handleQtyChange(index, e.target.value, currentProduct?.stock)}
                      className="w-20 text-center border outline-none focus:ring-2 focus:ring-primary/20 border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                      disabled={!currentProductId}
                    />
                  </div>

                  {/* Subtotal da linha */}
                  <div className="col-span-4 md:col-span-2 text-right">
                    <div className="text-sm font-bold text-gray-900 border-b border-transparent">
                      {fmt(subtotal)}
                    </div>
                  </div>

                  {/* Remover */}
                  <div className="col-span-12 md:col-span-1 flex md:justify-center justify-end">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover linha"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Botão Add */}
      <div className="mt-4 flex justify-between items-center">
        {errors.items?.root?.message && (
          <span className="text-sm text-red-500 font-medium">{errors.items.root.message}</span>
        )}
        <button
          type="button"
          onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors ml-auto"
        >
          <Plus className="w-4 h-4" />
          Adicionar novo item
        </button>
      </div>

    </div>
  );
};

export default OrderItemsTable;
