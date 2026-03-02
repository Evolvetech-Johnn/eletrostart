import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Package, AlertTriangle, DollarSign, TrendingDown,
  Loader2, AlertCircle, RefreshCw, ArrowUpRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import AdminLayout from './components/AdminLayout';
import { executiveService, InventoryKPIs } from '../../services/executiveService';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR').format(v);

const StockBadge: React.FC<{ stock: number }> = ({ stock }) => {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
        <AlertTriangle className="w-3 h-3" /> SEM ESTOQUE
      </span>
    );
  if (stock <= 5)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
        <AlertTriangle className="w-3 h-3" /> CRÍTICO
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
      OK
    </span>
  );
};

const AdminExecutiveInventory: React.FC = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery<{ data: InventoryKPIs }>({
    queryKey: ['executive-inventory'],
    queryFn: executiveService.getInventory,
    refetchInterval: 10 * 60 * 1000,
  });

  const kpi = data?.data;

  // Capital parado calculado como % do maior valor
  const maxCapital = kpi
    ? Math.max(...kpi.noSalesLast30Days.map((p) => p.price * p.stock), 1)
    : 1;

  // Dados para o gráfico de top por estoque (capital em R$)
  const chartData = kpi
    ? kpi.topByStock.slice(0, 8).map((p) => ({
        name: p.name.length > 16 ? p.name.slice(0, 16) + '…' : p.name,
        stock: p.stock,
      }))
    : [];

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Inteligência de Estoque</h1>
              <p className="text-sm text-gray-500">Capital parado, giro e alertas</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>Erro ao carregar dados de estoque.</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-[#222998] animate-spin" />
          </div>
        ) : kpi ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="inline-flex p-3 rounded-xl bg-blue-50 mb-4">
                  <Package className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-black text-gray-900">{fmtNum(kpi.totalProducts)}</p>
                <p className="text-sm font-semibold text-gray-500 mt-1">Produtos Ativos</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="inline-flex p-3 rounded-xl bg-emerald-50 mb-4">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-2xl font-black text-gray-900">{fmt(kpi.totalStockValue)}</p>
                <p className="text-sm font-semibold text-gray-500 mt-1">Capital em Estoque</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="inline-flex p-3 rounded-xl bg-red-50 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-black text-gray-900">{kpi.outOfStock}</p>
                <p className="text-sm font-semibold text-gray-500 mt-1">Sem Estoque</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="inline-flex p-3 rounded-xl bg-amber-50 mb-4">
                  <TrendingDown className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-2xl font-black text-gray-900">{kpi.lowStock}</p>
                <p className="text-sm font-semibold text-gray-500 mt-1">Estoque Crítico (≤5)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfico: Top por quantidade */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-1">Top Estoque por Quantidade</h2>
                <p className="text-sm text-gray-500 mb-5">Produtos com maior número de unidades</p>
                {chartData.length === 0 ? (
                  <p className="text-gray-400 text-center py-12">Nenhum produto</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={110}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                      />
                      <Tooltip
                        formatter={(v: number | undefined) => [`${fmtNum(v ?? 0)} unidades`, 'Estoque']}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                      />
                      <Bar dataKey="stock" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Capital parado – lista com barra de progresso */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-1">Capital Parado</h2>
                <p className="text-sm text-gray-500 mb-4">Sem venda nos últimos 30 dias</p>
                {kpi.noSalesLast30Days.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
                    <Package className="w-8 h-8 text-gray-200" />
                    <p className="text-sm">✅ Todos os produtos com estoque tiveram vendas recentes</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {kpi.noSalesLast30Days.map((p) => {
                      const capital = p.price * p.stock;
                      const pct = Math.round((capital / maxCapital) * 100);
                      return (
                        <div key={p.id} className="py-3">
                          <div className="flex items-center justify-between gap-4 mb-1.5">
                            <div className="min-w-0 flex items-center gap-2">
                              <StockBadge stock={p.stock} />
                              <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-orange-600">{fmt(capital)}</p>
                              <p className="text-xs text-gray-400">{p.stock} un × {fmt(p.price)}</p>
                            </div>
                          </div>
                          {/* Barra de progresso */}
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-400 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Tabela de Maior Estoque com badges */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Produtos por Quantidade em Estoque</h2>
                  <p className="text-sm text-gray-500">Top 10 com status de disponibilidade</p>
                </div>
                <Link
                  to="/admin/products"
                  className="flex items-center gap-1 text-sm text-[#222998] font-semibold hover:underline"
                >
                  Gerenciar <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {kpi.topByStock.map((p, i) => (
                  <div key={p.id} className="px-6 py-3.5 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="flex-1 font-medium text-gray-900 text-sm truncate">{p.name}</p>
                    <StockBadge stock={p.stock} />
                    <span className="font-bold text-blue-600 shrink-0">{fmtNum(p.stock)} un</span>
                    <Link
                      to="/admin/products"
                      className="text-xs text-gray-400 hover:text-[#222998] font-medium transition-colors shrink-0"
                    >
                      Gerenciar →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminExecutiveInventory;
