import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  productService,
  Category,
  Product,
} from "../../../services/productService";
import { CATEGORY_MIN_PRICE_BY_SLUG } from "../../../config/pricing";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { toast } from "react-hot-toast";

interface QuickAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: Product) => void;
}

export const QuickAddProductModal: React.FC<QuickAddProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [image, setImage] = useState("");
  const [unit, setUnit] = useState("un");
  const [active, setActive] = useState(true);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: productService.getCategories,
  });

  const { data: minPriceConfig } = useQuery({
    queryKey: ["minPriceConfig"],
    queryFn: productService.getMinPriceConfig,
  });

  const minPriceMap = minPriceConfig || CATEGORY_MIN_PRICE_BY_SLUG;

  const createMutation = useMutation({
    mutationFn: () =>
      productService.createProduct({
        name: name.trim(),
        price: Number(price),
        stock: stock ? Number(stock) : 0,
        sku: sku.trim() || undefined,
        categoryId: categoryId || undefined,
        image: image.trim() || undefined,
        unit: unit.trim() || "un",
        active,
      }),
    onSuccess: (p) => {
      toast.success("Produto criado");
      onSuccess(p);
      setName("");
      setPrice("");
      setStock("");
      setSku("");
      setCategoryId("");
      setImage("");
      setUnit("un");
      setActive(true);
      onClose();
    },
    onError: (err: any) => {
      toast.error("Erro ao criar: " + (err.message || "Erro desconhecido"));
    },
  });

  if (!isOpen) return null;

  const canSubmit =
    name.trim().length > 0 && price !== "" && !isNaN(Number(price));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Criação rápida de produto</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Nome
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do produto"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Preço (R$)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Estoque
              </label>
              <Input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                SKU (opcional)
              </label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU interno"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {categoryId && (
                <p className="mt-1 text-[10px] text-gray-400">
                  {(() => {
                    const cat = categories.find((c) => c.id === categoryId);
                    if (!cat) return null;
                    const min = minPriceMap[cat.slug];
                    if (!min) return null;
                    return `Preço mínimo para ${cat.name}: R$ ${min.toFixed(2)}`;
                  })()}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Imagem principal (URL)
              </label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/img/produtos/..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Unidade
              </label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="un, kg, m..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="qap-active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <label htmlFor="qap-active" className="text-sm text-gray-700">
              Ativo
            </label>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!canSubmit || createMutation.isPending}
          >
            {createMutation.isPending ? "Salvando..." : "Criar"}
          </Button>
        </div>
      </div>
    </div>
  );
};
