export const PLACEHOLDER_IMAGE = '/img/placeholder.svg';

/**
 * Handle image error by setting fallback source
 * @param {Event} e - The error event
 * @param {string} fallbackSrc - Optional custom fallback image path
 */
export const handleImageError = (e, fallbackSrc = PLACEHOLDER_IMAGE) => {
  if (e.target.src !== fallbackSrc) {
    e.target.src = fallbackSrc;
  }
};

/**
 * Get standardized image props with lazy loading and error handling
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for accessibility
 * @param {Object} options - Additional options
 * @returns {Object} Image props object
 */
export const getImageProps = (src, alt, options = {}) => {
  return {
    src: src || PLACEHOLDER_IMAGE,
    alt: alt || 'Produto',
    loading: options.loading || 'lazy',
    decoding: options.decoding || 'async',
    onError: (e) => handleImageError(e, options.fallback || PLACEHOLDER_IMAGE)
  };
};

/**
 * Preload critical images
 * @param {string[]} imagePaths - Array of image paths to preload
 */
export const preloadImages = (imagePaths) => {
  if (typeof window === 'undefined') return;
  
  imagePaths.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = path;
    document.head.appendChild(link);
  });
};
