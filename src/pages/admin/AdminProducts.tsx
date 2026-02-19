import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  productService,
  Product,
  Category,
  LowStockProduct,
} from "../../services/productService";
import { CATEGORY_MIN_PRICE_BY_SLUG } from "../../config/pricing";
import { ImportModal } from "./components/ImportModal";
import { SyncConfigModal } from "./components/SyncConfigModal";
import { QuickAddProductModal } from "./components/QuickAddProductModal";
import {
  FileDown,
  Upload,
  RefreshCw,
  CheckSquare,
  Square,
  AlertTriangle,
} from "lucide-react";
import AdminLayout from "./components/AdminLayout";
import { toast } from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../../components/ui/Input";

const AdminProducts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  // Local state for search input to avoid debounce issues for now
  const [searchInput, setSearchInput] = useState(search);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingValues, setEditingValues] = useState<{
    [id: string]: { price?: number; stock?: number };
  }>({});
  const [bulkPercent, setBulkPercent] = useState<string>("");
  const [bulkActiveTarget, setBulkActiveTarget] = useState<
    "activate" | "deactivate"
  >("activate");
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [stockModalValue, setStockModalValue] = useState<string>("");
  const [stockModalReason, setStockModalReason] = useState<string>("");
  const [stockThreshold, setStockThreshold] = useState<number>(5);
  const { loading, isAuthenticated } = useAuth();

  // Queries
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({
    queryKey: ["products", { page, search, category }],
    queryFn: () =>
      productService.getProducts({
        page,
        search,
        category,
        all: true,
      }),
    enabled: !loading && isAuthenticated,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: productService.getCategories,
    enabled: !loading && isAuthenticated,
  });

  const { data: minPriceConfig } = useQuery({
    queryKey: ["minPriceConfig"],
    queryFn: productService.getMinPriceConfig,
    enabled: !loading && isAuthenticated,
  });

  const minPriceMap = minPriceConfig || CATEGORY_MIN_PRICE_BY_SLUG;

  const {
    data: lowStockProducts = [],
    isLoading: isLoadingLowStock,
    error: lowStockError,
  } = useQuery<LowStockProduct[]>({
    queryKey: ["lowStockProducts", stockThreshold],
    queryFn: () => productService.getLowStockProducts(stockThreshold),
    enabled: !loading && isAuthenticated,
  });

  // Mutations
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto atualizado");
    },
    onError: (err: any) => {
      toast.error("Erro ao atualizar: " + (err.message || "Erro desconhecido"));
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto excluído com sucesso");
    },
    onError: (err: any) => {
      toast.error("Erro ao excluir: " + (err.message || "Erro desconhecido"));
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: productService.bulkDeleteProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelectedProducts([]);
      toast.success("Produtos excluídos");
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data: Partial<Product> }) =>
      productService.bulkUpdateProducts(ids, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelectedProducts([]);
      toast.success("Produtos atualizados");
    },
    onError: (err: any) => {
      toast.error("Erro ao atualizar em massa: " + (err.message || "Erro"));
    },
  });

  const adjustStockMutation = useMutation({
    mutationFn: ({
      id,
      newStock,
      reason,
    }: {
      id: string;
      newStock: number;
      reason?: string;
    }) => productService.adjustProductStock(id, { newStock, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["lowStockProducts"] });
      toast.success("Estoque ajustado");
      setStockModalProduct(null);
      setStockModalValue("");
      setStockModalReason("");
    },
    onError: (err: any) => {
      toast.error("Erro ao ajustar estoque: " + (err.message || "Erro"));
    },
  });

  // Handlers
  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Excluir ${selectedProducts.length} produtos?`)) {
      bulkDeleteMutation.mutate(selectedProducts);
    }
  };

  const handleBulkPricePercent = async () => {
    const pct = parseFloat(bulkPercent);
    if (isNaN(pct)) {
      toast.error("Informe uma porcentagem válida (ex: 10 ou -5)");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("Selecione ao menos um produto");
      return;
    }
    try {
      const selectedSet = new Set(selectedProducts);
      const affected = (products as Product[]).filter((p) =>
        selectedSet.has(p.id),
      );
      // Apply percentage client-side; update each product
      await Promise.all(
        affected.map((p) => {
          const newPrice = Number((p.price * (1 + pct / 100)).toFixed(2));
          return productService.updateProduct(p.id, { price: newPrice });
        }),
      );
      toast.success("Preços atualizados");
      setBulkPercent("");
      setSelectedProducts([]);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err: any) {
      toast.error("Erro ao atualizar preços: " + (err.message || "Erro"));
    }
  };

  const handleBulkToggleActive = () => {
    if (selectedProducts.length === 0) {
      toast.error("Selecione ao menos um produto");
      return;
    }
    const target = bulkActiveTarget === "activate";
    bulkUpdateMutation.mutate({
      ids: selectedProducts,
      data: { active: target },
    });
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p: Product) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((p) => p !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const handleInlineChange = (
    id: string,
    field: "price" | "stock",
    value: string,
  ) => {
    const numValue = parseFloat(value);
    setEditingValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: isNaN(numValue) ? undefined : numValue,
      },
    }));
  };

  const saveInlineEdit = (id: string) => {
    const updates = editingValues[id];
    if (updates) {
      updateProductMutation.mutate({ id, data: updates });
      // Clear edit state for this item after short delay or keep it?
      // Keeping it keeps the value in input matching what we typed.
    }
  };

  const handleExport = async () => {
    try {
      await productService.exportProducts();
      toast.success("Download iniciado");
    } catch (error) {
      toast.error("Erro ao exportar");
    }
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) params.set("search", searchInput);
    else params.delete("search");
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value) params.set("category", e.target.value);
    else params.delete("category");
    setSearchParams(params);
  };

  const openStockModal = (product: Product) => {
    setStockModalProduct(product);
    setStockModalValue(String(product.stock ?? 0));
    setStockModalReason("");
  };

  const handleAdjustStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct) return;
    const parsed = Number(stockModalValue);
    if (!Number.isFinite(parsed)) {
      toast.error("Informe um estoque válido");
      return;
    }
    if (parsed < 0) {
      toast.error("Estoque não pode ser negativo");
      return;
    }
    adjustStockMutation.mutate({
      id: stockModalProduct.id,
      newStock: parsed,
      reason: stockModalReason || undefined,
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-500">Gerencie o catálogo da loja</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 bg-white p-4 rounded-lg border shadow-sm">
            <form
              onSubmit={onSearchSubmit}
              className="flex gap-2 flex-1 w-full md:max-w-md"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder="Buscar produtos..."
                  className="pl-10"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Button type="submit">Buscar</Button>
            </form>

            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsImportOpen(true)}
                title="Importar"
              >
                <Upload size={18} className="mr-2" /> Importar
              </Button>
              <Button variant="outline" onClick={handleExport} title="Exportar">
                <FileDown size={18} className="mr-2" /> Exportar
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsSyncOpen(true)}
                title="Sincronizar"
              >
                <RefreshCw size={18} className="mr-2" /> Sync
              </Button>

              <select
                className="border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-primary-500"
                value={category}
                onChange={handleCategoryChange}
              >
                <option value="">Todas Categorias</option>
                {categories.map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                onClick={() => setIsQuickAddOpen(true)}
                title="Criação rápida"
              >
                <Plus size={18} className="mr-2" /> Rápido
              </Button>
              <Link
                to="/admin/products/new"
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold"
              >
                <Plus size={18} />
                Novo
              </Link>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" size={18} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Estoque crítico
                  </p>
                  <p className="text-xs text-gray-500">
                    Produtos com estoque menor ou igual ao limite
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Limite</span>
                <Input
                  type="number"
                  className="w-20 h-8 text-right"
                  value={stockThreshold}
                  onChange={(e) =>
                    setStockThreshold(
                      Number.isFinite(Number(e.target.value))
                        ? Number(e.target.value)
                        : 0,
                    )
                  }
                />
              </div>
            </div>
            {isLoadingLowStock ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando estoque crítico...</span>
              </div>
            ) : lowStockError ? (
              <div className="text-xs text-red-600 flex items-center gap-2">
                <AlertCircle size={14} />
                <span>Erro ao carregar estoque crítico</span>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-700 mb-2">
                  {lowStockProducts.length} produto
                  {lowStockProducts.length === 1 ? "" : "s"} com estoque baixo
                </p>
                <ul className="space-y-1 max-h-40 overflow-y-auto text-xs">
                  {lowStockProducts.slice(0, 8).map((p) => {
                    const isOut = p.stock <= 0;
                    return (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex flex-col">
                          <span
                            className={`font-medium ${
                              isOut ? "text-red-600" : "text-gray-800"
                            }`}
                          >
                            {p.name}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {p.sku || "-"} ·{" "}
                            {p.category ? p.category.name : "Sem categoria"}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isOut
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {p.stock} un
                        </span>
                      </li>
                    );
                  })}
                  {lowStockProducts.length === 0 && (
                    <li className="text-gray-500">Nenhum produto crítico.</li>
                  )}
                </ul>
              </>
            )}
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center justify-between">
            <span className="font-medium text-blue-800">
              {selectedProducts.length} produtos selecionados
            </span>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-white border border-blue-200 rounded px-2 py-1">
                <span className="text-xs text-blue-800">Preço %</span>
                <Input
                  type="number"
                  className="w-24 h-8 text-right"
                  placeholder="ex: 10 ou -5"
                  value={bulkPercent}
                  onChange={(e) => setBulkPercent(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={handleBulkPricePercent}
                  title="Aplicar porcentagem"
                >
                  Aplicar
                </Button>
              </div>
              <div className="flex items-center gap-2 bg-white border border-blue-200 rounded px-2 py-1">
                <select
                  className="border-none bg-transparent text-sm text-blue-800 focus:outline-none"
                  value={bulkActiveTarget}
                  onChange={(e) =>
                    setBulkActiveTarget(
                      e.target.value === "activate" ? "activate" : "deactivate",
                    )
                  }
                >
                  <option value="activate">Ativar</option>
                  <option value="deactivate">Desativar</option>
                </select>
                <Button
                  variant="outline"
                  onClick={handleBulkToggleActive}
                  disabled={bulkUpdateMutation.isPending}
                >
                  {bulkUpdateMutation.isPending
                    ? "Aplicando..."
                    : "Aplicar status"}
                </Button>
              </div>
              <Button
                variant="danger"
                onClick={handleBulkDelete}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 size={16} className="mr-2" /> Excluir Selecionados
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoadingProducts ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : productsError ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} /> {(productsError as Error).message}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-500 text-sm">
                    <button onClick={toggleSelectAll}>
                      {selectedProducts.length === products.length &&
                      products.length > 0 ? (
                        <CheckSquare size={18} />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-sm">
                    Produto
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-sm">
                    Categoria
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-sm">
                    Preço
                    <span
                      className="ml-1 text-xs text-gray-400"
                      title="Regras de preço mínimo por categoria são aplicadas ao salvar"
                    >
                      (mín.)
                    </span>
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-sm">
                    Estoque
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-sm">
                    Status
                  </th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-sm text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products && products.length > 0 ? (
                  products.map((product: Product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button onClick={() => toggleSelect(product.id)}>
                          {selectedProducts.includes(product.id) ? (
                            <CheckSquare size={18} className="text-blue-600" />
                          ) : (
                            <Square size={18} className="text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package
                                className="m-auto text-gray-400"
                                size={20}
                              />
                            )}
                          </div>
                          <div>
                            <p
                              className="font-bold text-gray-900 line-clamp-1"
                              title={product.name}
                            >
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.sku}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.category?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">R$</span>
                          <Input
                            type="number"
                            className="w-24 h-8 text-right"
                            value={
                              editingValues[product.id]?.price !== undefined
                                ? editingValues[product.id].price
                                : product.price
                            }
                            onChange={(e) =>
                              handleInlineChange(
                                product.id,
                                "price",
                                e.target.value,
                              )
                            }
                            onBlur={() => saveInlineEdit(product.id)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && saveInlineEdit(product.id)
                            }
                          />
                          {product.category?.slug &&
                            minPriceMap[product.category.slug] && (
                              <span
                                className="text-[10px] text-gray-400"
                                title={`Preço mínimo para ${product.category.name}: R$ ${minPriceMap[product.category.slug].toFixed(2)}`}
                              >
                                ≥ R${" "}
                                {minPriceMap[product.category.slug].toFixed(2)}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-20 h-8 text-right"
                            value={
                              editingValues[product.id]?.stock !== undefined
                                ? editingValues[product.id].stock
                                : product.stock
                            }
                            onChange={(e) =>
                              handleInlineChange(
                                product.id,
                                "stock",
                                e.target.value,
                              )
                            }
                            onBlur={() => saveInlineEdit(product.id)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && saveInlineEdit(product.id)
                            }
                          />
                          <span className="text-xs text-gray-400">
                            {product.unit || "un"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            product.active
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openStockModal(product)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded flex items-center gap-1 text-xs"
                            title="Ajustar estoque"
                          >
                            <AlertTriangle size={16} />
                          </button>
                          <Link
                            to={`/admin/products/${product.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination (Simplified) */}
            {/* Add pagination controls if needed, assuming controller returns pagination meta */}
          </div>
        )}
      </div>
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          // Optional: close modal or just let user close
        }}
      />
      <SyncConfigModal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
        }}
      />
      <QuickAddProductModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
        }}
      />
      {stockModalProduct && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-2">Ajustar estoque</h2>
            <p className="text-sm text-gray-500 mb-4">
              {stockModalProduct.name} ({stockModalProduct.sku || "sem SKU"})
            </p>
            <form onSubmit={handleAdjustStockSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque atual
                </label>
                <div className="text-sm text-gray-900 font-semibold">
                  {stockModalProduct.stock} {stockModalProduct.unit || "un"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Novo estoque
                </label>
                <Input
                  type="number"
                  value={stockModalValue}
                  onChange={(e) => setStockModalValue(e.target.value)}
                  className="w-full"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo (opcional)
                </label>
                <Input
                  type="text"
                  value={stockModalReason}
                  onChange={(e) => setStockModalReason(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStockModalProduct(null)}
                  disabled={adjustStockMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={adjustStockMutation.isPending}
                >
                  {adjustStockMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
