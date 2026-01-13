import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  MessageSquare, 
  Search, 
  Filter,
  Eye,
  Mail,
  Phone,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Inbox
} from 'lucide-react';
import { api } from '../../services/api';
import AdminLayout from './components/AdminLayout';

const AdminMessages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentStatus = searchParams.get('status') || '';

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 15
      };
      if (currentStatus) params.status = currentStatus;
      if (searchQuery) params.search = searchQuery;

      const response = await api.getMessages(params);
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [currentPage, currentStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
    fetchMessages();
  };

  const handleStatusFilter = (status) => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  const getStatusColor = (status) => {
    const colors = {
      NEW: 'bg-red-100 text-red-700 border-red-200',
      READ: 'bg-blue-100 text-blue-700 border-blue-200',
      REPLIED: 'bg-green-100 text-green-700 border-green-200',
      ARCHIVED: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[status] || colors.NEW;
  };

  const getStatusLabel = (status) => {
    const labels = {
      NEW: 'Nova',
      READ: 'Lida',
      REPLIED: 'Respondida',
      ARCHIVED: 'Arquivada'
    };
    return labels[status] || status;
  };

  const statusFilters = [
    { value: '', label: 'Todas' },
    { value: 'NEW', label: 'Novas' },
    { value: 'READ', label: 'Lidas' },
    { value: 'REPLIED', label: 'Respondidas' },
    { value: 'ARCHIVED', label: 'Arquivadas' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wider flex items-center gap-3">
              <MessageSquare size={28} className="text-primary" />
              Mensagens
            </h1>
            <p className="text-gray-500 mt-1">Gerencie as mensagens de contato</p>
          </div>
          <button 
            onClick={fetchMessages}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            Atualizar
          </button>
        </div>

        {/* Stats Bar */}
        {data?.stats && (
          <div className="flex flex-wrap gap-3">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${
                  currentStatus === filter.value
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {filter.label}
                {filter.value && data.stats[filter.value.toLowerCase()] !== undefined && (
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {data.stats[filter.value.toLowerCase()]}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, e-mail, assunto..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-bold transition-colors"
          >
            Buscar
          </button>
        </form>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={40} className="animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertCircle size={48} className="text-red-500" />
            <p className="text-gray-600">{error}</p>
          </div>
        ) : data?.messages?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-2xl border border-gray-100">
            <Inbox size={48} className="text-gray-300" />
            <p className="text-gray-500">Nenhuma mensagem encontrada</p>
          </div>
        ) : (
          <>
            {/* Messages List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {data?.messages?.map((msg) => (
                  <Link 
                    key={msg.id}
                    to={`/admin/messages/${msg.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.status === 'NEW' ? 'bg-red-100' : 'bg-primary/10'
                    }`}>
                      <Mail size={20} className={msg.status === 'NEW' ? 'text-red-600' : 'text-primary'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 truncate">{msg.name || 'Sem nome'}</p>
                        {msg.status === 'NEW' && (
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{msg.subject || 'Sem assunto'}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        {msg.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {msg.email}
                          </span>
                        )}
                        {msg.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} />
                            {msg.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(msg.status)}`}>
                        {getStatusLabel(msg.status)}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(msg.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <Eye size={18} className="text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="px-4 py-2 font-bold text-gray-600">
                  Página {currentPage} de {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === data.pagination.totalPages}
                  className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
