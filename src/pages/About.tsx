import { Link } from "react-router-dom";
import { CheckCircle, Award, Users, Clock, Zap, Target, Eye, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="bg-white pb-20">
      {/* Hero Header */}
      <div className="relative h-[400px] flex items-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=2070" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
        <div className="container mx-auto px-4 relative z-10 text-white">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
            Nossa<br/>História
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-xl font-medium italic">
            Iluminando caminhos e impulsionando o progresso através de soluções elétricas de excelência.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row gap-16 mb-32 items-center">
          <div className="lg:w-1/2">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=1000" 
                className="rounded-3xl shadow-2xl relative z-10"
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary rounded-2xl -z-10 animate-pulse" />
              <div className="absolute -top-6 -left-6 w-48 h-48 border-8 border-primary/10 rounded-3xl -z-10" />
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Sobre a Eletrostart</h2>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 uppercase mb-8 leading-tight">Compromisso com a qualidade e excelência</h3>
            
            <div className="space-y-8">
              <p className="text-gray-600 leading-relaxed text-lg">
                A <strong>Eletrostart</strong> nasceu com a missão de ser mais do que apenas um comércio de materiais elétricos. Nosso foco é prover segurança e eficiência através de componentes de alta performance, atendendo às necessidades de residências, comércios e indústrias.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 uppercase text-xs mb-1">Especialização</h4>
                    <p className="text-sm text-gray-500">Líderes em materiais elétricos residenciais e industriais.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 uppercase text-xs mb-1">Agilidade</h4>
                    <p className="text-sm text-gray-500">Logística otimizada para entregas em Londrina e toda região.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="bg-gray-50 rounded-[40px] px-8 py-20 md:p-20 mb-32 relative overflow-hidden">
          <div className="absolute right-0 top-0 text-primary/5 -mr-20 -mt-20">
            <Zap size={400} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="bg-white p-5 rounded-2xl shadow-sm text-secondary mb-6">
                <Target size={32} />
              </div>
              <h3 className="text-xl font-black uppercase text-gray-900 mb-4 tracking-wider">Missão</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Prover soluções elétricas e de energia solar com excelência, segurança e sustentabilidade, superando as expectativas de nossos clientes.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-white p-5 rounded-2xl shadow-sm text-primary mb-6">
                <Eye size={32} />
              </div>
              <h3 className="text-xl font-black uppercase text-gray-900 mb-4 tracking-wider">Visão</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Ser a referência número um no Sul do país em fornecimento de tecnologia elétrica e implementação de energia renovável.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-white p-5 rounded-2xl shadow-sm text-secondary mb-6">
                <Heart size={32} />
              </div>
              <h3 className="text-xl font-black uppercase text-gray-900 mb-4 tracking-wider">Valores</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Ética inabalável, inovação contínua, responsabilidade socioambiental e um compromisso profundo com o sucesso do cliente.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Users, label: "Clientes Satisfeitos", value: "10k+" },
            { icon: Award, label: "Excelência", value: "100%" },
            { icon: Zap, label: "Projetos Realizados", value: "500+" },
            { icon: Clock, label: "Entregas Realizadas", value: "50k+" },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="inline-block p-4 bg-gray-50 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all mb-4">
                <stat.icon size={28} />
              </div>
              <p className="text-4xl font-black text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team CTA */}
      <section className="bg-[#222998] py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase mb-8 leading-tight">Vamos construir seu<br/> projeto juntos?</h2>
          <Link to="/contact" className="bg-secondary text-white px-10 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/20 inline-block">Fale com um Especialista</Link>
        </div>
      </section>
    </div>
  );
};

export default About;
