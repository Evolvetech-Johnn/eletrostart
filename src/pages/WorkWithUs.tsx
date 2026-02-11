import React from "react";
import { Briefcase, Send, Users, Star } from "lucide-react";

const WorkWithUs: React.FC = () => {
  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <div className="bg-[#222998] text-white py-20 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Briefcase size={400} />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
            Trabalhe Conosco
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-xl mx-auto font-medium italic">
            Venha fazer parte de uma equipe que impulsiona a energia solar no
            Brasil.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-20">
          <div>
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">
              Carreira Eletrostart
            </h2>
            <h3 className="text-3xl font-black text-gray-900 uppercase mb-8 leading-tight">
              Por que trabalhar aqui?
            </h3>
            <div className="space-y-6">
              {[
                {
                  icon: Users,
                  title: "Ambiente Colaborativo",
                  text: "Trabalhamos em equipe para superar desafios complexos.",
                },
                {
                  icon: Star,
                  title: "Crescimento Constante",
                  text: "Investimos em treinamentos e desenvolvimento profissional.",
                },
                {
                  icon: Star,
                  title: "Inovação",
                  text: "Sempre na vanguarda das tecnologias de energia renovável.",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 uppercase text-xs mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-500">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl shadow-blue-900/5">
            <h3 className="text-xl font-black text-gray-900 uppercase mb-6 tracking-tight">
              Envie seu Currículo
            </h3>
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Nome Completo
                </label>
                <input
                  type="text"
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  E-mail
                </label>
                <input
                  type="email"
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Área de Interesse
                </label>
                <select className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold text-gray-600 appearance-none">
                  <option>Vendas Técnicas</option>
                  <option>Engenharia</option>
                  <option>Logística</option>
                  <option>Administrativo</option>
                </select>
              </div>
              <button className="w-full bg-secondary text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-500/20 flex items-center justify-center space-x-3 hover:scale-[1.02]">
                <Send size={18} />
                <span>Enviar Candidatura</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkWithUs;
