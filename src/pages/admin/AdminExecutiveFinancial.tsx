import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, TrendingUp, TrendingDown, BarChart2,
  Loader2, AlertCircle, RefreshCw, Download, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Bar, Line, Legend,
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

const StatCard: React.FC<{
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
}> = ({ label, value, sub, positive, icon: Icon, bgColor, textColor }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className={`inline-flex p-3 rounded-xl mb-4 ${bgColor}`}>
      <Icon className={`w-5 h-5 ${textColor}`} />
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

  // Calcula % de crescimento mês a mês para a tabela
  const monthlyWithGrowth = (kpi?.revenueByMonth ?? []).map((m, i, arr) => {
    const prev = i > 0 ? arr[i - 1].value : null;
    const growth = prev !== null && prev > 0 ? ((m.value - prev) / prev) * 100 : null;
    // Lucro bruto estimado = receita × margem bruta % (se disponível, senão 0)
    const grossPct = kpi?.grossMarginPct ?? 0;
    const profit = m.value * (grossPct / 100);
    return { ...m, growth, profit };
  });

  // ComposedChart data: junta revenueByDay com lucro estimado
  const composedData = (kpi?.revenueByDay ?? []).map((d) => ({
    date: d.date,
    receita: d.value,
    lucro: d.value * ((kpi?.grossMarginPct ?? 0) / 100),
  }));

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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Análise Financeira</h1>
              <p className="text-sm text-gray-500">Receita, margem e crescimento</p>
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
              className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExport}
              disabled={!kpi}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              CSV
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
              <StatCard
                label="Receita Total"
                value={fmt(kpi.totalRevenue)}
                icon={DollarSign}
                bgColor="bg-emerald-50"
                textColor="text-emerald-600"
              />
              <StatCard
                label="Lucro Bruto"
                value={fmt(kpi.grossProfit)}
                sub={`Margem: ${kpi.grossMarginPct.toFixed(1)}%`}
                positive={kpi.grossMarginPct > 30}
                icon={TrendingUp}
                bgColor="bg-blue-50"
                textColor="text-blue-600"
              />
              <StatCard
                label="Custo Total (Est.)"
                value={fmt(kpi.totalCost)}
                icon={BarChart2}
                bgColor="bg-orange-50"
                textColor="text-orange-600"
              />
              <StatCard
                label="Crescimento"
                value={fmtPct(kpi.growthPct)}
                sub="vs. período anterior"
                positive={kpi.growthPct >= 0}
                icon={kpi.growthPct >= 0 ? TrendingUp : TrendingDown}
                bgColor={kpi.growthPct >= 0 ? 'bg-emerald-50' : 'bg-red-50'}
                textColor={kpi.growthPct >= 0 ? 'text-emerald-600' : 'text-red-600'}
              />
            </div>

            {/* Receita por Dia — Area Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-1">Receita por Dia</h2>
              <p className="text-sm text-gray-500 mb-6">Evolução da receita no período selecionado</p>
              {kpi.revenueByDay.length === 0 ? (
                <p className="text-gray-400 text-center py-12">Nenhuma receita neste período</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={kpi.revenueByDay} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#222998" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#222998" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(v: number | undefined) => [fmt(v ?? 0), 'Receita']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#222998" strokeWidth={2.5} fill="url(#revGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ComposedChart — Receita × Lucro */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-1">Receita × Lucro por Dia</h2>
              <p className="text-sm text-gray-500 mb-6">
                Barras = Receita · Linha = Lucro bruto estimado ({kpi.grossMarginPct.toFixed(1)}% de margem)
              </p>
              {composedData.length === 0 ? (
                <p className="text-gray-400 text-center py-12">Nenhum dado disponível</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={composedData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#222998" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#222998" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(v: number | undefined, name: string | undefined) => [
                        fmt(v ?? 0),
                        name === 'receita' ? 'Receita' : 'Lucro Bruto',
                      ]}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
                          {value === 'receita' ? 'Receita' : 'Lucro Bruto'}
                        </span>
                      )}
                    />
                    <Bar dataKey="receita" fill="url(#barGrad)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                    <Line
                      type="monotone"
                      dataKey="lucro"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={false}
                      strokeDasharray="5 3"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Tabela Mensal com % Crescimento MoM */}
            {monthlyWithGrowth.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                  <h2 className="text-lg font-bold text-gray-800">Receita por Mês</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Crescimento mês a mês (MoM) e lucro bruto estimado</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Mês</th>
                        <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase">Receita</th>
                        <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase">Lucro Bruto</th>
                        <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase">Crescimento MoM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {monthlyWithGrowth.map((m, i) => (
                        <tr key={m.month ?? i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3.5 font-semibold text-gray-900">{m.month}</td>
                          <td className="px-6 py-3.5 text-right font-bold text-gray-900">{fmt(m.value)}</td>
                          <td className="px-6 py-3.5 text-right text-emerald-700 font-semibold">{fmt(m.profit)}</td>
                          <td className="px-6 py-3.5 text-right">
                            {m.growth === null ? (
                              <span className="text-gray-400 text-xs">—</span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full ${
                                m.growth >= 0
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-red-100 text-red-600'
                              }`}>
                                {m.growth >= 0
                                  ? <ArrowUpRight className="w-3 h-3" />
                                  : <ArrowDownRight className="w-3 h-3" />}
                                {fmtPct(m.growth)}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-100">
                      <tr>
                        <td className="px-6 py-3 font-bold text-gray-900">Total</td>
                        <td className="px-6 py-3 text-right font-black text-gray-900">{fmt(kpi.totalRevenue)}</td>
                        <td className="px-6 py-3 text-right font-bold text-emerald-700">{fmt(kpi.grossProfit)}</td>
                        <td className="px-6 py-3 text-right">
                          <span className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full ${
                            kpi.growthPct >= 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {kpi.growthPct >= 0
                              ? <ArrowUpRight className="w-3 h-3" />
                              : <ArrowDownRight className="w-3 h-3" />}
                            {fmtPct(kpi.growthPct)} global
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminExecutiveFinancial;
