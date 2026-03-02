import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  Clock,
  DollarSign,
  BarChart2,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { adminService, DashboardData } from "../../services/adminService";
import AdminLayout from "./components/AdminLayout";
import { useAuth } from "../../context/AuthContext";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const fmtNum = (v: number) => new Intl.NumberFormat("pt-BR").format(v);

type AnalyticsData = Awaited<ReturnType<typeof adminService.getDashboardAnalytics>>;

const AdminDashboard: React.FC = () => {
  const { loading, isAuthenticated } = useAuth();
  const [days] = useState(30);

  const { data, isLoading: dashLoading, error: dashError, refetch } = useQuery<DashboardData>({
    queryKey: ["admin-dashboard"],
    queryFn: adminService.getDashboard,
    refetchInterval: 60000,
    enabled: !loading && isAuthenticated,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["admin-analytics", days],
    queryFn: () => adminService.getDashboardAnalytics(days),
    enabled: !loading && isAuthenticated,
    refetchInterval: 5 * 60000,
  });

  const totalRevenue = analytics?.revenueByDay.reduce((acc, d) => acc + d.value, 0) ?? 0;
  const isLoading = dashLoading || analyticsLoading;

  const kpiCards = [
    {
      title: "Receita (30d)",
      value: fmt(totalRevenue),
      icon: DollarSign,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      bg: "bg-emerald-50",
      link: "/admin/analytics",
    },
    {
      title: "Ticket Médio",
      value: fmt(analytics?.ticketMedio ?? 0),
      icon: BarChart2,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bg: "bg-blue-50",
      link: "/admin/analytics",
    },
    {
      title: "Pedidos",
      value: fmtNum(data?.orders?.total ?? 0),
      sub: `${data?.orders?.pending ?? 0} pendentes`,
      icon: ShoppingBag,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bg: "bg-orange-50",
      link: "/admin/orders",
    },
    {
      title: "Mensagens Novas",
      value: fmtNum(data?.stats?.new ?? 0),
      sub: `${data?.stats?.today ?? 0} hoje`,
      icon: MessageSquare,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bg: "bg-purple-50",
      link: "/admin/messages",
    },
    {
      title: "Estoque Crítico",
      value: fmtNum(analytics?.lowStockProducts?.length ?? 0),
      sub: "produtos ≤ 5 unidades",
      icon: AlertTriangle,
      color: "bg-red-500",
      textColor: "text-red-600",
      bg: "bg-red-50",
      link: "/admin/executive/inventory",
    },
    {
      title: "Usuários Admin",
      value: fmtNum(data?.users ?? 0),
      icon: Users,
      color: "bg-cyan-500",
      textColor: "text-cyan-600",
      bg: "bg-cyan-50",
      link: "/admin/users",
    },
  ];

  const quickLinks = [
    { label: "Mensagens", to: "/admin/messages", icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pedidos", to: "/admin/orders", icon: ShoppingBag, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Produtos", to: "/admin/products", icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Analytics", to: "/admin/analytics", icon: BarChart2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Executivo", to: "/admin/executive", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Usuários", to: "/admin/users", icon: Users, color: "text-cyan-600", bg: "bg-cyan-50" },
  ];

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#222998] to-blue-600 flex items-center justify-center shadow-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Visão geral do sistema</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>

        {dashError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>Erro ao carregar dados do dashboard.</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-[#222998] animate-spin" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
              {kpiCards.map((card) => (
                <Link
                  key={card.title}
                  to={card.link}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${card.bg} group-hover:scale-110 transition-transform`}>
                      <card.icon className={`w-5 h-5 ${card.textColor}`} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                  <p className="text-2xl font-black text-gray-900">{card.value}</p>
                  <p className="text-sm font-semibold text-gray-500 mt-1">{card.title}</p>
                  {card.sub && <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>}
                </Link>
              ))}
            </div>

            {/* Pending Orders Alert */}
            {(data?.orders?.pending ?? 0) > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 mb-8">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-amber-800 font-medium">
                  Há <strong>{data?.orders?.pending}</strong> pedido{(data?.orders?.pending ?? 0) > 1 ? "s" : ""} aguardando atenção.{" "}
                  <Link to="/admin/orders" className="underline font-bold">Ver pedidos →</Link>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Receita por Dia</h2>
                    <p className="text-sm text-gray-500">Últimos 30 dias</p>
                  </div>
                  <Link to="/admin/analytics" className="text-sm text-[#222998] font-semibold hover:underline flex items-center gap-1">
                    Ver analytics <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                {(analytics?.revenueByDay?.length ?? 0) === 0 ? (
                  <div className="flex items-center justify-center h-48 text-gray-400">
                    <p>Nenhuma receita neste período</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={analytics?.revenueByDay ?? []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dashRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#222998" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#222998" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        tickFormatter={(v) => v.slice(5)}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(v: number | undefined) => [fmt(v ?? 0), "Receita"]}
                        contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#222998"
                        strokeWidth={2.5}
                        fill="url(#dashRevGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Low Stock Alerts */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Estoque Crítico</h2>
                    <p className="text-sm text-gray-500">Produtos ≤ 5 unidades</p>
                  </div>
                  <Link to="/admin/executive/inventory" className="text-xs text-[#222998] font-semibold hover:underline">
                    Ver tudo →
                  </Link>
                </div>
                {(analytics?.lowStockProducts?.length ?? 0) === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
                    <Package className="w-8 h-8 text-gray-200" />
                    <p className="text-sm">Nenhum produto crítico</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-56 overflow-y-auto">
                    {(analytics?.lowStockProducts ?? []).slice(0, 8).map((p) => (
                      <div key={p.id} className="py-2.5 flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                        <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                          p.stock === 0
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {p.stock === 0 ? "Sem estoque" : `${p.stock} un`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Selling Products */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Top Produtos Vendidos</h2>
                    <p className="text-sm text-gray-500">Últimos 30 dias</p>
                  </div>
                  <Link to="/admin/executive/profitability" className="text-xs text-[#222998] font-semibold hover:underline">
                    Ver análise →
                  </Link>
                </div>
                {(analytics?.topSellingProducts?.length ?? 0) === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                    Nenhuma venda no período
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {(analytics?.topSellingProducts ?? []).slice(0, 5).map((p, i) => (
                      <div key={p.productId} className="px-6 py-3.5 flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <p className="flex-1 text-sm font-semibold text-gray-900 truncate">
                          {p.name ?? "Produto"}
                        </p>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-emerald-700">{fmt(p.revenue)}</p>
                          <p className="text-xs text-gray-400">{fmtNum(p.quantity)} vendidos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Atalhos Rápidos</h2>
                <div className="grid grid-cols-3 gap-3">
                  {quickLinks.map((ql) => (
                    <Link
                      key={ql.to}
                      to={ql.to}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl hover:shadow-sm border border-gray-100 hover:border-gray-200 transition-all group"
                    >
                      <div className={`p-2.5 rounded-xl ${ql.bg} group-hover:scale-110 transition-transform`}>
                        <ql.icon className={`w-5 h-5 ${ql.color}`} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 text-center">{ql.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
