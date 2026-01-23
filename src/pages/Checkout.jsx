import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  ChevronRight, 
  User, 
  MapPin, 
  CreditCard, 
  QrCode, 
  FileText, 
  MessageCircle,
  Truck,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Loader2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PLACEHOLDER_IMAGE } from '../utils/productHelpers';
import { formatCEP, formatPhone, fetchAddressByCEP, isValidCEP, isValidPhone } from '../utils/formatters';

const Checkout = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    cartTotal, 
    cartItemCount, 
    removeFromCart, 
    incrementQuantity, 
    decrementQuantity,
    clearCart 
  } = useCart();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [cepError, setCepError] = useState('');

  const formatPrice = (price) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Handler para input com máscara
  const handleMaskedInputChange = useCallback((e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'telefone') {
      formattedValue = formatPhone(value);
    } else if (name === 'cep') {
      formattedValue = formatCEP(value);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Handler para input normal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Busca endereço pelo CEP quando o campo perde o foco
  const handleCEPBlur = async () => {
    const cep = formData.cep;
    
    if (!cep || !isValidCEP(cep)) {
      if (cep && cep.replace(/\D/g, '').length > 0) {
        setCepError('CEP inválido');
      }
      return;
    }

    setCepError('');
    setLoadingCEP(true);

    const address = await fetchAddressByCEP(cep);
    
    setLoadingCEP(false);

    if (address) {
      setFormData(prev => ({
        ...prev,
        endereco: address.endereco || prev.endereco,
        bairro: address.bairro || prev.bairro,
        cidade: address.cidade || prev.cidade,
        estado: address.estado || prev.estado,
        complemento: address.complemento || prev.complemento
      }));
    } else {
      setCepError('CEP não encontrado');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!isValidPhone(formData.telefone)) {
      newErrors.telefone = 'Telefone inválido';
    }
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';
    if (!paymentMethod) newErrors.payment = 'Selecione uma forma de pagamento';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateOrderMessage = () => {
    const items = cart.map(item => {
      const variantInfo = item.variant ? ` (${item.variant.name})` : '';
      return `• ${item.quantity}x ${item.name}${variantInfo} - ${formatPrice(item.price * item.quantity)}`;
    }).join('\n');

    const addressInfo = formData.endereco 
      ? `\n📍 *Endereço:*\n${formData.endereco}, ${formData.numero}${formData.complemento ? ' - ' + formData.complemento : ''}\n${formData.bairro} - ${formData.cidade}/${formData.estado}\nCEP: ${formData.cep}`
      : '';

    const paymentLabels = {
      pix: 'PIX',
      boleto: 'Boleto Bancário',
      cartao: 'Cartão de Crédito',
      whatsapp: 'Combinar via WhatsApp'
    };

    return `🛒 *NOVO PEDIDO - ELETROSTART*\n\n👤 *Cliente:* ${formData.nome}\n📞 *Telefone:* ${formData.telefone}\n📧 *E-mail:* ${formData.email}${addressInfo}\n\n📦 *Itens do Pedido:*\n${items}\n\n💰 *Total: ${formatPrice(cartTotal)}*\n\n💳 *Forma de Pagamento:* ${paymentLabels[paymentMethod]}`;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const message = generateOrderMessage();
    const whatsappUrl = `https://wa.me/554330295020?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp with order details
    window.open(whatsappUrl, '_blank');
    
    // Mark order as placed
    setOrderPlaced(true);
  };

  const handleFinishOrder = () => {
    clearCart();
    navigate('/');
  };

  // Lista completa de estados brasileiros
  const estadosBrasil = [
    { uf: 'AC', nome: 'Acre' },
    { uf: 'AL', nome: 'Alagoas' },
    { uf: 'AP', nome: 'Amapá' },
    { uf: 'AM', nome: 'Amazonas' },
    { uf: 'BA', nome: 'Bahia' },
    { uf: 'CE', nome: 'Ceará' },
    { uf: 'DF', nome: 'Distrito Federal' },
    { uf: 'ES', nome: 'Espírito Santo' },
    { uf: 'GO', nome: 'Goiás' },
    { uf: 'MA', nome: 'Maranhão' },
    { uf: 'MT', nome: 'Mato Grosso' },
    { uf: 'MS', nome: 'Mato Grosso do Sul' },
    { uf: 'MG', nome: 'Minas Gerais' },
    { uf: 'PA', nome: 'Pará' },
    { uf: 'PB', nome: 'Paraíba' },
    { uf: 'PR', nome: 'Paraná' },
    { uf: 'PE', nome: 'Pernambuco' },
    { uf: 'PI', nome: 'Piauí' },
    { uf: 'RJ', nome: 'Rio de Janeiro' },
    { uf: 'RN', nome: 'Rio Grande do Norte' },
    { uf: 'RS', nome: 'Rio Grande do Sul' },
    { uf: 'RO', nome: 'Rondônia' },
    { uf: 'RR', nome: 'Roraima' },
    { uf: 'SC', nome: 'Santa Catarina' },
    { uf: 'SP', nome: 'São Paulo' },
    { uf: 'SE', nome: 'Sergipe' },
    { uf: 'TO', nome: 'Tocantins' }
  ];

  // If cart is empty and no order placed, redirect
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
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors"
            >
              Ver Produtos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Order confirmation screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center bg-white rounded-3xl p-12 shadow-xl">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Pedido Enviado!</h2>
            <p className="text-gray-500 mb-8">
              Seu pedido foi enviado via WhatsApp. Nossa equipe entrará em contato para confirmar os detalhes e finalizar o pagamento.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
              <p className="text-blue-800 font-medium text-sm">
                💡 Caso a janela do WhatsApp não tenha aberto, entre em contato pelo telefone <strong>(43) 3029-5020</strong>
              </p>
            </div>
            <button 
              onClick={handleFinishOrder}
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors"
            >
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
            
            {/* Back Button */}
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium"
            >
              <ArrowLeft size={18} />
              Voltar
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
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-4 rounded-xl bg-gray-50 border-2 ${errors.nome ? 'border-red-400' : 'border-transparent'} focus:border-primary focus:bg-white outline-none transition-all font-medium`}
                    placeholder="Ex: João da Silva"
                  />
                  {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Telefone / WhatsApp *</label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleMaskedInputChange}
                    maxLength={16}
                    className={`w-full px-5 py-4 rounded-xl bg-gray-50 border-2 ${errors.telefone ? 'border-red-400' : 'border-transparent'} focus:border-primary focus:bg-white outline-none transition-all font-medium`}
                    placeholder="(43) 99999-9999"
                  />
                  {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">E-mail *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-4 rounded-xl bg-gray-50 border-2 ${errors.email ? 'border-red-400' : 'border-transparent'} focus:border-primary focus:bg-white outline-none transition-all font-medium`}
                    placeholder="seu@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Delivery Address (Optional) */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPin size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 uppercase">Endereço de Entrega</h2>
                  <p className="text-xs text-gray-400 font-medium">(Opcional - preencha se desejar entrega)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">CEP</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cep"
                      value={formData.cep}
                      onChange={handleMaskedInputChange}
                      onBlur={handleCEPBlur}
                      maxLength={10}
                      className={`w-full px-5 py-4 rounded-xl bg-gray-50 border-2 ${cepError ? 'border-red-400' : 'border-transparent'} focus:border-primary focus:bg-white outline-none transition-all font-medium pr-12`}
                      placeholder="00000-000"
                    />
                    {loadingCEP && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 size={20} className="animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  {cepError && <p className="text-red-500 text-xs mt-1">{cepError}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Endereço</label>
                  <input
                    type="text"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium"
                    placeholder="Rua, Avenida..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Número</label>
                  <input
                    type="text"
                    name="numero"
                    value={formData.numero}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium"
                    placeholder="123"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Complemento</label>
                  <input
                    type="text"
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium"
                    placeholder="Apto, Bloco, Casa..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Bairro</label>
                  <input
                    type="text"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium"
                    placeholder="Bairro"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Cidade</label>
                  <input
                    type="text"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium"
                    placeholder="Londrina"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium"
                  >
                    <option value="">Selecione</option>
                    {estadosBrasil.map(estado => (
                      <option key={estado.uf} value={estado.uf}>{estado.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

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
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    paymentMethod === 'pix' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'pix' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <QrCode size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">PIX</h3>
                      <p className="text-xs text-gray-500">Pagamento instantâneo</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('boleto')}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    paymentMethod === 'boleto' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'boleto' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Boleto</h3>
                      <p className="text-xs text-gray-500">Vencimento em 3 dias</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cartao')}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    paymentMethod === 'cartao' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'cartao' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Cartão de Crédito</h3>
                      <p className="text-xs text-gray-500">Até 10x sem juros</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('whatsapp')}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    paymentMethod === 'whatsapp' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'whatsapp' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <MessageCircle size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Combinar via WhatsApp</h3>
                      <p className="text-xs text-gray-500">Fale com um vendedor</p>
                    </div>
                  </div>
                </button>
              </div>
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
                  <p className="text-xs text-gray-400 font-medium">{cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'}</p>
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 max-h-80 overflow-y-auto mb-6">
                {cart.map((item, index) => (
                  <div 
                    key={`${item.id}-${JSON.stringify(item.variant)}-${index}`}
                    className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image || PLACEHOLDER_IMAGE}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                      {item.variant && (
                        <p className="text-xs text-gray-500">{item.variant.name}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => decrementQuantity(item.id, item.variant)}
                            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => incrementQuantity(item.id, item.variant)}
                            className="w-6 h-6 rounded-full bg-primary text-white hover:bg-blue-800 flex items-center justify-center"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="font-bold text-primary text-sm">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.variant)}
                      className="text-gray-400 hover:text-red-500 transition-colors self-start"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frete</span>
                  <span className="font-medium text-green-600">A calcular</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-black text-primary">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full mt-6 bg-secondary hover:bg-red-700 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
              >
                Enviar Pedido
              </button>

              {/* Trust Badges */}
              <div className="mt-6 flex items-center justify-center gap-6 text-gray-400">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <ShieldCheck size={16} />
                  <span>Compra Segura</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Truck size={16} />
                  <span>Entrega Rápida</span>
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
