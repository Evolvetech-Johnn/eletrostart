import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, Loader2, AlertCircle } from "lucide-react";
import AdminLayout from "./components/AdminLayout";
import { adminService } from "../../services/adminService";
import { Select } from "../../components/ui/Select";
import { useAuth } from "../../context/AuthContext";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

type AnalyticsData = Awaited<
  ReturnType<typeof adminService.getDashboardAnalytics>
>;

const AdminAnalytics: React.FC = () => {
  const [days, setDays] = useState(30);
  const { loading, isAuthenticated } = useAuth();

  const { data, isLoading, isError, isFetching } = useQuery<AnalyticsData>({
    queryKey: ["admin-analytics", days],
    queryFn: () => adminService.getDashboardAnalytics(days),
    enabled: !loading && isAuthenticated,
  });

  const handleChangePeriod = (value: string) => {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      setDays(parsed);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-primary" />
              Analytics de Vendas
            </h1>
            <p className="text-sm text-gray-500">
              Visão consolidada de vendas, receita e operações.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={String(days)}
              onChange={(e) =>
                handleChangePeriod((e.target as HTMLSelectElement).value)
              }
              options={[
                { label: "Últimos 30 dias", value: "30" },
                { label: "Últimos 60 dias", value: "60" },
                { label: "Últimos 90 dias", value: "90" },
              ]}
            />
            {isFetching && (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                  <div className="h-40 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((__, j) => (
                      <div key={j} className="h-3 bg-gray-200 rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : isError || !data ? (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            Erro ao carregar dados de analytics.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500">
                  Ticket médio
                </p>
                <p className="text-2xl font-bold mt-2">
                  {data.ticketMedio.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500">
                  Pedidos pendentes
                </p>
                <p className="text-2xl font-bold mt-2">{data.pendingOrders}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500">
                  Vendas no período
                </p>
                <p className="text-2xl font-bold mt-2">
                  {data.salesByDay.reduce((acc, item) => acc + item.count, 0)}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500">
                  Receita no período
                </p>
                <p className="text-2xl font-bold mt-2">
                  {data.revenueByDay
                    .reduce((acc, item) => acc + item.value, 0)
                    .toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800 mb-4">
                  Vendas por dia
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.salesByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                          })
                        }
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip
                        labelFormatter={(value) =>
                          new Date(value).toLocaleDateString("pt-BR")
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800 mb-4">
                  Mensagens por status
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.messagesByStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="status"
                        tick={{ fontSize: 10 }}
                        interval={0}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#0ea5e9"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800 mb-4">
                  Produtos com estoque baixo
                </h2>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {data.lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="text-gray-800 font-medium">
                          {product.name}
                        </span>
                        <span className="text-gray-500">
                          {product.sku || "Sem SKU"}
                        </span>
                      </div>
                      <span className="font-semibold text-red-600">
                        {product.stock}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800 mb-4">
                  Produtos mais vendidos
                </h2>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {data.topSellingProducts.map((p) => (
                    <div
                      key={p.productId}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="text-gray-800 font-medium">
                          {p.name || "Produto"}
                        </span>
                        <span className="text-gray-500">
                          {p.quantity} unid.
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {p.revenue.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
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

export default AdminAnalytics;
