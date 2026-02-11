import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ChevronLeft,
  Share2,
  Check,
  AlertCircle,
  Package,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
import { getProductImage, PLACEHOLDER_IMAGE } from "../utils/productHelpers";
import { toast } from "react-hot-toast";
import ProductCardWithVariants from "../components/ProductCardWithVariants";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for selections
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);

  // Additional sections state
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.getProduct(id);

        if (response.success && response.data) {
          const prod = response.data;
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

  const loadRelatedProducts = async (currentProduct) => {
    try {
      const categoryId =
        currentProduct.category?.id || currentProduct.categoryId;
      if (!categoryId) return;

      const response = await api.getProducts({
        category: categoryId,
        limit: 5, // Fetch one extra in case current product is included
      });

      if (response.success && response.data) {
        // Filter out current product and limit to 4
        const related = response.data
          .filter((p) => p.id !== currentProduct.id)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (err) {
      console.error("Error loading related products:", err);
    }
  };

  const addToRecentlyViewed = (currentProduct) => {
    try {
      const STORAGE_KEY = "eletrostart_recently_viewed";
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

      // Remove current if exists (to move to top)
      const filtered = stored.filter((item) => item.id !== currentProduct.id);

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

      // Update state (excluding current product from display if preferred,
      // but usually we show history excluding current or including it.
      // Let's exclude current from the "Recently Viewed" list displayed on THIS page)
      setRecentlyViewed(filtered.slice(0, 4));
    } catch (err) {
      console.error("Error updating recently viewed:", err);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product, quantity, selectedVariant);
    toast.success("Produto adicionado ao carrinho!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
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

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;

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
                {product.variants?.length > 0 && (
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
                      onClick={() => setActiveImage(img)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden bg-gray-50 p-2 ${
                        activeImage === img
                          ? "border-primary"
                          : "border-transparent hover:border-gray-200"
                      }`}
                    >
                      <img
                        src={img}
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
              </div>

              {/* Variants Selector */}
              {product.variants?.length > 0 && (
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

              {/* Actions */}
              <div className="mt-auto pt-6 border-t border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-300 rounded-lg h-12 w-full md:w-32">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50"
                      disabled={isOutOfStock}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="flex-1 h-full text-center border-x border-gray-300 w-full focus:outline-none text-gray-900 font-medium"
                      min="1"
                      disabled={isOutOfStock}
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50"
                      disabled={isOutOfStock}
                    >
                      +
                    </button>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 h-12 rounded-lg font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      isOutOfStock
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-blue-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    }`}
                  >
                    <ShoppingCart size={20} />
                    {isOutOfStock ? "Indisponível" : "Adicionar ao Carrinho"}
                  </button>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mt-6">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-primary" />
                    <span>Entrega para todo o Brasil</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-primary" />
                    <span>Garantia de 3 meses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-primary" />
                    <span>Embalagem segura</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span>Nota Fiscal inclusa</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details & Specs Section */}
        <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Description */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Descrição do Produto
            </h2>
            <div className="prose prose-sm md:prose-base text-gray-600 max-w-none whitespace-pre-line">
              {product.description}
            </div>

            {product.features && product.features.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Principais Características
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {product.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-gray-600"
                    >
                      <Check
                        size={16}
                        className="text-primary mt-1 flex-shrink-0"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Especificações Técnicas
            </h2>
            <div className="flex flex-col gap-0 divide-y divide-gray-100">
              {Object.entries(product.specifications || {}).map(
                ([key, value]) => (
                  <div key={key} className="py-3 flex justify-between gap-4">
                    <span className="text-gray-500 font-medium capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-gray-900 text-right font-medium">
                      {value}
                    </span>
                  </div>
                ),
              )}
              {/* Fallback if no specs */}
              {(!product.specifications ||
                Object.keys(product.specifications).length === 0) && (
                <p className="text-gray-400 italic text-sm">
                  Nenhuma especificação disponível.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Produtos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <ProductCardWithVariants key={related.id} product={related} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mt-12 md:mt-16 pb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Vistos Recentemente
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recentlyViewed.map((item) => (
                <Link
                  to={`/product/${item.id}`}
                  key={item.id}
                  className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square relative bg-gray-50 p-4">
                    <img
                      src={item.image || PLACEHOLDER_IMAGE}
                      alt={item.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <span className="font-bold text-gray-900">
                      R$ {item.price?.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
