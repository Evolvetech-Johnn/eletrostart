import React, { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { productService, Category } from "../../services/productService";
import AdminLayout from "./components/AdminLayout";
import { toast } from "react-hot-toast";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

// Validation Schema
const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  price: z.number().min(0, "Preço deve ser positivo"),
  stock: z
    .number()
    .int("Estoque deve ser inteiro")
    .min(0, "Estoque deve ser positivo"),
  sku: z.string().optional(),
  code: z.string().optional(),
  unit: z.string().min(1, "Unidade é obrigatória"),
  categoryId: z.string().optional(),
  image: z.string().optional(),
  active: z.boolean(),
  featured: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      sku: "",
      code: "",
      unit: "un",
      categoryId: "",
      image: "",
      active: true,
      featured: false,
    },
  });

  const imageUrl = watch("image");

  // Queries
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: productService.getCategories,
  });

  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getProduct(id!),
    enabled: isEdit,
  });

  // Effect to populate form when product loads
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || "",
        price: product.price,
        stock: product.stock,
        sku: product.sku || "",
        code: product.code || "",
        unit: product.unit || "un",
        categoryId: product.categoryId || "",
        image: product.image || "",
        active: product.active,
        featured: product.featured,
      });
    }
  }, [product, reset]);

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto criado com sucesso!");
      navigate("/admin/products");
    },
    onError: (err: any) => {
      toast.error(
        "Erro ao criar produto: " + (err.message || "Erro desconhecido"),
      );
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      productService.updateProduct(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      toast.success("Produto atualizado com sucesso!");
      navigate("/admin/products");
    },
    onError: (err: any) => {
      toast.error(
        "Erro ao atualizar produto: " + (err.message || "Erro desconhecido"),
      );
    },
  });

  const onSubmit = (data: ProductFormData) => {
    const cleanedData = {
      ...data,
      sku: data.sku === "" ? undefined : data.sku,
      code: data.code === "" ? undefined : data.code,
      categoryId: data.categoryId === "" ? undefined : data.categoryId,
      image: data.image === "" ? undefined : data.image,
    };

    if (isEdit) {
      updateProductMutation.mutate(cleanedData);
    } else {
      createProductMutation.mutate(cleanedData);
    }
  };

  if (isLoadingProduct) {
    return (
      <AdminLayout>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? "Editar Produto" : "Novo Produto"}
            </h1>
          </div>
        </div>
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const isSaving =
    createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Editar Produto" : "Novo Produto"}
          </h1>
          <p className="text-gray-500">
            {isEdit
              ? `Editando: ${product?.name}`
              : "Adicione um novo item ao catálogo"}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <Link
          to="/admin/products"
          className="inline-flex items-center text-gray-600 hover:text-primary"
        >
          <ArrowLeft size={16} className="mr-1" /> Voltar para lista
        </Link>
      </div>

      {productError && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} /> {(productError as Error).message}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-4xl bg-white rounded-lg shadow p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Informações Básicas
            </h3>

            <div>
              <Input
                label="Nome do Produto *"
                {...register("name")}
                error={errors.name?.message}
              />
            </div>

            <div>
              <Input
                label="Código Oficial (Tabela)"
                {...register("code")}
                placeholder="Ex: LSH0275"
              />
            </div>

            <div>
              <Input label="SKU (Identificador Único)" {...register("sku")} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                {...register("categoryId")}
              >
                <option value="">Selecione...</option>
                {categories.map((cat: Category) => (
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
                rows={4}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                {...register("description")}
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
                <Input
                  label="Preço (R$) *"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", { valueAsNumber: true })}
                  error={errors.price?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque *
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      {...register("stock", { valueAsNumber: true })}
                      error={errors.stock?.message}
                    />
                  </div>

                  <div className="w-24">
                    <Input type="text" placeholder="Un" {...register("unit")} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Input
                label="URL da Imagem"
                {...register("image")}
                placeholder="https://..."
                error={errors.image?.message}
              />

              {imageUrl && (
                <div className="mt-2 w-full h-40 bg-gray-100 rounded-lg overflow-hidden border flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = ""; // Clear broken image
                    }}
                  />
                </div>
              )}
            </div>

            <div className="pt-4 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-primary rounded focus:ring-primary-500"
                  {...register("active")}
                />
                <span className="text-gray-700">
                  Produto Ativo (visível na loja)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-primary rounded focus:ring-primary-500"
                  {...register("featured")}
                />
                <span className="text-gray-700">Produto em Destaque</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/products")}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {!isSaving && <Save size={20} className="mr-2" />}
            Salvar Produto
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminProductForm;
