import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import React from "react";
import { PackageOpen, Trash2 } from "lucide-react";
import { Product } from "../../../../services/productService";
import { OrderFormValues } from "../schema/orderSchema";
import { toast } from "react-hot-toast";
import { ProductCombobox } from "./ProductCombobox";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const OrderItemsTable = () => {
  const {
    control,
    setValue,
    getValues,
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

  // Cache of selected products to preserve metadata after selection 
  // without needing to query all products upfront
  const [selectedProductsCache, setSelectedProductsCache] = React.useState<Record<string, Product>>({});

  const handleProductSelect = (product: Product) => {
    // Check if duplicate product exists in the cart
    const currentItems = getValues("items") || [];
    const existingIndex = currentItems.findIndex(
      (item) => item.productId === product.id
    );

    if (existingIndex >= 0) {
      const currentQty = itemsWatched[existingIndex]?.quantity || 1;
      let newQty = currentQty + 1;
      
      if (product.stock && newQty > product.stock) {
        toast.error(`Estoque máximo atingido: ${product.stock}`, { id: `stock-${product.id}` });
        newQty = product.stock;
      } else {
        toast.success("Quantidade acrescida (+1)");
      }
      
      setValue(`items.${existingIndex}.quantity`, newQty, { shouldValidate: true });
    } else {
      // Create entirely new item
      // Check if there is an empty placeholder item
      const emptyIndex = currentItems.findIndex((item) => !item.productId);
      
      if (emptyIndex >= 0) {
        setValue(`items.${emptyIndex}.productId`, product.id, { shouldValidate: true });
        setValue(`items.${emptyIndex}.unitPrice`, product.price, { shouldValidate: true });
        setValue(`items.${emptyIndex}.quantity`, 1, { shouldValidate: true });
      } else {
        append({
          productId: product.id,
          unitPrice: product.price,
          quantity: 1,
        });
      }
      // Save metadata to cache so grid can show product names immediately
      setSelectedProductsCache((prev) => ({ ...prev, [product.id]: product }));
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
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <PackageOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Itens do Pedido
            </h2>
            <p className="text-sm text-gray-500">Busque e adicione produtos ao pedido.</p>
          </div>
        </div>
      </div>

      {/* Global Search Input (Top of Card) */}
      <ProductCombobox 
        onSelect={handleProductSelect}
      />

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
              const currentProduct = currentProductId ? selectedProductsCache[currentProductId] : null;
              const price = itemsWatched[index]?.unitPrice || 0;
              const qty = itemsWatched[index]?.quantity || 1;
              const subtotal = price * qty;
              const rowErrors = errors?.items?.[index] as any;

              return (
                <div key={field.id} className="grid grid-cols-12 gap-y-3 gap-x-4 p-4 items-center hover:bg-white transition-colors">
                  
                  {/* Produto (Texto Fixo da Tabela) */}
                  <div className="col-span-12 md:col-span-5 flex-col flex justify-center">
                    {currentProductId ? (
                      <>
                        <span className="text-sm font-semibold text-gray-900 line-clamp-1">{currentProduct?.name || "Produto não encontrado"}</span>
                        <span className="text-[11px] text-gray-500 mt-0.5 font-mono uppercase">
                          SKU: {currentProduct?.sku || "N/A"} {currentProduct?.code && `| COD: ${currentProduct?.code}`}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Pesquise e adicione um produto acima...</span>
                    )}
                    {rowErrors?.productId && (
                      <span className="text-[11px] text-red-500 mt-1 font-medium">{rowErrors.productId.message}</span>
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
      {/* Helper */}
      <div className="mt-4 flex justify-between items-center">
        {errors.items?.root?.message && (
          <span className="text-sm text-red-500 font-medium">{errors.items.root.message}</span>
        )}
      </div>

    </div>
  );
};

export default OrderItemsTable;
