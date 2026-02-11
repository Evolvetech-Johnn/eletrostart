import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Clock,
  TrendingUp,
  Mail,
  Eye,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Gamepad2,
  ShoppingBag,
} from "lucide-react";
import { api } from "../../services/api";
import AdminLayout from "./components/AdminLayout";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await api.syncMessages();
      if (response.success) {
        await fetchDashboard();
      } else {
        // Se houver erro, mostramos um alerta mas não crashamos a tela
        console.error("Erro na sincronização:", response.message);
        // Opcional: mostrar toast/alerta
      }
    } catch (err) {
      console.error("Erro ao sincronizar:", err);
    } finally {
      setSyncing(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.getDashboard();
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const statCards = data
    ? [
        {
          title: "Total de Mensagens",
          value: data.stats.total,
          icon: MessageSquare,
          color: "bg-blue-500",
          bgColor: "bg-blue-50",
        },
        {
          title: "Novas",
          value: data.stats.new,
          icon: Mail,
          color: "bg-red-500",
          bgColor: "bg-red-50",
        },
        {
          title: "Hoje",
          value: data.stats.today,
          icon: Clock,
          color: "bg-green-500",
          bgColor: "bg-green-50",
        },
        {
          title: "Esta Semana",
          value: data.stats.thisWeek,
          icon: TrendingUp,
          color: "bg-purple-500",
          bgColor: "bg-purple-50",
        },
      ]
    : [];

  const getStatusColor = (status) => {
    const colors = {
      NEW: "bg-red-100 text-red-700",
      READ: "bg-blue-100 text-blue-700",
      REPLIED: "bg-green-100 text-green-700",
      ARCHIVED: "bg-gray-100 text-gray-700",
    };
    return colors[status] || colors.NEW;
  };

  const getStatusLabel = (status) => {
    const labels = {
      NEW: "Nova",
      READ: "Lida",
      REPLIED: "Respondida",
      ARCHIVED: "Arquivada",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <AlertCircle size={48} className="text-red-500" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg"
          >
            <RefreshCw size={18} />
            Tentar novamente
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wider flex items-center gap-3">
              <LayoutDashboard size={28} className="text-primary" />
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Visão geral das mensagens de contato
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Gamepad2 size={18} />
              )}
              {syncing ? "Sincronizando..." : "Sincronizar Discord"}
            </button>
            <button
              onClick={fetchDashboard}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw size={18} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const linkTo =
              stat.title === "Novas"
                ? "/admin/messages?status=NEW"
                : "/admin/messages";

            return (
              <Link
                to={linkTo}
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon
                      size={24}
                      className={stat.color.replace("bg-", "text-")}
                    />
                  </div>
                </div>
                <p className="text-3xl font-black text-gray-900">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mt-1">
                  {stat.title}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">
              Mensagens Recentes
            </h2>
            <Link
              to="/admin/messages"
              className="flex items-center gap-2 text-primary hover:text-blue-800 font-bold text-sm"
            >
              Ver todas
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {data?.recentMessages?.length > 0 ? (
              data.recentMessages.map((msg) => (
                <Link
                  key={msg.id}
                  to={`/admin/messages/${msg.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 relative">
                    <Mail size={18} className="text-primary" />
                    {(msg.source === "discord_sync" || msg.discordSent) && (
                      <div
                        className="absolute -bottom-1 -right-1 bg-[#5865F2] rounded-full p-0.5 border-2 border-white"
                        title="Via Discord"
                      >
                        <Gamepad2 size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {msg.name || "Sem nome"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {msg.subject || msg.email || "Sem assunto"}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(
                      msg.status
                    )}`}
                  >
                    {getStatusLabel(msg.status)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  <Eye size={16} className="text-gray-400" />
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Nenhuma mensagem ainda
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
