import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Eye, X } from "lucide-react";
import { PLACEHOLDER_IMAGE } from "../utils/productHelpers";
import { Product, ProductVariant } from "../services/productService";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, variant?: ProductVariant) => void;
}

const ProductCardWithVariants: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.find((v) => v.id === product.defaultVariant) ||
      product.variants?.[0] ||
      null,
  );
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const variants = product.variants || [];
  const hasVariants = variants.length > 1;

  const getCurrentImage = () => {
    if (imageError) return PLACEHOLDER_IMAGE;
    if (selectedVariant?.image) return selectedVariant.image;
    if (product.images?.[0]) return product.images[0];
    if (product.image) return product.image;
    return PLACEHOLDER_IMAGE;
  };

  const handleVariantChange = (variantId: string) => {
    const variant = variants.find((v) => v.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
      setImageError(false);
    }
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col h-full">
        {/* Image Area */}
        <div className="relative overflow-hidden bg-white aspect-[4/3] border border-gray-100">
          <Link to={`/product/${product.id}`} className="block w-full h-full">
            <img
              src={getCurrentImage()}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 p-4"
              onError={() => setImageError(true)}
            />
          </Link>

          {/* Quick View Button */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
            <button
              onClick={() => setIsModalOpen(true)}
              aria-label="Ver detalhes do produto"
              className="bg-white/90 backdrop-blur-sm p-3 rounded-full text-gray-600 hover:text-primary transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 pointer-events-auto"
            >
              <Eye size={20} />
            </button>
          </div>

          {/* Variant Badge */}
          {hasVariants && (
            <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">
              {variants.length} opções
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Category */}
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em] mb-2">
            {product.subcategory || product.category?.name || "Geral"}
          </span>

          {/* Name */}
          <Link
            to={`/product/${product.id}`}
            className="block mb-2 group-hover:text-primary transition-colors"
          >
            <h3 className="font-bold text-gray-800 text-base line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Code Display - ONLY if code exists */}
          {product.code && (
            <div className="mb-2">
              <span className="inline-block bg-gray-50 text-gray-500 text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-gray-100">
                COD: {product.code}
              </span>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Variant Selector */}
          {hasVariants && (
            <div className="mb-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                Temperatura de Cor
              </label>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      selectedVariant?.id === variant.id
                        ? "bg-primary text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {variant.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price & Button */}
          <div className="mt-auto">
            <div className="flex items-baseline space-x-2 mb-4">
              <span className="text-2xl font-black text-gray-900">
                {product.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">
                /{product.unit || "un"}
              </span>
            </div>

            <button
              onClick={() =>
                onAddToCart && onAddToCart(product, selectedVariant || undefined)
              }
              className="w-full bg-primary hover:bg-blue-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-xs shadow-md active:scale-95"
            >
              <ShoppingCart size={16} />
              <span>Adicionar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-3xl overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              aria-label="Fechar"
              className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <X size={24} />
            </button>

            {/* Image */}
            <div className="p-4 bg-gray-50 flex items-center justify-center">
              <img
                src={getCurrentImage()}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-auto max-h-[70vh] object-contain"
                onError={() => setImageError(true)}
              />
            </div>

            {/* Product Info */}
            <div className="p-6 bg-white border-t border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCardWithVariants;
