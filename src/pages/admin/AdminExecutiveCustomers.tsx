import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, TrendingUp, DollarSign, RefreshCw, Loader2, AlertCircle,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import AdminLayout from './components/AdminLayout';
import { executiveService, CustomerKPIs } from '../../services/executiveService';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR').format(v);

const PERIOD_OPTIONS = [
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
  { label: '12 meses', days: 365 },
];

const PIE_COLORS = ['#222998', '#a5b4fc'];

const AdminExecutiveCustomers: React.FC = () => {
  const [days, setDays] = useState(30);

  const { data, isLoading, error, refetch, isFetching } = useQuery<{ data: CustomerKPIs }>({
    queryKey: ['executive-customers', days],
    queryFn: () => executiveService.getCustomers({ days }),
  });

  const kpi = data?.data;

  // LTV médio calculado client-side
  const avgLTV =
    kpi && kpi.totalCustomers > 0
      ? kpi.topCustomers.reduce((acc, c) => acc + c.totalSpent, 0) / kpi.totalCustomers
      : 0;

  // Novos vs. Recorrentes
  const recurrentes = kpi
    ? kpi.topCustomers.filter((c) => c.orders > 1).length
    : 0;
  const novos = kpi ? Math.max(kpi.newCustomersThisPeriod - recurrentes, 0) : 0;

  const pieData = [
    { name: 'Recorrentes', value: recurrentes },
    { name: 'Novos', value: novos },
  ].filter((d) => d.value > 0);

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Insights de Clientes</h1>
              <p className="text-sm text-gray-500">LTV, frequência e recompra</p>
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
            <button onClick={() => refetch()} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>Erro ao carregar dados de clientes.</p>
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
                <div className="inline-flex p-3 rounded-xl bg-purple-50 mb-4">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-black text-gray-900">{fmtNum(kpi.totalCustomers)}</p>
                <p className="text-sm font-semibold text-gray-500 mt-1">Clientes Únicos</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="inline-flex p-3 rounded-xl bg-blue-50 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-black text-gray-900">{kpi.avgOrdersPerCustomer.toFixed(1)}</p>
                <p className="text-sm font-semibold text-gray-500 mt-1">Pedidos Médios / Cliente</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="inline-flex p-3 rounded-xl bg-emerald-50 mb-4">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-2xl font-black text-gray-900">{fmt(avgLTV)}</p>
                <p className="text-sm font-semibold text-gray-500 mt-1">LTV Médio</p>
                <p className="text-xs text-gray-400 mt-0.5">Lifetime Value por cliente</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="inline-flex p-3 rounded-xl bg-pink-50 mb-4">
                  <TrendingUp className="w-5 h-5 text-pink-500" />
                </div>
                <p className="text-2xl font-black text-gray-900">{kpi.repurchaseRate.toFixed(1)}%</p>
                <p className="text-sm font-semibold text-gray-500 mt-1">Taxa de Recompra</p>
                <p className="text-xs text-gray-400 mt-0.5">{fmtNum(kpi.newCustomersThisPeriod)} no período</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Pie Chart: Novos vs. Recorrentes */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <h2 className="text-lg font-bold text-gray-800 mb-1">Composição de Clientes</h2>
                <p className="text-sm text-gray-500 mb-4">Novos vs. Recorrentes no período</p>
                {pieData.length === 0 ? (
                  <div className="flex items-center justify-center flex-1 text-gray-400 text-sm py-8">
                    Dados insuficientes
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={((v: number | undefined, name: string | undefined) => [`${fmtNum(v ?? 0)} clientes`, name ?? '']) as any}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                      />
                      <Legend
                        formatter={(value) => (
                          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Top Customers Table */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                  <h2 className="text-lg font-bold text-gray-800">Top Clientes por Faturamento</h2>
                  <p className="text-sm text-gray-500 mt-0.5">com Lifetime Value acumulado</p>
                </div>
                {kpi.topCustomers.length === 0 ? (
                  <p className="text-gray-400 text-center py-12">Nenhum cliente encontrado neste período</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">#</th>
                          <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Cliente</th>
                          <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase hidden md:table-cell">Email</th>
                          <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Pedidos</th>
                          <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase">LTV</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {kpi.topCustomers.map((c, i) => (
                          <tr key={c.email} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-gray-400">{i + 1}</td>
                            <td className="px-6 py-4 font-semibold text-gray-900">{c.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">{c.email}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                c.orders > 1
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {c.orders}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <p className="font-bold text-emerald-700">{fmt(c.totalSpent)}</p>
                              {c.orders > 1 && (
                                <p className="text-xs text-purple-600 font-medium">Recorrente</p>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminExecutiveCustomers;
