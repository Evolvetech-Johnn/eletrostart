import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag, ChevronRight, User, MapPin, CreditCard, QrCode,
  FileText, MessageCircle, Truck, ShieldCheck, CheckCircle, AlertCircle,
  ArrowLeft, Trash2, Plus, Minus, Loader2, Home, Clock,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { orderService } from "../services/orderService";
import PixPayment from "../components/PixPayment";
import { PLACEHOLDER_IMAGE } from "../utils/productHelpers";
import {
  formatCEP, formatPhone, fetchAddressByCEP, isValidCEP, isValidPhone,
} from "../utils/formatters";
import { buildWhatsappMessage } from "../utils/orderMessage";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "554330295020";
const PIX_DISCOUNT_PCT = 5;

const LAST_ORDER_KEY = "eletrostart_last_order";

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  observacoes: string;
}

interface FormErrors {
  nome?: string;
  email?: string;
  telefone?: string;
  payment?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

const saveOrderToHistory = (order: {
  id: string;
  date: string;
  total: number;
  items: { name: string; quantity: number; image?: string }[];
  status: string;
}) => {
  try {
    const existing = localStorage.getItem("my_orders");
    const orders = existing ? JSON.parse(existing) : [];
    orders.unshift(order);
    localStorage.setItem("my_orders", JSON.stringify(orders.slice(0, 20)));
    // Persist for confirmation recovery
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ ...order, timestamp: Date.now() }));
  } catch (e) {
    console.error("Erro ao salvar histórico local", e);
  }
};

