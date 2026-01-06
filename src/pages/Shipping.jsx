import React from "react";
import { Truck, Clock, Package, MapPin } from "lucide-react";

const Shipping = () => {
  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <div className="bg-[#222998] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none">Prazos e Entrega</h1>
          <p className="text-blue-100 font-medium italic opacity-80">Logística eficiente para garantir sua obra no prazo.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-8 md:p-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 border-b border-gray-50 pb-20">
            {[
              { icon: Truck, title: "Frota Própria", text: "Entregas em Londrina e toda a região metropolitana." },
              { icon: Clock, title: "Agilidade", text: "Postagem em até 24h úteis para produtos em estoque." },
              { icon: Package, title: "Segurança", text: "Embalagens reforçadas para componentes frágeis." },
              { icon: MapPin, title: "Rastreio", text: "Acompanhamento em tempo real do seu pedido." },
            ].map((item, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="bg-primary/10 p-4 rounded-2xl text-primary w-fit mx-auto md:mx-0 mb-6 group-hover:bg-primary transition-all">
                  <item.icon size={28} />
                </div>
                <h4 className="font-black text-gray-900 uppercase text-xs mb-3 tracking-widest">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="max-w-4xl space-y-12">
            <section>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-6">Custos de Frete</h3>
              <p className="text-gray-600 leading-relaxed">O valor do frete é calculado automaticamente com base no peso, volume dos produtos e endereço de entrega. Oferecemos **Frete Grátis para Londrina** em compras acima de R$ 299,00.</p>
            </section>
            
            <section>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-6">Acompanhamento</h3>
              <p className="text-gray-600 leading-relaxed">Assim que sua mercadoria for despachada, você receberá um e-mail com o link de rastreamento. Caso a entrega seja realizada pela nossa frota, nossa equipe de logística entrará em contato para agendar o melhor horário.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
