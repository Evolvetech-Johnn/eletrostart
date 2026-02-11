import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  ExternalLink,
  ShoppingBag,
  History
} from "lucide-react";

interface SavedOrder {
  id: string;
  date: string;
  total: number;
  items: { name: string; quantity: number; image?: string }[];
  status: string;
}

const Account: React.FC = () => {
  const [orders, setOrders] = useState<SavedOrder[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("my_orders");
    if (saved) {
      try {
        setOrders(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao ler pedidos", e);
      }
    }
  }, []);

  const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "554330295020";

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-primary text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <History size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">
              Meus Pedidos
            </h1>
          </div>
          <p className="text-blue-100 font-medium opacity-80 max-w-lg">
            Acompanhe o histórico das suas solicitações recentes feitas neste dispositivo.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 min-h-[400px]">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
                <ShoppingBag size={48} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-tight">
                Nenhum pedido encontrado
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                Seus pedidos recentes feitos neste dispositivo aparecerão aqui automaticamente após a finalização da compra.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-800 transition-all hover:scale-105 shadow-lg shadow-primary/20"
              >
                Começar a Comprar
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all bg-white group"
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-6 border-b border-gray-50">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-gray-500">ID:</span>
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {order.id}
                        </span>
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-wider">
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm font-medium">
                        <Clock size={14} className="mr-2 text-primary" />
                        {new Date(order.date).toLocaleDateString("pt-BR", {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })} às{" "}
                        {new Date(order.date).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="text-left md:text-right bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wider">Valor Total</p>
                      <p className="text-2xl font-black text-primary">
                        {order.total.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Itens do Pedido</h3>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-12 h-12 bg-white border border-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                           {item.image ? (
                             <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-300">
                               <Package size={20} />
                             </div>
                           )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            Quantidade: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                     <a 
                       href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá, gostaria de falar sobre o pedido ${order.id}`)}`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-sm font-bold text-primary flex items-center hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100"
                     >
                       <span className="mr-2">Falar sobre este pedido</span>
                       <ExternalLink size={16} />
                     </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;