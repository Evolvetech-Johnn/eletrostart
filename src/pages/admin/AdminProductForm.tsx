import { useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  Loader2,
} from "lucide-react";
import {
  productService,
  Category,
  StockMovement,
} from "../../services/productService";
import AdminLayout from "./components/AdminLayout";
import { toast } from "react-hot-toast";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

const variantSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.number().min(0, "Preço deve ser positivo"),
  stock: z
    .number()
    .int("Estoque deve ser inteiro")
    .min(0, "Estoque deve ser positivo"),
  sku: z.string().min(1, "SKU é obrigatório"),
});

const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const variantUpdateTimers = useRef<Record<string, number | undefined>>({});

  const { loading, isAuthenticated } = useAuth();

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

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: productService.getCategories,
    enabled: !loading && isAuthenticated,
  });

  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getProduct(id!),
    enabled: isEdit && !loading && isAuthenticated,
  });

  // Product images and variants (only in edit mode)
  const { data: images = [], refetch: refetchImages } = useQuery({
    queryKey: ["product-images", id],
    queryFn: async () => {
      if (!isEdit) return [];
      const res = await fetch(`/api/ecommerce/products/${id}/images`, {
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      return json.data || [];
    },
    enabled: isEdit && !loading && isAuthenticated,
  });

  const { data: variants = [], refetch: refetchVariants } = useQuery({
    queryKey: ["product-variants", id],
    queryFn: async () => {
      if (!isEdit) return [];
      const res = await fetch(`/api/ecommerce/products/${id}/variants`, {
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      return json.data || [];
    },
    enabled: isEdit && !loading && isAuthenticated,
  });

  const {
    data: stockMovements = { data: [], pagination: { total: 0 } },
    isLoading: isLoadingMovements,
    error: movementsError,
  } = useQuery({
    queryKey: ["product-stock-movements", id],
    queryFn: () => productService.getProductStockMovements(id!, { limit: 5 }),
    enabled: isEdit && !loading && isAuthenticated,
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

  const handleUploadImages = async (files: FileList | null) => {
    if (!files || !isEdit) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));
    const res = await fetch(`/api/ecommerce/products/${id}/images/upload`, {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Imagens enviadas");
      refetchImages();
    } else {
      toast.error(json.message || "Erro ao enviar imagens");
    }
  };

  const setPrimaryImage = async (imageId: string) => {
    if (!isEdit) return;
    const image = images.find((i: any) => i.id === imageId);
    if (!image) return;
    const res = await fetch(`/api/ecommerce/products/${id}/images/${imageId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPrimary: true }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Imagem principal definida");
      refetchImages();
    } else {
      toast.error(json.message || "Erro ao definir imagem principal");
    }
  };

  const reorderImage = async (imageId: string, newOrder: number) => {
    const res = await fetch(`/api/ecommerce/products/${id}/images/${imageId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: Math.max(0, newOrder) }),
    });
    const json = await res.json();
    if (json.success) {
      refetchImages();
    } else {
      toast.error(json.message || "Erro ao reordenar imagem");
    }
  };

  const deleteImage = async (imageId: string) => {
    const res = await fetch(`/api/ecommerce/products/${id}/images/${imageId}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Imagem removida");
      refetchImages();
    } else {
      toast.error(json.message || "Erro ao remover imagem");
    }
  };

  const addVariant = async () => {
    const res = await fetch(`/api/ecommerce/products/${id}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Variante",
        price: product?.price || 0,
        stock: 0,
        sku: "",
      }),
    });
    const json = await res.json();
    if (json.success) {
      refetchVariants();
    } else {
      toast.error(json.message || "Erro ao criar variante");
    }
  };

  const updateVariant = async (variantId: string, patch: any) => {
    const res = await fetch(
      `/api/ecommerce/products/${id}/variants/${variantId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      },
    );
    const json = await res.json();
    if (json.success) {
      refetchVariants();
    } else {
      toast.error(json.message || "Erro ao atualizar variante");
    }
  };

  const queueVariantUpdate = (variantId: string, patch: any) => {
    const current = (variants as any[]).find((v) => v.id === variantId);
    if (!current) return;

    const candidate = {
      name: patch.name ?? current.name,
      price:
        typeof patch.price === "number" ? patch.price : Number(current.price),
      stock:
        typeof patch.stock === "number" ? patch.stock : Number(current.stock),
      sku: patch.sku ?? current.sku ?? "",
    };

    const parsed = variantSchema.safeParse(candidate);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Dados inválidos";
      toast.error(message);
      return;
    }

    const existing = variantUpdateTimers.current[variantId];
    if (existing) {
      window.clearTimeout(existing);
    }

    const timer = window.setTimeout(() => {
      updateVariant(variantId, patch);
      variantUpdateTimers.current[variantId] = undefined;
    }, 500);

    variantUpdateTimers.current[variantId] = timer;
  };

  const deleteVariant = async (variantId: string) => {
    const res = await fetch(
      `/api/ecommerce/products/${id}/variants/${variantId}`,
      { method: "DELETE" },
    );
    const json = await res.json();
    if (json.success) {
      refetchVariants();
    } else {
      toast.error(json.message || "Erro ao remover variante");
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

        {isEdit && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <ImageIcon size={20} /> Imagens do Produto
              </h3>

              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = e.dataTransfer.files;
                  handleUploadImages(files);
                }}
              >
                <p className="text-sm text-gray-600">
                  Arraste e solte imagens aqui ou selecione arquivos
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="mt-3"
                  onChange={(e) => handleUploadImages(e.target.files)}
                />
              </div>

              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={async (event) => {
                  const { active, over } = event;
                  if (!over || active.id === over.id) return;
                  const currentIndex = images.findIndex(
                    (img: any) => img.id === active.id,
                  );
                  const newIndex = images.findIndex(
                    (img: any) => img.id === over.id,
                  );
                  if (currentIndex === -1 || newIndex === -1) return;
                  const ordered = arrayMove(images, currentIndex, newIndex);
                  for (let index = 0; index < ordered.length; index++) {
                    const img = ordered[index] as any;
                    await reorderImage(img.id, index);
                  }
                  refetchImages();
                }}
              >
                <SortableContext
                  items={images.map((img: any) => img.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((img: any) => {
                      const {
                        attributes,
                        listeners,
                        setNodeRef,
                        transform,
                        transition,
                      } = useSortable({ id: img.id });
                      const style = {
                        transform: CSS.Transform.toString(transform),
                        transition,
                      };

                      return (
                        <div
                          key={img.id}
                          ref={setNodeRef}
                          style={style}
                          {...attributes}
                          {...listeners}
                          className="border rounded-lg overflow-hidden bg-white cursor-move"
                        >
                          <img
                            src={img.url}
                            alt=""
                            className="w-full h-28 object-cover"
                          />
                          <div className="p-2 flex items-center justify-between gap-2">
                            <button
                              className={`text-xs px-2 py-1 rounded ${
                                img.isPrimary
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                              onClick={() => setPrimaryImage(img.id)}
                              title="Definir como principal"
                            >
                              <Star size={14} />
                            </button>
                            <button
                              className="text-xs px-2 py-1 rounded bg-red-100 text-red-700"
                              onClick={() => deleteImage(img.id)}
                              title="Excluir imagem"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <Plus size={20} /> Variantes
              </h3>
              <div className="flex justify-end">
                <Button onClick={addVariant}>
                  <Plus size={16} className="mr-2" /> Adicionar variante
                </Button>
              </div>
              <div className="bg-white rounded-lg border">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-3 py-2">Nome</th>
                      <th className="text-left px-3 py-2">Preço</th>
                      <th className="text-left px-3 py-2">Estoque</th>
                      <th className="text-left px-3 py-2">SKU</th>
                      <th className="text-right px-3 py-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v: any) => (
                      <tr key={v.id} className="border-t">
                        <td className="px-3 py-2">
                          <Input
                            value={v.name}
                            onChange={(e) =>
                              queueVariantUpdate(v.id, { name: e.target.value })
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={v.price}
                            onChange={(e) =>
                              queueVariantUpdate(v.id, {
                                price: Number(e.target.value || 0),
                              })
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={(e) =>
                              queueVariantUpdate(v.id, {
                                stock: Number(e.target.value || 0),
                              })
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            value={v.sku || ""}
                            onChange={(e) =>
                              queueVariantUpdate(v.id, { sku: e.target.value })
                            }
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            variant="outline"
                            onClick={() => deleteVariant(v.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {variants.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 py-4 text-center text-gray-500"
                        >
                          Nenhuma variante cadastrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                Movimentações recentes de estoque
              </h3>
              {isLoadingMovements ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Carregando movimentações...</span>
                </div>
              ) : movementsError ? (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Erro ao carregar movimentações</span>
                </div>
              ) : (
                <div className="bg-white rounded-lg border">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-3 py-2">Data</th>
                        <th className="text-left px-3 py-2">Tipo</th>
                        <th className="text-left px-3 py-2">Delta</th>
                        <th className="text-left px-3 py-2">Antes → Depois</th>
                        <th className="text-left px-3 py-2">Por</th>
                        <th className="text-left px-3 py-2">Motivo</th>
                        <th className="text-left px-3 py-2">Pedido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stockMovements.data as StockMovement[]).map((m) => {
                        const date = new Date(m.createdAt).toLocaleString();
                        const user =
                          m.createdBy?.name ||
                          m.createdBy?.email ||
                          (m.createdBy ? m.createdBy.id : "-");
                        return (
                          <tr key={m.id} className="border-t">
                            <td className="px-3 py-2">{date}</td>
                            <td className="px-3 py-2">{m.type}</td>
                            <td className="px-3 py-2">
                              {m.quantity > 0 ? "+" : ""}
                              {m.quantity}
                            </td>
                            <td className="px-3 py-2">
                              {m.previousStock} → {m.newStock}
                            </td>
                            <td className="px-3 py-2">{user || "-"}</td>
                            <td className="px-3 py-2">{m.reason || "-"}</td>
                            <td className="px-3 py-2">
                              {m.order?.id ? (
                                <Link
                                  to={`/admin/orders/${m.order.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {m.order.id}
                                </Link>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {(stockMovements.data as StockMovement[]).length ===
                        0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-3 py-4 text-center text-gray-500"
                          >
                            Nenhuma movimentação recente
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </AdminLayout>
  );
};

export default AdminProductForm;
