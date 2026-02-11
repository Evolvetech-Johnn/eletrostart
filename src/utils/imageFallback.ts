import { PLACEHOLDER_IMAGE } from "./productHelpers";

/**
 * Handle image error by setting fallback source
 * @param e - The error event
 * @param fallbackSrc - Optional custom fallback image path
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string = PLACEHOLDER_IMAGE,
) => {
  if (e.currentTarget.src !== fallbackSrc) {
    e.currentTarget.src = fallbackSrc;
  }
};

interface ImageProps {
  src: string;
  alt: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
  onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

interface ImageOptions {
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
  fallback?: string;
}

/**
 * Get standardized image props with lazy loading and error handling
 * @param src - Image source URL
 * @param alt - Alt text for accessibility
 * @param options - Additional options
 * @returns Image props object
 */
export const getImageProps = (
  src: string | null | undefined,
  alt: string,
  options: ImageOptions = {},
): ImageProps => {
  return {
    src: src || PLACEHOLDER_IMAGE,
    alt: alt || "Produto",
    loading: options.loading || "lazy",
    decoding: options.decoding || "async",
    onError: (e) => handleImageError(e, options.fallback || PLACEHOLDER_IMAGE),
  };
};

/**
 * Preload critical images
 * @param imagePaths - Array of image paths to preload
 */
export const preloadImages = (imagePaths: string[]) => {
  if (typeof window === "undefined") return;

  imagePaths.forEach((path) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = path;
    document.head.appendChild(link);
  });
};
