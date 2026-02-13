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
} from "../../services/productService";
import { ImportModal } from "./components/ImportModal";
import { SyncConfigModal } from "./components/SyncConfigModal";
import { FileDown, Upload, RefreshCw, Save, X, CheckSquare, Square } from "lucide-react";
import AdminLayout from "./components/AdminLayout";
import { toast } from "react-hot-toast";
import { Button } from "../../components/ui/Button";
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
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingValues, setEditingValues] = useState<{ [id: string]: { price?: number; stock?: number } }>({});

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
        all: true, // Based on original code which set all: true
      }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: productService.getCategories,
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

  const handleInlineChange = (id: string, field: "price" | "stock", value: string) => {
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

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-500">Gerencie o catálogo da loja</p>
          </div>
        </div>

        {/* Header Actions */}
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
            <Button variant="outline" onClick={() => setIsImportOpen(true)} title="Importar">
              <Upload size={18} className="mr-2" /> Importar
            </Button>
            <Button variant="outline" onClick={handleExport} title="Exportar">
              <FileDown size={18} className="mr-2" /> Exportar
            </Button>
            <Button variant="outline" onClick={() => setIsSyncOpen(true)} title="Sincronizar">
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

            <Link
              to="/admin/products/new"
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold"
            >
              <Plus size={18} />
              Novo
            </Link>
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center justify-between">
            <span className="font-medium text-blue-800">
              {selectedProducts.length} produtos selecionados
            </span>
            <div className="flex gap-2">
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
                      {selectedProducts.length === products.length && products.length > 0 ? (
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
                            <p className="font-bold text-gray-900 line-clamp-1" title={product.name}>
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
                              handleInlineChange(product.id, "price", e.target.value)
                            }
                            onBlur={() => saveInlineEdit(product.id)}
                            onKeyDown={(e) => e.key === "Enter" && saveInlineEdit(product.id)}
                          />
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
                              handleInlineChange(product.id, "stock", e.target.value)
                            }
                            onBlur={() => saveInlineEdit(product.id)}
                            onKeyDown={(e) => e.key === "Enter" && saveInlineEdit(product.id)}
                          />
                          <span className="text-xs text-gray-400">{product.unit || 'un'}</span>
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
    </AdminLayout>
  );
};

export default AdminProducts;