const estadosBrasil = [
  { uf: "AC", nome: "Acre" }, { uf: "AL", nome: "Alagoas" },
  { uf: "AP", nome: "Amapá" }, { uf: "AM", nome: "Amazonas" },
  { uf: "BA", nome: "Bahia" }, { uf: "CE", nome: "Ceará" },
  { uf: "DF", nome: "Distrito Federal" }, { uf: "ES", nome: "Espírito Santo" },
  { uf: "GO", nome: "Goiás" }, { uf: "MA", nome: "Maranhão" },
  { uf: "MT", nome: "Mato Grosso" }, { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" }, { uf: "PA", nome: "Pará" },
  { uf: "PB", nome: "Paraíba" }, { uf: "PR", nome: "Paraná" },
  { uf: "PE", nome: "Pernambuco" }, { uf: "PI", nome: "Piauí" },
  { uf: "RJ", nome: "Rio de Janeiro" }, { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RS", nome: "Rio Grande do Sul" }, { uf: "RO", nome: "Rondônia" },
  { uf: "RR", nome: "Roraima" }, { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "São Paulo" }, { uf: "SE", nome: "Sergipe" },
  { uf: "TO", nome: "Tocantins" },
];

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, cartItemCount, removeFromCart, incrementQuantity, decrementQuantity, clearCart } = useCart();

  const [formData, setFormData] = useState<FormData>({
    nome: "", email: "", telefone: "", cep: "", endereco: "",
    numero: "", complemento: "", bairro: "", cidade: "", estado: "", observacoes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(() => {
    return (localStorage.getItem("eletrostart_checkout_delivery_type") as "delivery" | "pickup") || "delivery";
  });

  // Estado do pagamento PIX inline
  const [pixOrder, setPixOrder] = useState<{
    orderId: string; total: number; customerName: string; customerEmail: string;
  } | null>(null);
  const [pixConfirmed, setPixConfirmed] = useState(false);

  // sessionId persistente para reserva de estoque
  const sessionId = useMemo(() => {
    const stored = localStorage.getItem("eletrostart_session_id");
    if (stored) return stored;
    const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("eletrostart_session_id", id);
    return id;
  }, []);

  useEffect(() => {
    localStorage.setItem("eletrostart_checkout_delivery_type", deliveryType);
  }, [deliveryType]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [cepError, setCepError] = useState("");

  // Recover confirmation state if page was refreshed
  useEffect(() => {
    const saved = localStorage.getItem(LAST_ORDER_KEY);
    if (saved && cart.length === 0) {
      try {
        const parsed = JSON.parse(saved);
        const ageMs = Date.now() - (parsed.timestamp || 0);
        if (ageMs < 30 * 60 * 1000) { // 30 min window
          setLastOrderId(parsed.id);
          setOrderPlaced(true);
        }
      } catch {}
    }
  }, []);

  const formatPrice = (price: number) =>
    price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Pix discount applied
  const pixDiscount = paymentMethod === "pix" ? cartTotal * (PIX_DISCOUNT_PCT / 100) : 0;
  const finalTotal = cartTotal - pixDiscount;

  const handleMaskedInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === "telefone") formatted = formatPhone(value);
    else if (name === "cep") formatted = formatCEP(value);
    setFormData((prev) => ({ ...prev, [name]: formatted }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }, [errors]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCEPBlur = async () => {
    const cep = formData.cep;
    if (!cep || !isValidCEP(cep)) {
      if (cep && cep.replace(/\D/g, "").length > 0) setCepError("CEP inválido");
      return;
    }
    setCepError("");
    setLoadingCEP(true);
    const address = await fetchAddressByCEP(cep);
    setLoadingCEP(false);
    if (address) {
      setFormData((prev) => ({
        ...prev,
        endereco: address.endereco || prev.endereco,
        bairro: address.bairro || prev.bairro,
        cidade: address.cidade || prev.cidade,
        estado: address.estado || prev.estado,
        complemento: address.complemento || prev.complemento,
      }));
    } else {
      setCepError("CEP não encontrado");
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.telefone.trim()) newErrors.telefone = "Telefone é obrigatório";
    else if (!isValidPhone(formData.telefone)) newErrors.telefone = "Telefone inválido";
    if (!formData.email.trim()) newErrors.email = "E-mail é obrigatório";
    if (!paymentMethod) newErrors.payment = "Selecione uma forma de pagamento";

    if (deliveryType === "delivery") {
      if (!formData.cep.trim()) newErrors.cep = "CEP é obrigatório para entrega";
      if (!formData.endereco.trim()) newErrors.endereco = "Endereço é obrigatório para entrega";
      if (!formData.cidade.trim()) newErrors.cidade = "Cidade é obrigatória para entrega";
      if (!formData.estado.trim()) newErrors.estado = "Estado é obrigatório para entrega";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateOrderMessage = (orderId: string | null = null) => {
    const address = deliveryType === "delivery" && formData.endereco
      ? {
          street: formData.endereco, number: formData.numero,
          comp: formData.complemento || undefined, city: formData.cidade,
          state: formData.estado, zip: formData.cep,
        }
      : undefined;

    const paymentLabels: Record<string, string> = {
      pix: `PIX (${PIX_DISCOUNT_PCT}% desconto)`,
      boleto: "Boleto Bancário",
      cartao: "Cartão de Crédito",
      whatsapp: "Combinar via WhatsApp",
    };

    return buildWhatsappMessage({
      id: orderId || undefined,
      customerName: formData.nome,
      customerPhone: formData.telefone,
      customerEmail: formData.email,
      address,
      items: cart.map((item) => ({
        name: item.variant ? `${item.name} (${item.variant.name})` : item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        code: item.code,
      })),
      total: finalTotal,
      paymentMethod: paymentLabels[paymentMethod],
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const deliveryNote = deliveryType === "pickup" ? "[RETIRADA NA LOJA]" : "";
      const notes = [deliveryNote, formData.observacoes].filter(Boolean).join(" | ");

      const orderData = {
        customer: {
          name: formData.nome,
          email: formData.email,
          phone: formData.telefone,
          doc: "",
        },
        fulfillmentType: deliveryType,
        address: deliveryType === "delivery" ? {
          zip: formData.cep,
          street: formData.endereco,
          number: formData.numero || "S/N",
          comp: formData.complemento,
          city: formData.cidade,
          state: formData.estado,
        } : undefined,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        notes,
      };

      // Criar pedido no backend
      let orderId: string | null = null;
      try {
        const order = await orderService.createOrder(orderData);
        if (order?.id) orderId = order.id;
      } catch (err) {
        console.error("Erro ao salvar pedido no backend:", err);
      }

      // ── PIX: exibir QR Code inline em vez de redirecionar ao WhatsApp
      if (paymentMethod === "pix" && orderId) {
        setPixOrder({
          orderId,
          total: finalTotal,
          customerName: formData.nome,
          customerEmail: formData.email,
        });
        clearCart();
        return;  // Não abre WhatsApp para PIX
      }

      // ── Outros métodos: fluxo WhatsApp original
      const message = generateOrderMessage(orderId);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");

      const historyId = orderId || `WA-${Date.now()}`;
      saveOrderToHistory({
        id: historyId,
        date: new Date().toISOString(),
        total: finalTotal,
        items: cart.map((i) => ({ name: i.name, quantity: i.quantity, image: i.image || undefined })),
        status: "Enviado",
      });

      setLastOrderId(orderId);
      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.error("Erro inesperado no checkout:", error);
      alert("Ocorreu um erro ao processar seu pedido. Por favor, tente novamente ou entre em contato pelo WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishOrder = () => {
    localStorage.removeItem(LAST_ORDER_KEY);
    navigate("/");
  };

  // ── PIX: tela de pagamento inline
  if (pixOrder) {
    if (pixConfirmed) {
      return (
        <div className="min-h-screen bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center bg-white rounded-3xl p-12 shadow-xl">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Pagamento Confirmado!</h2>
              <p className="text-sm font-mono text-gray-500 mb-4">#{pixOrder.orderId.slice(0, 8)}</p>
              <p className="text-gray-500 mb-8">
                Seu PIX foi aprovado. Você receberá a confirmação por e-mail.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to={`/meu-pedido/${pixOrder.orderId}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all"
                >
                  <Clock size={16} /> Acompanhar Pedido
                </Link>
                <button onClick={() => navigate("/")}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors">
                  Voltar para a Loja
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Pagar com PIX</h2>
            <PixPayment
              orderId={pixOrder.orderId}
              amount={pixOrder.total}
              sessionId={sessionId}
              onPaymentConfirmed={() => setPixConfirmed(true)}
            />
            <p className="text-center text-xs text-gray-400 mt-6">
              Prefere outro método?{" "}
              <Link to="/checkout" className="text-primary font-bold hover:underline"
                onClick={() => setPixOrder(null)}>
                Voltar ao checkout
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center bg-white rounded-3xl p-12 shadow-xl">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Seu carrinho está vazio</h2>
            <p className="text-gray-500 mb-8">Adicione produtos ao carrinho para continuar com a compra.</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors">
              Ver Produtos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Order confirmation
  if (orderPlaced) {
    const messagePreview = generateOrderMessage(lastOrderId);
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center bg-white rounded-3xl p-12 shadow-xl">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Pedido Enviado!</h2>
            {lastOrderId && (
              <p className="text-sm font-mono text-gray-500 mb-4">
                ID: #{lastOrderId.slice(0, 8)}
              </p>
            )}
            <p className="text-gray-500 mb-8">
              Seu pedido foi enviado via WhatsApp. Nossa equipe entrará em contato para confirmar os detalhes e finalizar o pagamento.
            </p>
            <div className="space-y-4 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left">
                <p className="text-blue-800 font-medium text-sm">
                  💡 Caso a janela do WhatsApp não tenha aberto, entre em contato pelo <strong>(43) 3029-5020</strong>
                </p>
              </div>
              {lastOrderId && (
                <Link
                  to={`/meu-pedido/${lastOrderId}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all"
                >
                  <Clock size={16} /> Acompanhar Pedido
                </Link>
              )}
              {messagePreview && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Mensagem enviada</p>
                    <button type="button" className="text-xs font-bold text-primary hover:underline"
                      onClick={() => navigator.clipboard.writeText(messagePreview)}>
                      Copiar
                    </button>
                  </div>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">{messagePreview}</pre>
                </div>
              )}
            </div>
            <button onClick={handleFinishOrder}
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors">
              Voltar para a Loja
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#222998] text-white py-8">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 text-xs uppercase font-bold tracking-widest mb-4 opacity-60">
            <Link to="/" className="hover:text-white/80">Início</Link>
            <ChevronRight size={12} />
            <Link to="/products" className="hover:text-white/80">Produtos</Link>
            <ChevronRight size={12} />
            <span className="text-white">Checkout</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Finalizar Pedido</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-8">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium">
              <ArrowLeft size={18} /> Voltar
            </button>

            {/* Customer Data */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase">Seus Dados</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Nome Completo *</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleInputChange}
                    className={`w-full px-5 py-4 rounded-xl bg-gray-50 border-2 ${errors.nome ? "border-red-400" : "border-transparent"} focus:border-primary focus:bg-white outline-none transition-all font-medium`}
                    placeholder="Ex: João da Silva" />
                  {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Telefone / WhatsApp *</label>
                  <input type="tel" name="telefone" value={formData.telefone} onChange={handleMaskedInputChange} maxLength={16}
                    className={`w-full px-5 py-4 rounded-xl bg-gray-50 border-2 ${errors.telefone ? "border-red-400" : "border-transparent"} focus:border-primary focus:bg-white outline-none transition-all font-medium`}
                    placeholder="(43) 99999-9999" />
                  {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">E-mail *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                    className={`w-full px-5 py-4 rounded-xl bg-gray-50 border-2 ${errors.email ? "border-red-400" : "border-transparent"} focus:border-primary focus:bg-white outline-none transition-all font-medium`}
                    placeholder="seu@email.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Delivery Type */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Truck size={20} className="text-primary" />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase">Tipo de Entrega *</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button type="button" onClick={() => setDeliveryType("delivery")}
                  className={`p-5 rounded-2xl border-2 transition-all text-left ${deliveryType === "delivery" ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${deliveryType === "delivery" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Truck size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Entrega</h3>
                      <p className="text-xs text-gray-500">Receba no seu endereço</p>
                    </div>
                  </div>
                </button>
                <button type="button" onClick={() => setDeliveryType("pickup")}
                  className={`p-5 rounded-2xl border-2 transition-all text-left ${deliveryType === "pickup" ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${deliveryType === "pickup" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Home size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Retirada na Loja</h3>
                      <p className="text-xs text-gray-500">Combine via WhatsApp</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Delivery Address */}
            {deliveryType === "delivery" && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <MapPin size={20} className="text-primary" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 uppercase">Endereço de Entrega *</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">CEP *</label>
                    <div className="relative">
                      <input type="text" name="cep" value={formData.cep} onChange={handleMaskedInputChange}
                        onBlur={handleCEPBlur} maxLength={10}
                        className={`w-full px-5 py-4 rounded-xl bg-gray-50 border-2 ${(cepError || errors.cep) ? "border-red-400" : "border-transparent"} focus:border-primary focus:bg-white outline-none transition-all font-medium pr-12`}
                        placeholder="00000-000" />
                      {loadingCEP && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 size={20} className="animate-spin text-primary" /></div>}
                    </div>
                    {(cepError || errors.cep) && <p className="text-red-500 text-xs mt-1">{cepError || errors.cep}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Endereço *</label>
                    <input type="text" name="endereco" value={formData.endereco} onChange={handleInputChange}
                      className={`w-full px-5 py-4 rounded-xl bg-gray-50 border-2 ${errors.endereco ? "border-red-400" : "border-transparent"} focus:border-primary focus:bg-white outline-none transition-all font-medium`}
                      placeholder="Rua, Avenida..." />
                    {errors.endereco && <p className="text-red-500 text-xs mt-1">{errors.endereco}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Número</label>
                    <input type="text" name="numero" value={formData.numero} onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium"
                      placeholder="123" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Complemento</label>
                    <input type="text" name="complemento" value={formData.complemento} onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium"
                      placeholder="Apto, Bloco, Casa..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Bairro</label>
                    <input type="text" name="bairro" value={formData.bairro} onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium"
                      placeholder="Bairro" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Cidade *</label>
                    <input type="text" name="cidade" value={formData.cidade} onChange={handleInputChange}
                      className={`w-full px-5 py-4 rounded-xl bg-gray-50 border-2 ${errors.cidade ? "border-red-400" : "border-transparent"} focus:border-primary focus:bg-white outline-none transition-all font-medium`}
                      placeholder="Londrina" />
                    {errors.cidade && <p className="text-red-500 text-xs mt-1">{errors.cidade}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Estado *</label>
                    <select name="estado" value={formData.estado} onChange={handleInputChange}
                      className={`w-full px-5 py-4 rounded-xl bg-gray-50 border-2 ${errors.estado ? "border-red-400" : "border-transparent"} focus:border-primary focus:bg-white outline-none transition-all font-medium`}>
                      <option value="">Selecione</option>
                      {estadosBrasil.map((e) => <option key={e.uf} value={e.uf}>{e.nome}</option>)}
                    </select>
                    {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <CreditCard size={20} className="text-primary" />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase">Forma de Pagamento *</h2>
              </div>
              {errors.payment && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-500" />
                  <p className="text-red-600 text-sm font-medium">{errors.payment}</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "pix", icon: QrCode, title: "PIX", sub: `${PIX_DISCOUNT_PCT}% de desconto 🎉`, highlight: true },
                  { id: "boleto", icon: FileText, title: "Boleto", sub: "Vencimento em 3 dias", highlight: false },
                  { id: "cartao", icon: CreditCard, title: "Cartão de Crédito", sub: "Até 10x sem juros", highlight: false },
                  { id: "whatsapp", icon: MessageCircle, title: "Combinar via WhatsApp", sub: "Fale com um vendedor", highlight: false },
                ].map(({ id, icon: Icon, title, sub, highlight }) => (
                  <button key={id} type="button" onClick={() => setPaymentMethod(id)}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${paymentMethod === id ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === id ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{title}</h3>
                        <p className={`text-xs ${highlight ? "text-green-600 font-semibold" : "text-gray-500"}`}>{sub}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-black text-gray-900 uppercase mb-4">Observações (opcional)</h2>
              <textarea name="observacoes" value={formData.observacoes} onChange={handleInputChange} rows={3}
                className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium resize-none"
                placeholder="Instruções especiais, ponto de referência, etc..." />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-32">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShoppingBag size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900 uppercase">Resumo do Pedido</h2>
                  <p className="text-xs text-gray-400 font-medium">{cartItemCount} {cartItemCount === 1 ? "item" : "itens"}</p>
                </div>
              </div>

              <div className="space-y-4 max-h-80 overflow-y-auto mb-6">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${JSON.stringify(item.variant)}-${index}`}
                    className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image || PLACEHOLDER_IMAGE} alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                      {item.code && <p className="text-[10px] text-gray-500 font-mono mb-1">COD: {item.code}</p>}
                      {item.variant && <p className="text-xs text-gray-500">{item.variant.name}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => decrementQuantity(item.id, item.variant)}
                            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => incrementQuantity(item.id, item.variant)}
                            className="w-6 h-6 rounded-full bg-primary text-white hover:bg-blue-800 flex items-center justify-center">
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="font-bold text-primary text-sm">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.variant)}
                      className="text-gray-400 hover:text-red-500 transition-colors self-start">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                {pixDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-semibold">Desconto PIX ({PIX_DISCOUNT_PCT}%)</span>
                    <span className="font-bold text-green-600">-{formatPrice(pixDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frete</span>
                  <span className="font-medium text-amber-600">
                    {deliveryType === "pickup" ? "Retirada grátis" : "A combinar"}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-black text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <button onClick={handleSubmit} disabled={isSubmitting}
                className={`w-full mt-6 bg-secondary hover:bg-red-700 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}>
                {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Enviando...</> : "Enviar Pedido"}
              </button>

              <div className="mt-6 flex items-center justify-center gap-6 text-gray-400">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <ShieldCheck size={16} /><span>Compra Segura</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Truck size={16} /><span>Entrega Rápida</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
