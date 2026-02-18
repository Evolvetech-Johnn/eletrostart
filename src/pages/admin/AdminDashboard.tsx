import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  MessageSquare,
  Clock,
  TrendingUp,
  Mail,
  ShoppingBag,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { adminService, DashboardData } from "../../services/adminService";
import AdminLayout from "./components/AdminLayout";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/Button";

const AdminDashboard: React.FC = () => {
  // queryClient removido

  // Query for dashboard data
  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ["admin-dashboard"],
    queryFn: adminService.getDashboard,
    refetchInterval: 60000, // Refresh every minute
  });

  // Sincronização via Discord removida

  const statCards = data
    ? [
        {
          title: "Total de Mensagens",
          value: data.stats?.total || 0,
          icon: MessageSquare,
          color: "bg-blue-500",
          bgColor: "bg-blue-50",
          link: "/admin/messages",
        },
        {
          title: "Novas",
          value: data.stats?.new || 0,
          icon: Mail,
          color: "bg-red-500",
          bgColor: "bg-red-50",
          link: "/admin/messages?status=new",
        },
        {
          title: "Hoje",
          value: data.stats?.today || 0,
          icon: Clock,
          color: "bg-green-500",
          bgColor: "bg-green-50",
          link: "/admin/messages",
        },
        {
          title: "Esta Semana",
          value: data.stats?.thisWeek || 0,
          icon: TrendingUp,
          color: "bg-purple-500",
          bgColor: "bg-purple-50",
          link: "/admin/messages",
        },
        {
          title: "Pedidos",
          value: data.orders?.total || 0,
          icon: ShoppingBag,
          color: "bg-orange-500",
          bgColor: "bg-orange-50",
          link: "/admin/orders",
        },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8 text-blue-600" />
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Visão geral do sistema e estatísticas
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Atualizar dados"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p>Erro ao carregar dados: {(error as Error).message}</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {statCards.map((stat, index) => (
              <Link
                key={index}
                to={stat.link || "#"}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </h3>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}
                  >
                    <stat.icon
                      className={`w-6 h-6 ${stat.color.replace("bg-", "text-")}`}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Atalhos Rápidos</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/admin/messages"
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center justify-center text-center gap-2"
              >
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <span className="font-medium">Ver Mensagens</span>
              </Link>
              <Link
                to="/admin/products"
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center justify-center text-center gap-2"
              >
                <ShoppingBag className="w-6 h-6 text-orange-600" />
                <span className="font-medium">Gerenciar Produtos</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
