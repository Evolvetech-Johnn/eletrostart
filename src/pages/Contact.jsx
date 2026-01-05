import React from "react";
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, Instagram, Facebook, Linkedin } from "lucide-react";

const Contact = () => {
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
                <a href="#" className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"><Instagram size={20} /></a>
                <a href="#" className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"><Facebook size={20} /></a>
                <a href="#" className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"><Linkedin size={20} /></a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl shadow-blue-900/5">
              <h2 className="text-3xl font-black text-gray-900 uppercase mb-2 tracking-tight">Envie uma Mensagem</h2>
              <p className="text-gray-500 mb-10 font-medium">Preencha os campos abaixo e entraremos em contato com você.</p>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Nome Completo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: João Silva" 
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Telefone / WhatsApp</label>
                    <input 
                      type="tel" 
                      placeholder="(43) 99999-9999" 
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium text-gray-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Seu Melhor E-mail</label>
                  <input 
                    type="email" 
                    placeholder="contato@empresa.com.br" 
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Assunto</label>
                  <select className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold text-gray-600 appearance-none">
                    <option>Selecione uma opção</option>
                    <option>Orçamento de Material</option>
                    <option>Projeto de Energia Solar</option>
                    <option>Dúvida Técnica</option>
                    <option>Outros</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Mensagem</label>
                  <textarea 
                    rows="5" 
                    placeholder="Como podemos ajudar você hoje?" 
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium text-gray-900 resize-none"
                  ></textarea>
                </div>

                <button className="w-full md:w-auto bg-secondary hover:bg-red-700 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-500/20 flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-95">
                  <Send size={18} />
                  <span>Enviar Mensagem</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="mt-20 rounded-[40px] overflow-hidden shadow-2xl shadow-blue-900/10 grayscale hover:grayscale-0 transition-all duration-1000 bg-gray-200 h-[450px] relative group">
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-sm group-hover:opacity-0 transition-opacity z-10 text-white">
            <MapPin size={48} className="mb-4" />
            <p className="font-black uppercase tracking-[0.3em]">Clique para ver o mapa</p>
          </div>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3663.359857943542!2d-51.1555555!3d-23.3111111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDE4JzQwLjAiUyA1McKwMDknMjAuMCJX!5e0!3m2!1spt-BR!2sbr!4v1234567890" 
            className="w-full h-full border-0"
            allowFullScreen="" 
            loading="lazy" 
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
