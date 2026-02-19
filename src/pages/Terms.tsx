import React from "react";
import { FileText, AlertCircle, CheckCircle, Scale, ShoppingCart, Truck, CreditCard, RefreshCcw, Shield, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Terms: React.FC = () => {
  const lastUpdate = "12 de Janeiro de 2026";

  const sections = [
    {
      id: "aceitacao",
      title: "1. Aceitação dos Termos",
      icon: CheckCircle,
      content: [
        "Ao acessar e utilizar o site da ELETROSTART (www.eletrostart.com.br), você declara ter lido, compreendido e concordado com estes Termos de Uso.",
        "Caso não concorde com qualquer disposição, recomendamos que não utilize nossos serviços.",
        "Reservamo-nos o direito de modificar estes termos a qualquer momento, sendo as alterações publicadas nesta página."
      ]
    },
    {
      id: "servicos",
      title: "2. Descrição dos Serviços",
      icon: ShoppingCart,
      content: [
        "A ELETROSTART é uma empresa especializada em:",
        "• **Venda de materiais elétricos** para uso residencial, comercial e industrial",
        "• **Projetos de energia solar** fotovoltaica",
        "• **Consultoria técnica** em soluções elétricas",
        "Os produtos e serviços estão sujeitos à disponibilidade e às condições descritas em cada oferta."
      ]
    },
    {
      id: "cadastro",
      title: "3. Cadastro e Conta",
      icon: Shield,
      content: [
        "Para realizar compras, você deverá fornecer informações verdadeiras, completas e atualizadas.",
        "**Responsabilidades do usuário:**",
        "• Manter a confidencialidade de sua senha",
        "• Notificar imediatamente sobre uso não autorizado",
        "• Atualizar dados cadastrais quando necessário",
        "A ELETROSTART reserva-se o direito de recusar ou cancelar cadastros que contenham informações falsas."
      ]
    },
    {
      id: "precos",
      title: "4. Preços e Pagamentos",
      icon: CreditCard,
      content: [
        "**Sobre os preços:**",
        "• Os preços são expressos em Reais (R$) e incluem impostos",
        "• Podem ser alterados sem aviso prévio",
        "• Erros de digitação serão corrigidos e comunicados ao cliente",
        "• Promoções têm prazo determinado e estoque limitado",
        "**Formas de pagamento:**",
        "• Cartões de crédito (Visa, Mastercard, Elo)",
        "• PIX com desconto especial",
        "• Boleto bancário (à vista)",
        "• Parcelamento em até 10x sem juros (condições aplicáveis)"
      ]
    },
    {
      id: "entrega",
      title: "5. Entrega e Frete",
      icon: Truck,
      content: [
        "Os prazos de entrega são contados a partir da confirmação do pagamento.",
        "• **Frete grátis** para compras acima de R$ 299,00 (consulte regiões)",
        "• Os prazos podem variar conforme região e disponibilidade",
        "• Entregas são realizadas de segunda a sexta-feira, em horário comercial",
        "• O cliente deve conferir o produto na entrega e reportar avarias imediatamente",
        "Para mais detalhes, consulte nossa página de Prazos de Entrega."
      ]
    },
    {
      id: "trocas",
      title: "6. Trocas e Devoluções",
      icon: RefreshCcw,
      content: [
        "**Direito de arrependimento (Art. 49 CDC):**",
        "• Você pode desistir da compra em até 7 dias após o recebimento",
        "• O produto deve estar lacrado, sem uso e com embalagem original",
        "• O reembolso será integral, incluindo frete pago",
        "**Produtos com defeito:**",
        "• Prazo de 30 dias para produtos não duráveis",
        "• Prazo de 90 dias para produtos duráveis",
        "• A análise técnica determinará reparo, troca ou reembolso",
        "Produtos cortados sob medida (cabos, fios) não são passíveis de troca, exceto por defeito."
      ]
    },
    {
      id: "propriedade",
      title: "7. Propriedade Intelectual",
      icon: Scale,
      content: [
        "Todo o conteúdo do site é protegido por direitos autorais:",
        "• Logotipos, marcas e identidade visual da ELETROSTART",
        "• Textos, imagens, vídeos e descrições de produtos",
        "• Layout, design e programação do site",
        "É proibida a reprodução, distribuição ou uso comercial sem autorização prévia por escrito."
      ]
    },
    {
      id: "responsabilidades",
      title: "8. Limitação de Responsabilidade",
      icon: AlertCircle,
      content: [
        "A ELETROSTART NÃO se responsabiliza por:",
        "• Danos decorrentes de instalações realizadas por profissionais não qualificados",
        "• Uso inadequado dos produtos adquiridos",
        "• Interrupções temporárias do site por manutenção",
        "• Ataques cibernéticos ou eventos de força maior",
        "Recomendamos sempre a contratação de eletricistas certificados para instalações."
      ]
    },
    {
      id: "foro",
      title: "9. Foro e Legislação",
      icon: Scale,
      content: [
        "Estes Termos são regidos pelas leis da República Federativa do Brasil.",
        "Fica eleito o foro da Comarca de **Londrina/PR** para dirimir quaisquer controvérsias.",
        "Em caso de conflito, prevalecerão as disposições do Código de Defesa do Consumidor (Lei nº 8.078/90)."
      ]
    }
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#222998] to-[#1a1f7a] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 border border-white/20 rounded-full"></div>
        </div>
        <div className="layout-container relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <FileText size={40} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                Termos de Uso
              </h1>
              <p className="text-blue-200 mt-2 font-medium">
                Condições Gerais de Utilização
              </p>
            </div>
          </div>
          <p className="text-blue-100 max-w-2xl text-lg">
            Leia atentamente os termos e condições que regem o uso do nosso site e a aquisição de produtos e serviços.
          </p>
        </div>
      </div>

      <div className="layout-container -mt-10 relative z-20">
        {/* Last Update Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-6 md:p-8 mb-8 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <AlertCircle className="text-primary" size={24} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Última atualização</p>
              <p className="font-bold text-gray-900">{lastUpdate}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              Versão 2.0 • Válido a partir da data de publicação
            </p>
          </div>
        </div>

        {/* Alert Box */}
        <div className="bg-secondary/10 border-l-4 border-secondary rounded-2xl p-6 mb-8 flex items-start gap-4">
          <AlertCircle className="text-secondary shrink-0 mt-0.5" size={24} />
          <div>
            <p className="font-bold text-gray-900 mb-1">Importante</p>
            <p className="text-gray-600 text-sm">
              Ao navegar em nosso site e realizar compras, você declara que leu e concorda integralmente com estes Termos de Uso e nossa <Link to="/privacy" className="text-primary font-semibold hover:underline">Política de Privacidade</Link>.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-8 md:p-16">
          {/* Table of Contents */}
          <div className="bg-gray-50 rounded-3xl p-8 mb-12">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Índice</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sections.map((section) => (
                <a 
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors group"
                >
                  <section.icon size={16} className="text-primary" />
                  <span className="group-hover:underline text-sm">{section.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-16">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-32">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary">
                    <section.icon size={24} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">
                    {section.title}
                  </h3>
                </div>
                <div className="pl-14 space-y-3">
                  {section.content.map((paragraph, idx) => (
                    <p 
                      key={idx} 
                      className={`text-gray-600 leading-relaxed ${paragraph.startsWith('•') ? 'pl-4' : ''}`}
                      dangerouslySetInnerHTML={{ 
                        __html: paragraph
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-800">$1</strong>')
                      }}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Help CTA */}
          <div className="mt-16 bg-gray-50 rounded-3xl p-8 md:p-12 text-center">
            <HelpCircle className="mx-auto text-primary mb-4" size={48} />
            <h3 className="text-2xl font-black uppercase mb-4 text-gray-900">Dúvidas?</h3>
            <p className="text-gray-500 mb-8 max-w-xl mx-auto">
              Se você tiver qualquer dúvida sobre estes termos, entre em contato com nossa equipe de atendimento.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/faq"
                className="bg-white text-gray-700 px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-md border border-gray-200"
              >
                Perguntas Frequentes
              </Link>
              <Link 
                to="/contact"
                className="bg-primary text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-800 transition-colors shadow-lg"
              >
                Fale Conosco
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
