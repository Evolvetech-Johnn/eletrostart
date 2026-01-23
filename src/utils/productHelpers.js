export const PLACEHOLDER_IMAGE = "https://placehold.co/400x400/e2e8f0/1e293b?text=Sem+Imagem";

export const getProductImage = (product) => {
  if (!product) return PLACEHOLDER_IMAGE;
  const mainImage = product.images?.[0] || product.image;
  if (!mainImage) return PLACEHOLDER_IMAGE;
  return mainImage;
};
