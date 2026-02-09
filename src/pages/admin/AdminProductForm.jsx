import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { api } from "../../services/api";
import AdminLayout from "./components/AdminLayout";
import { toast } from "react-hot-toast";

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    sku: "",
    code: "",
    unit: "un",
    categoryId: "",
    image: "",
    active: true,
    featured: false,
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      if (response.success) setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.getProduct(id);
      if (response.success) {
        const p = response.data;
        setFormData({
          name: p.name,
          description: p.description || "",
          price: p.price,
          stock: p.stock,
          sku: p.sku || "",
          code: p.code || "",
          unit: p.unit || "un",
          categoryId: p.categoryId || "",
          image: p.image || "",
          active: p.active,
          featured: p.featured,
        });
      }
    } catch (err) {
      setError("Erro ao carregar produto: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate types
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      if (isEdit) {
        await api.updateProduct(id, payload);
        toast.success("Produto atualizado!");
      } else {
        await api.createProduct(payload);
        toast.success("Produto criado!");
      }
      navigate("/admin/products");
    } catch (err) {
      toast.error("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isEdit ? "Editar Produto" : "Novo Produto"}>
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEdit ? "Editar Produto" : "Novo Produto"}
      subtitle={
        isEdit
          ? `Editando: ${formData.name}`
          : "Adicione um novo item ao catálogo"
      }
    >
      <div className="mb-6">
        <Link
          to="/admin/products"
          className="inline-flex items-center text-gray-600 hover:text-primary"
        >
          <ArrowLeft size={16} className="mr-1" /> Voltar para lista
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl bg-white rounded-lg shadow p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Informações Básicas
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código Oficial (Tabela)
              </label>
              <input
                type="text"
                name="code"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.code}
                onChange={handleChange}
                placeholder="Ex: LSH0275"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU (Identificador Único)
              </label>
              <input
                type="text"
                name="sku"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.sku}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                name="categoryId"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                value={formData.categoryId}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                rows="4"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Price & Stock & Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Preço e Estoque
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    name="stock"
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={formData.stock}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="unit"
                    placeholder="Un"
                    className="w-20 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={formData.unit}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL da Imagem
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="image"
                  className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
              {formData.image && (
                <div className="mt-2 w-full h-40 bg-gray-100 rounded-lg overflow-hidden border flex items-center justify-center">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="h-full object-contain"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary rounded focus:ring-primary-500"
                />
                <span className="text-gray-700">
                  Produto Ativo (visível na loja)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary rounded focus:ring-primary-500"
                />
                <span className="text-gray-700">Produto em Destaque</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex justify-end gap-3">
          <Link
            to="/admin/products"
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            Salvar Produto
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminProductForm;
