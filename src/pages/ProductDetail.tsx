import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, AlertCircle, Plus, Minus, ShoppingCart, Zap } from "lucide-react";
import { useCart } from "../context/CartContext";
import {
  productService,
  Product,
  ProductVariant,
} from "../services/productService";
import { getProductImage, PLACEHOLDER_IMAGE } from "../utils/productHelpers";
import { toast } from "react-hot-toast";
import ProductCardWithVariants from "../components/ProductCardWithVariants";
import ProductDetailSkeleton from "../components/ProductDetailSkeleton";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for selections
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Additional sections state
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const prod = await productService.getProduct(id);

        if (prod) {
          setProduct(prod);

          // Set initial variant if exists
          if (prod.variants && prod.variants.length > 0) {
            const defaultVar =
              prod.variants.find((v) => v.id === prod.defaultVariant) ||
              prod.variants[0];
            setSelectedVariant(defaultVar);
          }

          // Set initial image
          setActiveImage(getProductImage(prod));

          // Load related products
          loadRelatedProducts(prod);

          // Handle recently viewed
          addToRecentlyViewed(prod);
        } else {
          setError("Produto não encontrado");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Erro ao carregar o produto");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Update active image when variant changes
  useEffect(() => {
    if (selectedVariant && selectedVariant.image) {
      setActiveImage(selectedVariant.image);
    } else if (product) {
      setActiveImage(getProductImage(product));
    }
  }, [selectedVariant, product]);

  const loadRelatedProducts = async (currentProduct: Product) => {
    try {
      const categoryId =
        currentProduct.category?.id || currentProduct.categoryId;
      if (!categoryId) return;

      const products = await productService.getProducts({
        category: categoryId,
        limit: 5, // Fetch one extra in case current product is included
      });

      if (products) {
        // Filter out current product and limit to 4
        const filtered = products
          .filter((p) => p.id !== currentProduct.id)
          .slice(0, 4);
        setRelatedProducts(filtered);
      }
    } catch (err) {
      console.error("Error fetching related products:", err);
    }
  };

  const addToRecentlyViewed = (currentProduct: Product) => {
    try {
      const STORAGE_KEY = "eletrostart_recently_viewed";
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

      // Remove current if exists (to move to top)
      const filtered = stored.filter(
        (item: any) => item.id !== currentProduct.id,
      );

      // Add current to beginning
      const newItem = {
        id: currentProduct.id,
        name: currentProduct.name,
        image: getProductImage(currentProduct),
        price: currentProduct.price,
        slug: currentProduct.slug, // Optional if needed
      };

      const newHistory = [newItem, ...filtered].slice(0, 5); // Keep last 5

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));

      // Update state
      setRecentlyViewed(filtered.slice(0, 4));
    } catch (err) {
      console.error("Error updating recently viewed:", err);
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {error || "Produto não encontrado"}
        </h1>
        <Link
          to="/products"
          className="text-primary hover:underline flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          Voltar para produtos
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentStock = selectedVariant?.stock ?? product.stock;
  const isOutOfStock = (currentStock || 0) <= 0;

  // Collect all unique images
  const allImages = [
    getProductImage(product),
    ...(product.images || []),
    ...(product.variants?.map((v) => v.image).filter(Boolean) || []),
  ].filter(
    (img, index, self) =>
      self.indexOf(img) === index && img !== PLACEHOLDER_IMAGE,
  );

  if (allImages.length === 0) allImages.push(PLACEHOLDER_IMAGE);

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb / Back */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">
            Produtos
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
            {/* Left: Gallery */}
            <div className="p-6 md:p-8 bg-white flex flex-col gap-4">
              <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group">
                <img
                  src={activeImage || PLACEHOLDER_IMAGE}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
                {product.variants && product.variants.length > 0 && (
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    {product.variants.length} Opções
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img as string)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden bg-gray-50 p-2 ${
                        activeImage === img
                          ? "border-primary"
                          : "border-transparent hover:border-gray-200"
                      }`}
                    >
                      <img
                        src={img as string}
                        alt={`View ${idx}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="p-6 md:p-8 flex flex-col border-t md:border-t-0 md:border-l border-gray-100">
              <div className="mb-1">
                <span className="text-xs font-black text-primary uppercase tracking-widest">
                  {product.subcategory || product.category?.name || "Produto"}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                {product.name}
              </h1>

              {product.code && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-mono px-2 py-1 rounded">
                    COD: {product.code}
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    R$ {currentPrice.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">
                    / {product.unit || "unidade"}
                  </span>
                </div>
                <p className="text-sm text-green-600 font-medium mt-1">
                  Em até 12x no cartão ou 5% de desconto no Pix
                </p>
                {!isOutOfStock && currentStock <= 5 && (
                  <p className="text-sm text-amber-600 font-semibold mt-2 flex items-center gap-1">
                    ⚠️ Apenas {currentStock} {currentStock === 1 ? "unidade disponível" : "unidades disponíveis"}
                  </p>
                )}
              </div>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escolha a opção:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          selectedVariant?.id === variant.id
                            ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              {!isOutOfStock && (
                <div className="flex items-center gap-3 mt-6">
                  <span className="text-sm font-semibold text-gray-600">Quantidade:</span>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-bold text-gray-900">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(currentStock || 99, q + 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {currentStock > 0 && (
                    <span className="text-xs text-gray-400">{currentStock} em estoque</span>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={() => {
                    addToCart(product, qty, selectedVariant || undefined);
                    toast.success(`${qty}x ${product.name} adicionado ao carrinho!`);
                  }}
                  disabled={isOutOfStock}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest shadow-lg ${
                    isOutOfStock
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary hover:bg-blue-800 text-white hover:shadow-xl hover:scale-[1.02]"
                  }`}
                >
                  <ShoppingCart size={20} />
                  <span>{isOutOfStock ? "Indisponível" : "Adicionar ao Carrinho"}</span>
                </button>
                {!isOutOfStock && (
                  <button
                    onClick={() => {
                      addToCart(product, qty, selectedVariant || undefined);
                      navigate("/checkout");
                    }}
                    className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest bg-secondary hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
                  >
                    <Zap size={20} />
                    <span>Comprar Agora</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Produtos Relacionados
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCardWithVariants key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Vistos Recentemente
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentlyViewed.map((p) => (
                <ProductCardWithVariants key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
