import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <div className="font-sans">
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Fale Conosco</h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Estamos prontos para atender você. Entre em contato por telefone,
            e-mail ou visite nossa loja.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-primary text-white p-10">
            <h3 className="text-2xl font-bold mb-6">Informações de Contato</h3>
            <p className="text-blue-100 mb-8">
              Tem alguma dúvida sobre nossos produtos ou serviços? Preencha o
              formulário e nossa equipe entrará em contato o mais breve
              possível.
            </p>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">Telefone</p>
                  <p className="text-blue-100">(XX) XXXX-XXXX</p>
                  <p className="text-blue-100 text-sm">Seg a Sex: 08h às 18h</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">E-mail</p>
                  <p className="text-blue-100">contato@eletrostart.com.br</p>
                  <p className="text-blue-100">orcamento@eletrostart.com.br</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">Endereço</p>
                  <p className="text-blue-100">
                    Avenida Celso Garcia Cid, 1027
                  </p>
                  <p className="text-blue-100">
                    Vila Siam/Centro, Londrina – PR
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 p-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Envie uma Mensagem
            </h3>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  placeholder="Seu nome"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    placeholder="(XX) XXXXX-XXXX"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Assunto
                </label>
                <select
                  id="subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                >
                  <option value="">Selecione um assunto</option>
                  <option value="orcamento">Orçamento</option>
                  <option value="duvida">Dúvida Técnica</option>
                  <option value="trabalhe">Trabalhe Conosco</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mensagem
                </label>
                <textarea
                  id="message"
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  placeholder="Como podemos ajudar?"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-secondary text-white font-bold rounded-md hover:bg-red-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="mt-16 bg-gray-200 w-full h-80 rounded-xl flex items-center justify-center text-gray-500 shadow-inner">
          <span className="text-lg font-medium">
            Mapa de Localização (Google Maps)
          </span>
        </div>
      </div>
    </div>
  );
};

export default Contact;
