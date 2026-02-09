import React from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { PLACEHOLDER_IMAGE } from "../utils/productHelpers";

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    cart,
    cartTotal,
    cartItemCount,
    isCartOpen,
    showClearConfirmation,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    setIsCartOpen,
    continueWithExistingCart,
    clearPreviousSession,
    cancelPendingAdd,
  } = useCart();

  const formatPrice = (price) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      {(isCartOpen || showClearConfirmation) && (
        <div
          className="fixed inset-0 bg-black/50 z-[998] transition-opacity"
          onClick={() => {
            setIsCartOpen(false);
            cancelPendingAdd();
          }}
        />
      )}

      {/* Session Confirmation Modal - Só aparece em nova sessão com carrinho pendente */}
      {showClearConfirmation && cart.length > 0 && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                Carrinho Recuperado
              </h3>
              <p className="text-gray-500">
                Você tem {cartItemCount}{" "}
                {cartItemCount === 1 ? "item" : "itens"} da sua última visita.
                Deseja continuar com esses produtos?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={continueWithExistingCart}
                className="w-full bg-primary hover:bg-blue-800 text-white py-4 rounded-2xl font-bold transition-colors"
              >
                Continuar com o Carrinho
              </button>
              <button
                onClick={clearPreviousSession}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold transition-colors"
              >
                Limpar e Começar Novo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[999] transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-[#222998] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag size={24} />
            <div>
              <h2 className="font-black text-lg uppercase tracking-wider">
                Meu Carrinho
              </h2>
              <p className="text-sm opacity-80">
                {cartItemCount} {cartItemCount === 1 ? "item" : "itens"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ height: "calc(100vh - 280px)" }}
        >
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={40} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Seu carrinho está vazio
              </h3>
              <p className="text-gray-500 text-sm">
                Adicione produtos para começar suas compras
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {cart.map((item, index) => (
                <div
                  key={`${item.id}-${JSON.stringify(item.variant)}-${index}`}
                  className="bg-gray-50 rounded-2xl p-4 flex gap-4"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.image || PLACEHOLDER_IMAGE}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate mb-1">
                      {item.name}
                    </h4>
                    {item.code && (
                      <p className="text-[10px] text-gray-500 font-mono mb-1">
                        COD: {item.code}
                      </p>
                    )}
                    {item.variant && (
                      <p className="text-xs text-gray-500 mb-1">
                        {item.variant.name}: {item.variant.value}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mb-2">{item.unit}</p>
                    <p className="font-black text-primary">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.id, item.variant)}
                      className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-sm">
                      <button
                        onClick={() => decrementQuantity(item.id, item.variant)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-sm w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementQuantity(item.id, item.variant)}
                        className="w-8 h-8 rounded-full bg-primary text-white hover:bg-blue-800 flex items-center justify-center transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold">{formatPrice(cartTotal)}</span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">Total a Pagar</span>
              <span className="text-2xl font-black text-primary">
                {formatPrice(cartTotal)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={clearCart}
                className="py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
              >
                Limpar
              </button>
              <button
                onClick={handleCheckout}
                className="py-3 px-4 rounded-xl bg-secondary text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                Finalizar
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
