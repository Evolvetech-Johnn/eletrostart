import React from "react";
import { Zap, Home as HomeIcon, Factory, Sun, ChevronRight, ShieldCheck, Cpu, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

const Services = () => {
  const services = [
    {
      title: "Materiais Elétricos",
      description:
        "O maior estoque de materiais elétricos da região. De condutores a automação, oferecemos apenas produtos certificados com garantia total de procedência.",
      icon: <Zap className="w-10 h-10" />,
      color: "bg-primary",
      tags: ["Fios e Cabos", "Disjuntores", "Iluminação LED"],
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Projetos Residenciais",
      description:
        "Engenharia de ponta para sua casa. Planejamos e executamos toda a infraestrutura elétrica focando em segurança, economia e design moderno.",
      icon: <HomeIcon className="w-10 h-10" />,
      color: "bg-[#222998]",
      tags: ["Manutenção", "Quadros Elétricos", "Automação"],
      image: "https://images.unsplash.com/photo-1558444479-c8af551b66b8?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Soluções Industriais",
      description:
        "Infraestrutura pesada para grandes plantas. Montagem de painéis, subestações e manutenção corretiva de alta complexidade para indústrias.",
      icon: <Factory className="w-10 h-10" />,
      color: "bg-secondary",
      tags: ["Motores", "Painéis", "Subestações"],
      image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Energia Solar",
      description:
        "Sustentabilidade que gera lucro. Projetos Turn-Key de energia fotovoltaica, desde a homologação até a instalação completa dos painéis.",
      icon: <Sun className="w-10 h-10" />,
      color: "bg-primary",
      tags: ["Limpa", "Renovável", "Economia 95%"],
      image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=800"
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <div className="relative h-[450px] flex items-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=2069" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#222998] to-transparent" />
        <div className="container mx-auto px-4 relative z-10 text-white">
          <nav className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-[0.3em] mb-6 opacity-60">
            <Link to="/" className="hover:text-secondary transition-colors">Início</Link>
            <span>/</span>
            <span>Serviços</span>
          </nav>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4 leading-none">
            Excelência em<br/>Cada Detalhe
          </h1>
          <p className="text-lg md:text-2xl text-blue-100 max-w-2xl font-light italic opacity-90">
            Engenharia elétrica de precisão e fornecimento de materiais de alta performance para Londrina e região.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-gray-50 rounded-[48px] overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 border border-gray-100"
            >
              <div className="md:w-1/2 relative h-64 md:h-auto overflow-hidden">
                <img 
                  src={service.image} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 ${service.color} mix-blend-multiply opacity-20`} />
              </div>
              <div className="md:w-1/2 p-10 md:p-12 flex flex-col justify-center">
                <div className={`w-16 h-16 ${service.color} text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-4 leading-tight">
                  {service.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  {service.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {service.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-black uppercase tracking-widest bg-white px-2 py-1 rounded text-primary border border-gray-100 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link to="/contact" className="flex items-center space-x-2 text-xs font-black uppercase tracking-[0.2em] text-primary group/link">
                  <span>Saiba Mais</span>
                  <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Highlights */}
      <section className="bg-gray-50 py-32 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="flex flex-col items-center text-center">
              <ShieldCheck size={48} className="text-secondary mb-6" />
              <h4 className="text-lg font-black uppercase text-gray-900 mb-4">Segurança Total</h4>
              <p className="text-gray-500 text-sm leading-relaxed">Todos os nossos materiais e projetos seguem rigorosamente as normas NBR 5410 e legislações vigentes.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Cpu size={48} className="text-primary mb-6" />
              <h4 className="text-lg font-black uppercase text-gray-900 mb-4">Alta Tecnologia</h4>
              <p className="text-gray-500 text-sm leading-relaxed">Implementamos o que há de mais moderno em automação predial e sistemas de eficiência energética.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Lightbulb size={48} className="text-secondary mb-6" />
              <h4 className="text-lg font-black uppercase text-gray-900 mb-4">Suporte Especialista</h4>
              <p className="text-gray-500 text-sm leading-relaxed">Equipe formada por engenheiros e técnicos altamente capacitados para resolver qualquer desafio.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-[#222998] uppercase leading-none mb-12">Pronto para<br/>dar o Próximo Passo?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/contact" className="bg-primary text-white px-12 py-5 rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all">Solicitar Orçamento</Link>
            <Link to="/products" className="bg-white text-primary border-2 border-primary/20 px-12 py-5 rounded-3xl font-black uppercase tracking-widest hover:border-primary transition-all">Ver Catálogo</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
