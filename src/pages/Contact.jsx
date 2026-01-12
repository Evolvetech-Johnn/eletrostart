import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, Instagram, Facebook, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// Configure sua URL do Discord Webhook aqui
const DISCORD_WEBHOOK_URL = "YOUR_DISCORD_WEBHOOK_URL";

const Contact = () => {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    assunto: "",
    mensagem: ""
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sendToDiscord = async (data) => {
    const embed = {
      title: "📩 Nova Mensagem de Contato - Eletrostart",
      color: 2252955, // Cor #222998 em decimal
      fields: [
        { name: "👤 Nome", value: data.nome || "Não informado", inline: true },
        { name: "📞 Telefone", value: data.telefone || "Não informado", inline: true },
        { name: "📧 E-mail", value: data.email || "Não informado", inline: false },
        { name: "📋 Assunto", value: data.assunto || "Não selecionado", inline: false },
        { name: "💬 Mensagem", value: data.mensagem || "Sem mensagem", inline: false }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "Formulário de Contato - eletrostart.com.br"
      }
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Eletrostart Bot",
        avatar_url: "https://i.imgur.com/5tqvJzY.png",
        embeds: [embed]
      })
    });

    return response.ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome || !formData.email || !formData.mensagem) {
      setStatus({ type: "error", message: "Por favor, preencha os campos obrigatórios." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const success = await sendToDiscord(formData);
      
      if (success) {
        setStatus({ type: "success", message: "Mensagem enviada com sucesso! Entraremos em contato em breve." });
        setFormData({ nome: "", telefone: "", email: "", assunto: "", mensagem: "" });
      } else {
        throw new Error("Falha ao enviar");
      }
    } catch (error) {
      setStatus({ type: "error", message: "Erro ao enviar mensagem. Tente novamente ou entre em contato por telefone." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      {/* Hero Header */}
      <div className="bg-[#222998] text-white py-20 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <MessageSquare size={400} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <nav className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-[0.2em] mb-6 opacity-60">
            <span>Início</span>
            <span>/</span>
            <span className="text-white">Contato</span>
          </nav>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
            Fale Conosco
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl font-medium italic">
            Estamos prontos para dimensionar seu projeto elétrico ou solar. Entre em contato pelos nossos canais oficiais.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-blue-900/5 group hover:-translate-y-1 transition-all">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-primary/10 p-4 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Telefone</h3>
                  <p className="text-lg font-black text-gray-900">(43) 3333-3333</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">Atendimento de Segunda a Sexta das 08h às 18h.</p>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-blue-900/5 group hover:-translate-y-1 transition-all">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-primary/10 p-4 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">E-mail</h3>
                  <p className="text-lg font-black text-gray-900 truncate">contato@eletrostart.com.br</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">Respondemos em até 24 horas úteis.</p>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-blue-900/5 group hover:-translate-y-1 transition-all">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-primary/10 p-4 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Localização</h3>
                  <p className="text-lg font-black text-gray-900">Londrina, PR</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">Avenida Celso Garcia Cid, 1027<br/>Vila Siam/Centro</p>
            </div>

            {/* Social Links */}
            <div className="bg-primary p-8 rounded-[32px] shadow-xl shadow-primary/20 text-white">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 opacity-60">Siga-nos</h3>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/eletrostartlondrina/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"><Instagram size={20} /></a>
                <a href="https://web.facebook.com/eletro.start.1" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"><Facebook size={20} /></a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl shadow-blue-900/5">
              <h2 className="text-3xl font-black text-gray-900 uppercase mb-2 tracking-tight">Envie uma Mensagem</h2>
              <p className="text-gray-500 mb-10 font-medium">Preencha os campos abaixo e entraremos em contato com você.</p>
              
              {/* Status Message */}
              {status.message && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${
                  status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {status.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  <span className="font-medium">{status.message}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Nome Completo *</label>
                    <input 
                      type="text" 
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Ex: João Silva" 
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium text-gray-900"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Telefone / WhatsApp</label>
                    <input 
                      type="tel" 
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      placeholder="(43) 99999-9999" 
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium text-gray-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Seu Melhor E-mail *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contato@empresa.com.br" 
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium text-gray-900"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Assunto</label>
                  <select 
                    name="assunto"
                    value={formData.assunto}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold text-gray-600 appearance-none"
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="Orçamento de Material">Orçamento de Material</option>
                    <option value="Como achar o codigo de rastreio">Como achar o código de rastreio</option>
                    <option value="Dúvida Técnica">Dúvida Técnica</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Mensagem *</label>
                  <textarea 
                    rows="5" 
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleChange}
                    placeholder="Como podemos ajudar você hoje?" 
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium text-gray-900 resize-none"
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-secondary hover:bg-red-700 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-500/20 flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Enviar Mensagem</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

