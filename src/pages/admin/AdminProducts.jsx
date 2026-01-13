import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Eye,
  MoreVertical,
} from "lucide-react";
import { api } from "../../services/api";
import AdminLayout from "./components/AdminLayout";
import { toast } from "react-hot-toast";

const AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  const page = searchParams.get("page") || 1;
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts({
        page,
        search,
        category,
        all: true,
      });
      if (response.success) {
        setData(response.data); // data is array, but pagination wrapper? Check controller.
        // Controller returns { success: true, data: products, pagination: {...} }
        // Ah, api.getProducts in api.js returns data directly?
        // api.js: return fetchWithAuth... -> returns data (the json body)
        // So response is the full object.
      }
    } catch (err) {
      setError(err.message);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      if (response.success) setCategories(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, search, category]);

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      await api.deleteProduct(id);
      toast.success("Produto excluído com sucesso");
      fetchProducts();
    } catch (err) {
      toast.error("Erro ao excluir: " + err.message);
    }
  };

  // Quick fix for search input state
  const [searchInput, setSearchInput] = useState(search);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) params.set("search", searchInput);
    else params.delete("search");
    params.set("page", 1);
    setSearchParams(params);
  };

  return (
    <AdminLayout title="Produtos" subtitle="Gerencie o catálogo da loja">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <form
          onSubmit={onSearchSubmit}
          className="flex gap-2 flex-1 w-full md:max-w-md"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Buscar
          </button>
        </form>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            className="border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-primary-500"
            value={category}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              if (e.target.value) params.set("category", e.target.value);
              else params.delete("category");
              setSearchParams(params);
            }}
          >
            <option value="">Todas Categorias</option>
            {categories.map((cat) => (
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
            Novo Produto
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
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
              {data && data.length > 0 ? (
                data.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
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
                          <p className="font-bold text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.category?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          product.stock > 10
                            ? "bg-green-100 text-green-700"
                            : product.stock > 0
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.stock} {product.unit}
                      </span>
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
                    colSpan="6"
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
    </AdminLayout>
  );
};

export default AdminProducts;
