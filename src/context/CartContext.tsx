/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "../services/productService";

export interface CartVariant {
  id: string;
  name: string;
  value?: string;
  image?: string;
}

export interface CartItem {
  id: string;
  name: string;
  code?: string;
  sku?: string;
  price: number;
  image?: string | null;
  unit?: string;
  quantity: number;
  variant?: CartVariant | null;
}

interface CartContextType {
  cart: CartItem[];
  cartTotal: number;
  cartItemCount: number;
  isCartOpen: boolean;
  showClearConfirmation: boolean;
  pendingProduct: Product | null;
  addToCart: (product: Product, quantity?: number, variant?: CartVariant | null) => void;
  removeFromCart: (productId: string, variant?: CartVariant | null) => void;
  updateQuantity: (productId: string, quantity: number, variant?: CartVariant | null) => void;
  incrementQuantity: (productId: string, variant?: CartVariant | null) => void;
  decrementQuantity: (productId: string, variant?: CartVariant | null) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsCartOpen: (isOpen: boolean) => void;
  continueWithExistingCart: () => void;
  clearPreviousSession: () => void;
  cancelPendingAdd: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Verifica se é uma nova sessão (navegador foi fechado e reaberto)
  const [isNewSession, setIsNewSession] = useState(() => {
    const sessionActive = sessionStorage.getItem("eletrostart-session-active");
    return !sessionActive;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    // Recupera o carrinho do localStorage ao inicializar
    try {
      const savedCart = localStorage.getItem("eletrostart-cart");
      if (!savedCart) return [];
      
      const parsedCart = JSON.parse(savedCart);
      
      // Validação de segurança: garante que é um array e filtra itens inválidos
      if (!Array.isArray(parsedCart)) return [];
      
      return parsedCart.filter((item: any) => 
        item && 
        item.id && 
        typeof item.price === 'number' && 
        !isNaN(item.price)
      );
    } catch (error) {
      console.error("Erro ao recuperar carrinho:", error);
      // Se der erro no parse, limpa o carrinho para evitar crash
      localStorage.removeItem("eletrostart-cart");
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [hasShownSessionPrompt, setHasShownSessionPrompt] = useState(false);

  // Marca a sessão como ativa
  useEffect(() => {
    sessionStorage.setItem("eletrostart-session-active", "true");
  }, []);

  // Mostra o prompt de nova sessão se tiver produtos de uma sessão anterior
  useEffect(() => {
    if (isNewSession && cart.length > 0 && !hasShownSessionPrompt) {
      setShowClearConfirmation(true);
      setHasShownSessionPrompt(true);
      setIsNewSession(false);
    }
  }, [isNewSession, cart.length, hasShownSessionPrompt]);

  // Salva o carrinho no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem("eletrostart-cart", JSON.stringify(cart));
  }, [cart]);

  // Calcula o total do carrinho
  const cartTotal = cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Conta o número total de itens
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Helper para obter a imagem do produto (considerando variante)
  const getProductImageUrl = (product: Product, variant: CartVariant | null = null): string | null => {
    // Primeiro tenta a imagem da variante selecionada
    if (variant && variant.image) {
      return variant.image;
    }

    // Tenta a imagem da variante padrão
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      // Assuming variants is an array of objects with id and image
      const variants = product.variants as any[];
      // We don't have defaultVariant in Product interface strictly typed as string, but assuming it exists
      // If defaultVariant is not on Product, we might need to extend it or check runtime
      // Looking at productService, Product doesn't have defaultVariant explicitly defined in interface but it was used in JS
      // I'll add 'any' cast or extend if needed. Let's cast for now as product might have extra fields from backend
      const p = product as any;
      const defaultVariant =
        variants.find((v: any) => v.id === p.defaultVariant) ||
        variants[0];
      if (defaultVariant && defaultVariant.image) {
        return defaultVariant.image;
      }
    }

    // Tenta o array de imagens do produto
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }

    // Tenta a propriedade image simples
    if (product.image) {
      return product.image;
    }

    if (product.category && product.id) {
      if (typeof product.category === "string") {
        return `/img/${product.category}/${product.id}-main.jpg`;
      } else if ((product.category as any).slug) {
        return `/img/${(product.category as any).slug}/${product.id}-main.jpg`;
      }
    }

    return null;
  };

  // Adiciona um produto ao carrinho - sempre adiciona diretamente
  const addToCart = (product: Product, quantity = 1, variant: CartVariant | null = null) => {
    // Pega a imagem correta considerando a variante
    const imageUrl = getProductImageUrl(product, variant);

    // Prepara informações da variante para salvar
    const variantInfo = variant
      ? {
          id: variant.id,
          name: variant.name,
          value: variant.name, // Para retrocompatibilidade
          image: variant.image,
        }
      : null;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.id === product.id &&
          JSON.stringify(item.variant?.id) === JSON.stringify(variantInfo?.id)
      );

      if (existingItemIndex > -1) {
        // Atualiza a quantidade se o item já existe
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      }

      // Adiciona novo item
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          code: product.code,
          sku: product.sku,
          price: product.price,
          image: imageUrl,
          unit: product.unit,
          quantity,
          variant: variantInfo,
        },
      ];
    });

    setIsCartOpen(true);
  };

  // Continua com o carrinho da sessão anterior (fecha o modal)
  const continueWithExistingCart = () => {
    setShowClearConfirmation(false);
    setPendingProduct(null);
  };

  // Limpa o carrinho da sessão anterior
  const clearPreviousSession = () => {
    setCart([]);
    setShowClearConfirmation(false);
    setPendingProduct(null);
  };

  // Cancela a adição pendente / fecha o modal
  const cancelPendingAdd = () => {
    setPendingProduct(null);
    setShowClearConfirmation(false);
  };

  // Remove um produto do carrinho
  const removeFromCart = (productId: string, variant: CartVariant | null = null) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(
            item.id === productId &&
            JSON.stringify(item.variant) === JSON.stringify(variant)
          )
      )
    );
  };

  // Atualiza a quantidade de um produto
  const updateQuantity = (productId: string, quantity: number, variant: CartVariant | null = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId &&
        JSON.stringify(item.variant) === JSON.stringify(variant)
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Incrementa a quantidade
  const incrementQuantity = (productId: string, variant: CartVariant | null = null) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId &&
        JSON.stringify(item.variant) === JSON.stringify(variant)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Decrementa a quantidade
  const decrementQuantity = (productId: string, variant: CartVariant | null = null) => {
    setCart((prevCart) => {
      const item = prevCart.find(
        (i) =>
          i.id === productId &&
          JSON.stringify(i.variant) === JSON.stringify(variant)
      );

      if (item && item.quantity <= 1) {
        return prevCart.filter(
          (i) =>
            !(
              i.id === productId &&
              JSON.stringify(i.variant) === JSON.stringify(variant)
            )
        );
      }

      return prevCart.map((i) =>
        i.id === productId &&
        JSON.stringify(i.variant) === JSON.stringify(variant)
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
    });
  };

  // Limpa todo o carrinho
  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false);
  };

  // Abre/fecha o carrinho
  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartTotal,
        cartItemCount,
        isCartOpen,
        showClearConfirmation,
        pendingProduct,
        addToCart,
        removeFromCart,
        updateQuantity,
        incrementQuantity,
        decrementQuantity,
        clearCart,
        toggleCart,
        setIsCartOpen,
        continueWithExistingCart,
        clearPreviousSession,
        cancelPendingAdd,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
