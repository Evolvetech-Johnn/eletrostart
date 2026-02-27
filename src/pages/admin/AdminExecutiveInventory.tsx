import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Package, AlertTriangle, DollarSign, TrendingDown,
  Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import { executiveService, InventoryKPIs } from '../../services/executiveService';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR').format(v);

const AdminExecutiveInventory: React.FC = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery<{ data: InventoryKPIs }>({
    queryKey: ['executive-inventory'],
    queryFn: executiveService.getInventory,
    refetchInterval: 10 * 60 * 1000,
  });

  const kpi = data?.data;

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Produtos sem venda */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-1">Sem Venda nos Últimos 30 Dias</h2>
                <p className="text-sm text-gray-500 mb-4">Capital parado em estoque</p>
                {kpi.noSalesLast30Days.length === 0 ? (
                  <p className="text-gray-400 text-sm py-4 text-center">✅ Todos os produtos com estoque tiveram vendas recentes</p>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                    {kpi.noSalesLast30Days.map((p) => (
                      <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.stock} unidades em estoque</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-orange-600">{fmt(p.price * p.stock)}</p>
                          <p className="text-xs text-gray-400">capital parado</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top por estoque */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-1">Maior Estoque</h2>
                <p className="text-sm text-gray-500 mb-4">Top 10 produtos por quantidade</p>
                <div className="divide-y divide-gray-50">
                  {kpi.topByStock.map((p, i) => (
                    <div key={p.id} className="py-3 flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="flex-1 font-medium text-gray-900 text-sm truncate">{p.name}</p>
                      <span className="font-bold text-blue-600 shrink-0">{fmtNum(p.stock)} un</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminExecutiveInventory;
