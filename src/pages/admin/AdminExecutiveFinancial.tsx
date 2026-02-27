import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, TrendingUp, TrendingDown, BarChart2,
  Loader2, AlertCircle, RefreshCw, Download,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import AdminLayout from './components/AdminLayout';
import { executiveService, FinancialKPIs } from '../../services/executiveService';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtPct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

const PERIOD_OPTIONS = [
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
  { label: '12 meses', days: 365 },
];

const StatCard: React.FC<{ label: string; value: string; sub?: string; positive?: boolean; icon: React.ElementType; color: string }> = ({
  label, value, sub, positive, icon: Icon, color,
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className={`inline-flex p-3 rounded-xl mb-4 ${color} bg-opacity-10`}>
      <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
    </div>
    <p className="text-2xl font-black text-gray-900">{value}</p>
    <p className="text-sm font-semibold text-gray-500 mt-1">{label}</p>
    {sub && (
      <p className={`text-xs mt-1 font-medium ${
        positive === undefined ? 'text-gray-400' : positive ? 'text-emerald-600' : 'text-red-600'
      }`}>{sub}</p>
    )}
  </div>
);

const AdminExecutiveFinancial: React.FC = () => {
  const [days, setDays] = useState(30);

  const { data, isLoading, error, refetch, isFetching } = useQuery<{ data: FinancialKPIs }>({
    queryKey: ['executive-financial', days],
    queryFn: () => executiveService.getFinancial({ days }),
  });

  const kpi = data?.data;

  const handleExport = () => {
    if (!kpi) return;
    const rows = [
      ['Data', 'Receita (R$)'],
      ...kpi.revenueByDay.map((r) => [r.date, r.value.toFixed(2)]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro_${days}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Análise Financeira</h1>
                <p className="text-sm text-gray-500">Receita, margem e crescimento</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
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
            <button
              onClick={() => refetch()}
              className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExport}
              disabled={!kpi}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>Erro ao carregar dados financeiros.</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-[#222998] animate-spin" />
          </div>
        ) : kpi ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
              <StatCard label="Receita Total" value={fmt(kpi.totalRevenue)} icon={DollarSign} color="bg-emerald-500" />
              <StatCard
                label="Lucro Bruto"
                value={fmt(kpi.grossProfit)}
                sub={`Margem: ${kpi.grossMarginPct.toFixed(1)}%`}
                positive={kpi.grossMarginPct > 30}
                icon={TrendingUp}
                color="bg-blue-500"
              />
              <StatCard label="Custo Total (Est.)" value={fmt(kpi.totalCost)} icon={BarChart2} color="bg-orange-500" />
              <StatCard
                label="Crescimento"
                value={fmtPct(kpi.growthPct)}
                sub="vs. período anterior"
                positive={kpi.growthPct >= 0}
                icon={kpi.growthPct >= 0 ? TrendingUp : TrendingDown}
                color={kpi.growthPct >= 0 ? 'bg-emerald-500' : 'bg-red-500'}
              />
            </div>

            {/* Revenue Area Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Receita por Dia</h2>
              {kpi.revenueByDay.length === 0 ? (
                <p className="text-gray-400 text-center py-12">Nenhuma receita neste período</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={kpi.revenueByDay} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#222998" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#222998" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(v: number | undefined) => [fmt(v ?? 0), 'Receita']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#222998"
                      strokeWidth={2.5}
                      fill="url(#revGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Monthly Bar Chart */}
            {kpi.revenueByMonth.length > 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-6">Receita por Mês</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={kpi.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(v: number | undefined) => [fmt(v ?? 0), 'Receita']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                    />
                    <Bar dataKey="value" fill="#222998" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminExecutiveFinancial;
