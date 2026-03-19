import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Save, ShoppingBag, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { customerService, Customer } from '../../services/customerService';
import AdminLayout from './components/AdminLayout';

export const AdminCustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id || id === 'new';

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    document: '',
    notes: '',
    active: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: async () => {
      if (isNew) return null;
      const res = await customerService.getCustomerById(id!);
      setFormData({
        name: res.data.customer.name,
        email: res.data.customer.email || '',
        phone: res.data.customer.phone,
        document: res.data.customer.document || '',
        notes: res.data.customer.notes || '',
        active: res.data.customer.active,
      });
      return res.data;
    },
    enabled: !isNew,
  });

  const saveMut = useMutation({
    mutationFn: (data: Partial<Customer>) => 
      isNew ? customerService.createCustomer(data) : customerService.updateCustomer(id!, data),
    onSuccess: () => {
      toast.success(isNew ? 'Cliente cadastrado!' : 'Cliente atualizado!');
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      if (isNew) navigate('/admin/customers');
    },
    onError: () => {
      toast.error('Erro ao salvar cliente');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMut.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Carregando dados...</div>;

  return (
    <AdminLayout>
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/customers" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? 'Novo Cliente' : data?.customer.name}
            </h1>
            <p className="text-gray-500">{isNew ? 'Adicione um novo contato ao CRM' : 'Visualizando perfil e histórico'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário do Cliente */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados Principais</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input
                  required
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                <input
                  required
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Documento (CPF/CNPJ)</label>
                <input
                  name="document"
                  value={formData.document || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {!isNew && (
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData(p => ({ ...p, active: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">Cliente Ativo no Sistema</label>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações Internas (Admin)</label>
                <textarea
                  name="notes"
                  rows={4}
                  value={formData.notes || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50"
                  placeholder="Anotações sobre este cliente..."
                />
              </div>

              <button
                type="submit"
                disabled={saveMut.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70 mt-6"
              >
                <Save size={20} />
                <span>{saveMut.isPending ? 'Salvando...' : 'Salvar Dados'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Histórico de Compras (Apenas se não for novo) */}
        {!isNew && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Histórico de Pedidos</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-sm font-semibold text-gray-500">
                      <th className="pb-3 px-2">Data</th>
                      <th className="pb-3 px-2">Código</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data?.orders || data.orders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400">
                          <Package className="mx-auto mb-2 opacity-50" size={32} />
                          Nenhum pedido atrelado a este cliente ainda.
                        </td>
                      </tr>
                    ) : (
                      data.orders.map((order: any) => (
                        <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2 text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2">
                            <Link to={`/admin/ecommerce/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                              {order.id.slice(-6).toUpperCase()}
                            </Link>
                          </td>
                          <td className="py-3 px-2">
                            <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right font-medium text-gray-900 text-sm">
                            R$ {order.total.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminCustomerDetail;
