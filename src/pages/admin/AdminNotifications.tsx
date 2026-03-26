import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, Notification } from '../../services/notificationService';
import AdminLayout from './components/AdminLayout';
import { Bell, Check, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const AdminNotifications: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications({ limit: 50 }),
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['orders-summary'] });
    }
  });

  const handleMarkAsRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" /> Central de Notificações
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Acompanhe alertas operacionais e atualizações de pedidos
            </p>
          </div>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
            className="text-xs font-bold text-primary hover:underline"
          >
            ATUALIZAR
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-xl flex items-center gap-2 text-red-600">
            <AlertCircle size={20} /> Erro ao carregar notificações.
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-sm">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma notificação encontrada.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif: Notification) => (
              <div 
                key={notif.id} 
                className={`bg-white p-5 rounded-2xl border transition-all ${
                  !notif.read ? 'border-primary/30 shadow-md shadow-primary/5' : 'border-gray-100 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getPriorityColor(notif.priority)}`}>
                        {notif.priority}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{notif.type}</span>
                      <span className="text-[10px] text-gray-400">
                        {format(new Date(notif.createdAt), "dd MMM, HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{notif.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    
                    {notif.orderId && (
                      <div className="mt-4 flex items-center gap-3">
                        <Link 
                          to={`/admin/orders/${notif.orderId}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                          <ExternalLink size={12} /> VER PEDIDO
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  {!notif.read && (
                    <button 
                      onClick={() => handleMarkAsRead(notif.id)}
                      disabled={markReadMutation.isPending}
                      className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-primary/10 hover:text-primary transition-colors"
                      title="Marcar como lida"
                    >
                      <Check size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
