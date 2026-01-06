import React from "react";
import { User, Settings, Package, Heart, LogOut, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Account = () => {
  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <div className="bg-[#222998] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Minha Conta</h1>
          <p className="text-blue-100 font-medium italic opacity-80">Gerencie seus pedidos, dados e preferências.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden">
              <div className="p-8 bg-gray-50 border-b border-gray-100 flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 uppercase text-xs">Olá, Visitante</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: 000000</p>
                </div>
              </div>
              <nav className="p-4">
                {[
                  { icon: Package, label: "Meus Pedidos", active: true },
                  { icon: Heart, label: "Lista de Desejos" },
                  { icon: User, label: "Dados Pessoais" },
                  { icon: Settings, label: "Configurações" },
                ].map((item, i) => (
                  <button key={i} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${item.active ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                    <div className="flex items-center space-x-3">
                      <item.icon size={18} />
                      <span className="text-sm font-bold uppercase tracking-wider">{item.label}</span>
                    </div>
                    <ChevronRight size={14} className={item.active ? "opacity-100" : "opacity-30"} />
                  </button>
                ))}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <button className="w-full flex items-center space-x-3 p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                    <LogOut size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider">Sair da Conta</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-10 md:p-16 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mx-auto mb-8">
                <Package size={48} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 uppercase mb-4">Você ainda não possui pedidos</h2>
              <p className="text-gray-500 mb-10 max-w-sm mx-auto">Explore nosso catálogo e encontre os melhores materiais elétricos para seu projeto.</p>
              <Link to="/products" className="bg-primary text-white px-10 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 inline-block text-xs">Começar a Comprar</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
