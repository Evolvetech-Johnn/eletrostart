import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, DollarSign, ShoppingBag, Users, Package,
  BarChart2, ArrowUpRight, ArrowDownRight, Loader2, AlertCircle,
  RefreshCw, ChevronRight, Clock,
} from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import { executiveService, OverviewKPIs } from '../../services/executiveService';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtNum = (v: number) =>
  new Intl.NumberFormat('pt-BR').format(v);

const KPICard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  growth?: number;
  link?: string;
}> = ({ title, value, subtitle, icon: Icon, color, growth, link }) => {
  const inner = (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg ${
            growth >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
          }`}>
            {growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(growth).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
      <p className="text-sm font-semibold text-gray-500">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );

  return link ? <Link to={link}>{inner}</Link> : <div>{inner}</div>;
};

const ModuleCard: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
  color: string;
}> = ({ title, description, icon: Icon, link, color }) => (
  <Link to={link} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex items-center gap-4">
    <div className={`p-4 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform shrink-0`}>
      <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-0.5 truncate">{description}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
  </Link>
);

const AdminExecutive: React.FC = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery<OverviewKPIs>({
    queryKey: ['executive-overview'],
    queryFn: executiveService.getOverview,
    refetchInterval: 5 * 60 * 1000,
  });

  const modules = [
    { title: 'Análise Financeira', description: 'Receita, margem, crescimento e ticket médio', icon: DollarSign, link: '/admin/executive/financial', color: 'bg-emerald-500' },
    { title: 'Inteligência de Estoque', description: 'Giro, capital parado e produtos sem venda', icon: Package, link: '/admin/executive/inventory', color: 'bg-blue-500' },
    { title: 'Insights de Clientes', description: 'LTV, frequência e taxa de recompra', icon: Users, link: '/admin/executive/customers', color: 'bg-purple-500' },
    { title: 'Análise de Rentabilidade', description: 'Top produtos por receita e volume', icon: BarChart2, link: '/admin/executive/profitability', color: 'bg-orange-500' },
  ];

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#222998] to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Dashboard Executivo</h1>
                <p className="text-sm text-gray-500">Visão estratégica em tempo real</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>Erro ao carregar dados executivos. Verifique se você tem permissão de Super Administrador.</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-[#222998] animate-spin" />
          </div>
        ) : data ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
              <KPICard
                title="Receita Total"
                value={fmt(data.totalRevenue)}
                icon={DollarSign}
                color="bg-emerald-500"
                link="/admin/executive/financial"
              />
              <KPICard
                title="Receita Este Mês"
                value={fmt(data.revenueThisMonth)}
                subtitle={`vs ${fmt(data.revenueLastMonth)} mês anterior`}
                icon={TrendingUp}
                color="bg-blue-500"
                growth={data.revenueGrowthPct}
                link="/admin/executive/financial"
              />
              <KPICard
                title="Ticket Médio"
                value={fmt(data.avgTicket)}
                icon={BarChart2}
                color="bg-purple-500"
              />
              <KPICard
                title="Total de Pedidos"
                value={fmtNum(data.totalOrders)}
                subtitle={`${data.pendingOrders} pendentes`}
                icon={ShoppingBag}
                color="bg-orange-500"
                link="/admin/orders"
              />
              <KPICard
                title="Clientes Únicos"
                value={fmtNum(data.totalCustomers)}
                icon={Users}
                color="bg-pink-500"
                link="/admin/executive/customers"
              />
              <KPICard
                title="Produtos Ativos"
                value={fmtNum(data.totalProducts)}
                icon={Package}
                color="bg-cyan-500"
                link="/admin/executive/inventory"
              />
            </div>

            {/* Pending alert */}
            {data.pendingOrders > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 mb-8">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-amber-800 font-medium">
                  Há <strong>{data.pendingOrders}</strong> pedido{data.pendingOrders > 1 ? 's' : ''} aguardando atenção.{' '}
                  <Link to="/admin/orders" className="underline">Ver pedidos</Link>
                </p>
              </div>
            )}

            {/* Module Cards */}
            <h2 className="text-lg font-bold text-gray-800 mb-4">Módulos Analíticos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((m) => <ModuleCard key={m.link} {...m} />)}
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminExecutive;
