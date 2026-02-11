import React, { useState } from "react";
import { HelpCircle, ChevronDown, Search } from "lucide-react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Qual o prazo de entrega para Londrina?",
      a: "Para Londrina e região metropolitana, o prazo médio é de 1 a 2 dias úteis após a confirmação do pagamento. Oferecemos entrega via frota própria para garantir agilidade e segurança."
    },
    {
      q: "Vocês realizam projetos de energia solar?",
      a: "Sim! Somos especialistas em energia fotovoltaica. Realizamos desde o estudo de viabilidade e projeto de engenharia até a instalação e homologação junto à rede elétrica."
    },
    {
      q: "Como posso acompanhar meu pedido?",
      a: "Após a postagem, você receberá um código de rastreio via e-mail. Também é possível acompanhar o status acessando 'Minha Conta' e clicando em 'Meus Pedidos'."
    },
    {
      q: "Quais são as formas de pagamento?",
      a: "Aceitamos cartões de crédito (Visa, Master, Elo) com parcelamento em até 10x sem juros, PIX com 5% de desconto e boleto bancário."
    },
    {
      q: "Os produtos possuem garantia?",
      a: "Sim, todos os nossos produtos possuem garantia de fábrica. O prazo varia conforme o fabricante e o tipo de componente elétrico."
    }
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <div className="bg-[#222998] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none">Dúvidas Frequentes</h1>
          <div className="max-w-2xl mx-auto relative mt-8">
            <input type="text" placeholder="Como podemos ajudar?" className="w-full px-8 py-4 rounded-full bg-white text-gray-900 shadow-xl outline-none focus:ring-4 ring-blue-400/30 font-medium" />
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary"><HelpCircle size={18} /></div>
                  <span className="font-bold text-gray-900 text-sm uppercase tracking-wide">{faq.q}</span>
                </div>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              <div className={`transition-all duration-300 overflow-hidden ${openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="p-8 pt-0 text-gray-600 text-sm leading-relaxed border-t border-gray-50 mt-2">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
