import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart2, RefreshCw, Loader2, AlertCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AdminLayout from './components/AdminLayout';
import { executiveService, ProfitabilityKPIs } from '../../services/executiveService';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR').format(v);

const PERIOD_OPTIONS = [
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
  { label: '12 meses', days: 365 },
];

const AdminExecutiveProfitability: React.FC = () => {
  const [days, setDays] = useState(30);

  const { data, isLoading, error, refetch, isFetching } = useQuery<{ data: ProfitabilityKPIs }>({
    queryKey: ['executive-profitability', days],
    queryFn: () => executiveService.getProfitability({ days }),
  });

  const kpi = data?.data;

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Análise de Rentabilidade</h1>
              <p className="text-sm text-gray-500">Top produtos por receita e volume</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                onClick={() => setDays(opt.days)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  days === opt.days
                    ? 'bg-[#222998] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button onClick={() => refetch()} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>Erro ao carregar dados de rentabilidade.</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-[#222998] animate-spin" />
          </div>
        ) : kpi ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top por Receita - Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-1">Top 10 por Receita</h2>
                <p className="text-sm text-gray-500 mb-5">Produtos que mais geraram faturamento</p>
                {kpi.topProductsByRevenue.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Nenhuma venda no período</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={kpi.topProductsByRevenue.slice(0, 10)}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        tickFormatter={(v: string) => v.length > 18 ? v.slice(0, 18) + '…' : v}
                      />
                      <Tooltip
                        formatter={(v: number | undefined) => [fmt(v ?? 0), 'Receita']}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                      />
                      <Bar dataKey="revenue" fill="#222998" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Top por Volume - Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-1">Top 10 por Volume</h2>
                <p className="text-sm text-gray-500 mb-5">Produtos mais vendidos em quantidade</p>
                {kpi.topProductsByVolume.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Nenhuma venda no período</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={kpi.topProductsByVolume.slice(0, 10)}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        tickFormatter={(v: string) => v.length > 18 ? v.slice(0, 18) + '…' : v}
                      />
                      <Tooltip
                        formatter={(v: number | undefined) => [`${fmtNum(v ?? 0)} unidades`, 'Quantidade']}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                      />
                      <Bar dataKey="quantitySold" fill="#f97316" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Ranking Table */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Ranking Completo de Produtos</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">#</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Produto</th>
                      <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Qtd. Vendida</th>
                      <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase">Receita</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {kpi.topProductsByRevenue.map((p, i) => (
                      <tr key={p.productId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 text-sm font-bold text-gray-400">{i + 1}</td>
                        <td className="px-6 py-3 font-semibold text-gray-900">{p.name}</td>
                        <td className="px-6 py-3 text-center text-gray-600">{fmtNum(p.quantitySold)}</td>
                        <td className="px-6 py-3 text-right font-bold text-emerald-700">{fmt(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminExecutiveProfitability;
