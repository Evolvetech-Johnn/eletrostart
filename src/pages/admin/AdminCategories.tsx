import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Folder, Search, RefreshCw, Image as ImageIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService, Category } from "../../services/productService";
import AdminLayout from "./components/AdminLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

const AdminCategories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { loading: authLoading, isAuthenticated } = useAuth();

  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: ["categories"],
    queryFn: productService.getCategories,
    enabled: !authLoading && isAuthenticated,
  });

  const syncMutation = useMutation({
    mutationFn: productService.syncCategories,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(
        `Sincronização concluída!\nCategorias: ${data.stats.categoriesProcessed}\nProdutos: ${data.stats.productsProcessed}`,
        { duration: 5000 },
      );
    },
    onError: (error: any) => {
      console.error("Erro na sincronização:", error);
      toast.error(
        "Erro ao sincronizar: " + (error.message || "Erro desconhecido"),
      );
    },
  });

  const handleSync = () => {
    const promise = syncMutation.mutateAsync();
    toast.promise(promise, {
      loading: "Sincronizando categorias...",
      success: "Sincronizado com sucesso!",
      error: "Falha na sincronização",
    });
  };

  const filteredCategories = categories.filter((cat) => {
    const name = cat?.name || "";
    const slug = cat?.slug || "";

    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Folder className="text-primary" />
              Categorias
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Gerencie as categorias de produtos sincronizadas com as pastas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSync}
              isLoading={syncMutation.isPending}
              loadingText="Sincronizando..."
              variant="secondary"
            >
              {!syncMutation.isPending && (
                <RefreshCw size={18} className="mr-2" />
              )}
              Sincronizar Pastas
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-96">
            <Input
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={20} />}
              className="bg-gray-50 border-gray-200"
            />
          </div>
          <div className="text-sm text-gray-500">
            Total: <strong>{filteredCategories.length}</strong> categorias
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex-grow">
          <div className="w-full overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                    Imagem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p>Carregando categorias...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Nenhuma categoria encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category: Category) => (
                    <tr
                      key={category.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={16} className="text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-600 rounded">
                          {category.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                        {category.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Add actions later if needed */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
