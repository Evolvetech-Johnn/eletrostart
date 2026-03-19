import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserPlus, Eye, XCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { customerService } from '../../services/customerService';
import AdminLayout from './components/AdminLayout';

export const AdminCustomers: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search, activeFilter],
    queryFn: () => customerService.getCustomers({ page, limit: 10, search, active: activeFilter }),
  });

  const toggleStatusMut = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => customerService.toggleActive(id, active),
    onSuccess: () => {
      toast.success('Status do cliente atualizado!');
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    }
  });

  return (
    <AdminLayout>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500">Gerencie sua base de clientes (CRM)</p>
        </div>
        
        <Link 
          to="/admin/customers/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <UserPlus size={20} />
          <span>Novo Cliente</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, email, telefone ou doc..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
        >
          <option value="">Todos os Status</option>
          <option value="true">Apenas Ativos</option>
          <option value="false">Apenas Inativos</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                <th className="p-4">Nome / E-mail</th>
                <th className="p-4">Contato / Doc</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">Carregando clientes...</td>
                </tr>
              ) : !data?.data || data.data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">Nenhum cliente encontrado.</td>
                </tr>
              ) : (
                data.data.map((customer: any) => (
                  <tr key={customer.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email || '—'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-900">{customer.phone}</div>
                      <div className="text-sm text-gray-500">{customer.document || '—'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        customer.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {customer.active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {customer.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/customers/${customer.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver Detalhes"
                        >
                          <Eye size={20} />
                        </Link>
                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja realmente ${customer.active ? 'INATIVAR' : 'ATIVAR'} o cliente ${customer.name}?`)) {
                              toggleStatusMut.mutate({ id: customer.id, active: !customer.active });
                            }
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            customer.active 
                              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={customer.active ? 'Inativar Cliente' : 'Ativar Cliente'}
                        >
                          {customer.active ? <XCircle size={20} /> : <CheckCircle size={20} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
            <div>
              Mostrando página {data.meta.page} de {data.meta.totalPages} ({data.meta.total} clientes)
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={page === data.meta.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
