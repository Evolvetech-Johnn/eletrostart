import { useEffect, useState } from "react";
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
import apiClient from "../../services/apiClient";

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
  costPrice: z.number().min(0, "Custo deve ser positivo").optional().nullable(),
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
      costPrice: 0,
      stock: 0,
      sku: "",
      code: "",
      unit: "un",
      categoryId: "",
      active: true,
      featured: false,
    },
  });

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  // Local state for variant editing (avoid auto-save as requested)
  const [editingVariants, setEditingVariants] = useState<Record<string, any>>({});


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
      const res = await apiClient.get<{ data: any[] }>(`/ecommerce/products/${id}/images`);
      return res.data?.data || res.data || [];
    },
    enabled: isEdit && !loading && isAuthenticated,
  });

  const { data: variants = [], refetch: refetchVariants } = useQuery({
    queryKey: ["product-variants", id],
    queryFn: async () => {
      if (!isEdit) return [];
      const res = await apiClient.get<{ data: any[] }>(`/ecommerce/products/${id}/variants`);
      return res.data?.data || res.data || [];
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
        costPrice: product.costPrice || 0,
        stock: product.stock,
        sku: product.sku || "",
        code: product.code || "",
        unit: product.unit || "un",
        categoryId: product.categoryId || "",
        active: product.active,
        featured: product.featured,
      });
    }
  }, [product, reset]);

  const createProductMutation = useMutation({
    mutationFn: (data: any) => productService.createProduct(data),
    onSuccess: async (res: any) => {
      const newProductId = res.data?.id || res.id;
      if (pendingFiles.length > 0 && newProductId) {
        toast.loading("Enviando imagens...", { id: "upload-status" });
        await handleUploadImages(pendingFiles as unknown as FileList, newProductId);
        toast.success("Imagens enviadas!", { id: "upload-status" });
      }
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
    mutationFn: (data: any) =>
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
    const cleanedData: any = {
      ...data,
      sku: data.sku === "" ? undefined : data.sku,
      code: data.code === "" ? undefined : data.code,
      categoryId: data.categoryId === "" ? undefined : data.categoryId,
      image: data.image === "" ? undefined : data.image,
      costPrice: data.costPrice === null ? undefined : data.costPrice,
    };

    if (isEdit) {
      updateProductMutation.mutate(cleanedData);
    } else {
      createProductMutation.mutate(cleanedData);
    }
  };

  const handleUploadImages = async (files: FileList | null | File[], targetId?: string) => {
    const uploadId = targetId || id;
    if (!files || !uploadId) return;

    const formData = new FormData();
    if (files instanceof FileList) {
      Array.from(files).forEach((f) => formData.append("files", f));
    } else {
      files.forEach((f) => formData.append("files", f));
    }

    try {
      const data: any = await apiClient.post(
        `/ecommerce/products/${uploadId}/images/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (data.success !== false) {
        if (!targetId) {
          toast.success("Imagens enviadas");
          refetchImages();
        }
        return true;
      } else {
        toast.error(data.message || "Erro ao enviar imagens");
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar imagens");
      return false;
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);

    if (isEdit) {
      handleUploadImages(files);
    } else {
      setPendingFiles((prev: File[]) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(f => URL.createObjectURL(f));
      setPreviews((prev: string[]) => [...prev, ...newPreviews]);
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev: File[]) => prev.filter((_, i) => i !== index));
    setPreviews((prev: string[]) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const setPrimaryImage = async (imageId: string) => {
    if (!isEdit) return;
    const image = images.find((i: any) => i.id === imageId);
    if (!image) return;
    try {
      await apiClient.put(
        `/ecommerce/products/${id}/images/${imageId}`,
        { isPrimary: true }
      );
      toast.success("Imagem principal definida");
      refetchImages();
    } catch (err: any) {
      toast.error(err.message || "Erro ao definir imagem principal");
    }
  };

  const reorderImage = async (imageId: string, newOrder: number) => {
    try {
      await apiClient.put(`/ecommerce/products/${id}/images/${imageId}`, {
        order: Math.max(0, newOrder),
      });
      refetchImages();
    } catch (err: any) {
      toast.error(err.message || "Erro ao reordenar imagem");
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      await apiClient.delete(`/ecommerce/products/${id}/images/${imageId}`);
      toast.success("Imagem removida");
      refetchImages();
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover imagem");
    }
  };

  const addVariant = async () => {
    try {
      await apiClient.post(`/ecommerce/products/${id}/variants`, {
        name: "Variante",
        price: product?.price || 0,
        stock: 0,
        sku: "",
      });
      refetchVariants();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar variante");
    }
  };

  const updateVariant = async (variantId: string, patch: any) => {
    try {
      await apiClient.put(
        `/ecommerce/products/${id}/variants/${variantId}`,
        patch
      );
      refetchVariants();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar variante");
    }
  };

  const handleVariantLocalChange = (variantId: string, field: string, value: any) => {
    setEditingVariants(prev => ({
      ...prev,
      [variantId]: {
        ...(prev[variantId] || (variants as any[]).find(v => v.id === variantId) || {}),
        [field]: value
      }
    }));
  };

  const saveVariant = async (variantId: string) => {
    const patch = editingVariants[variantId];
    if (!patch) return;

    const current = (variants as any[]).find((v) => v.id === variantId);
    const candidate = {
      name: patch.name ?? current.name,
      price: typeof patch.price === "number" ? patch.price : Number(current.price),
      stock: typeof patch.stock === "number" ? patch.stock : Number(current.stock),
      sku: patch.sku ?? current.sku ?? "",
    };

    const parsed = variantSchema.safeParse(candidate);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Dados inválidos";
      toast.error(message);
      return;
    }

    try {
      await updateVariant(variantId, candidate);
      // Clear local editing state on success
      setEditingVariants(prev => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });
      toast.success("Variante salva com sucesso!");
    } catch (err) {
      // Error handled by updateVariant toast
    }
  };

  const deleteVariant = async (variantId: string) => {
    try {
      await apiClient.delete(`/ecommerce/products/${id}/variants/${variantId}`);
      refetchVariants();
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover variante");
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
        className="max-w-5xl space-y-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Código Oficial"
                  {...register("code")}
                  placeholder="Ex: LSH0275"
                />
                <Input label="SKU" {...register("sku")} />
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

            {/* Imagens (Moved Up) */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <ImageIcon size={20} /> Imagens do Produto
              </h3>

              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all border-gray-300 hover:border-primary hover:bg-primary/5 focus-within:ring-2 focus-within:ring-primary-500 outline-none"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelect(e.dataTransfer.files);
                }}
                onClick={() => document.getElementById("file-input")?.click()}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && document.getElementById("file-input")?.click()}
              >
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-gray-50 rounded-full mb-3 group-hover:bg-primary/10 transition-colors">
                    <ImageIcon size={48} className="text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    {isEdit ? "Adicionar fotos à galeria" : "Enviar fotos do produto"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                    Arraste imagens aqui ou clique para selecionar. Você pode enviar várias fotos de uma vez.
                  </p>
                </div>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>

              {/* Pending Upload Previews */}
              {previews.length > 0 && !isEdit && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    Fotos pendentes (serão salvas com o produto)
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {previews.map((preview: string, idx: number) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-amber-100 bg-gray-50 shadow-sm">
                        <img src={preview} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removePendingFile(idx); }}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={20} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Gallery Images */}
              {isEdit && images.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Galeria Atual (Arraste para reordenar)</p>
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={async (event) => {
                      const { active, over } = event;
                      if (!over || active.id === over.id) return;
                      const currentIndex = images.findIndex((img: any) => img.id === active.id);
                      const newIndex = images.findIndex((img: any) => img.id === over.id);
                      if (currentIndex === -1 || newIndex === -1) return;
                      const ordered = arrayMove(images, currentIndex, newIndex);
                      for (let index = 0; index < ordered.length; index++) {
                        const img = ordered[index] as any;
                        await reorderImage(img.id, index);
                      }
                      refetchImages();
                    }}
                  >
                    <SortableContext items={images.map((img: any) => img.id)} strategy={verticalListSortingStrategy}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {images.map((img: any) => {
                          const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: img.id });
                          const style = { transform: CSS.Transform.toString(transform), transition };
                          return (
                            <div key={img.id} ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group aspect-square rounded-lg overflow-hidden border bg-gray-50 shadow-sm cursor-grab active:cursor-grabbing">
                              <img src={img.url} className="w-full h-full object-cover" alt="" />
                              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setPrimaryImage(img.id);
                                  }}
                                  className={`p-1.5 rounded-full shadow-lg transition-colors ${img.isPrimary ? 'bg-yellow-400 text-white' : 'bg-white text-gray-400 hover:text-yellow-500'}`}
                                  title="Marcar como Principal"
                                >
                                  <Star size={14} fill={img.isPrimary ? "currentColor" : "none"} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    deleteImage(img.id);
                                  }}
                                  className="p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
                                  title="Excluir Imagem"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                {img.isPrimary && <Star size={10} fill="currentColor" className="text-yellow-400" />}
                                Ordem: {img.order}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>
          </div>

          {/* Price and Visibility Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2">Preço e Estoque</h3>

              <div className="space-y-4">
                <Input
                  label="Preço de Venda (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", { valueAsNumber: true })}
                  error={errors.price?.message}
                  className="text-lg font-bold text-primary"
                />

                <Input
                  label="Preço de Custo (Opcional)"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("costPrice", { valueAsNumber: true })}
                  error={errors.costPrice?.message}
                />

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Input
                      label="Estoque Inicial"
                      type="number"
                      min="0"
                      {...register("stock", { valueAsNumber: true })}
                      error={errors.stock?.message}
                    />
                  </div>
                  <div>
                    <Input label="Unid." placeholder="ex: un" {...register("unit")} />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <p className="text-sm font-semibold text-gray-900">Configurações</p>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Produto Ativo</span>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${watch("active") ? "bg-green-500" : "bg-gray-200"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${watch("active") ? "translate-x-6" : "translate-x-0"}`} />
                    </div>
                    <input type="checkbox" className="hidden" {...register("active")} />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Destaque na Home</span>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${watch("featured") ? "bg-amber-500" : "bg-gray-200"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${watch("featured") ? "translate-x-6" : "translate-x-0"}`} />
                    </div>
                    <input type="checkbox" className="hidden" {...register("featured")} />
                  </label>
                </div>
              </div>

              <div className="pt-6">
                <Button type="submit" size="lg" className="w-full py-6 text-lg" isLoading={isSaving}>
                  {!isSaving && <Save size={20} className="mr-2" />}
                  {isEdit ? "Atualizar Produto" : "Criar Produto"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full mt-2 text-gray-500"
                  onClick={() => navigate("/admin/products")}
                  disabled={isSaving}
                >
                  Cancelar e Sair
                </Button>
              </div>
            </div>

            {/* Variants Link or Warning if not saving yet */}
            {isEdit && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                  💡 Dica do Sistema
                </h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Você pode configurar variações (como cores, tamanhos ou materiais) e cada uma pode ter seu próprio estoque e preço individual na aba de variantes abaixo.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Variants Section Moved to Bottom Separate Area */}
        {isEdit && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Variantes do Produto</h3>
                <p className="text-sm text-gray-500">Gerencie diferentes versões deste mesmo item</p>
              </div>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  addVariant();
                }}
                variant="outline"
                size="sm"
              >
                <Plus size={16} className="mr-2" /> Nova Variante
              </Button>
            </div>


            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <Plus size={20} /> Variantes
              </h3>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    addVariant();
                  }}
                >
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
                    {variants.map((v: any) => {
                      const editState = editingVariants[v.id];
                      const name = editState?.name ?? v.name;
                      const price = editState?.price ?? v.price;
                      const stock = editState?.stock ?? v.stock;
                      const sku = editState?.sku ?? v.sku ?? "";
                      const hasChanges = !!editState;

                      return (
                        <tr key={v.id} className="border-t">
                          <td className="px-3 py-2">
                            <Input
                              value={name}
                              onChange={(e) => handleVariantLocalChange(v.id, "name", e.target.value)}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={price}
                              onChange={(e) => handleVariantLocalChange(v.id, "price", Number(e.target.value || 0))}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min="0"
                              value={stock}
                              onChange={(e) => handleVariantLocalChange(v.id, "stock", Number(e.target.value || 0))}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              value={sku}
                              onChange={(e) => handleVariantLocalChange(v.id, "sku", e.target.value)}
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex justify-end gap-2">
                              {hasChanges && (
                                <Button
                                  type="button"
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    saveVariant(v.id);
                                  }}
                                >
                                  <Save size={14} />
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  deleteVariant(v.id);
                                }}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
