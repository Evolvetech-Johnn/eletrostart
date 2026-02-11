import { Product } from "../services/productService";

export const PLACEHOLDER_IMAGE = "/img/placeholder.svg";

export const getProductImage = (
  product: Product | undefined | null,
): string => {
  if (!product) return PLACEHOLDER_IMAGE;
  const mainImage = product.images?.[0] || product.image;
  if (!mainImage) return PLACEHOLDER_IMAGE;
  return mainImage;
};
