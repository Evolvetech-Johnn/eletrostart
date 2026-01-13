import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  User, 
  MessageSquare,
  Clock,
  Tag,
  CheckCircle,
  Archive,
  Loader2,
  AlertCircle,
  ExternalLink,
  Send
} from 'lucide-react';
import { api } from '../../services/api';
import AdminLayout from './components/AdminLayout';

const AdminMessageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        const response = await api.getMessage(id);
        if (response.success) {
          setMessage(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await api.updateMessageStatus(id, newStatus);
      if (response.success) {
        setMessage(response.data);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleArchive = async () => {
    if (confirm('Deseja arquivar esta mensagem?')) {
      await handleStatusChange('ARCHIVED');
    }
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !message) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <AlertCircle size={48} className="text-red-500" />
          <p className="text-gray-600">{error || 'Mensagem não encontrada'}</p>
          <Link 
            to="/admin/messages"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft size={18} />
            Voltar para mensagens
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
          <span className={`text-sm font-bold px-4 py-2 rounded-full border ${getStatusColor(message.status)}`}>
            {getStatusLabel(message.status)}
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <User size={28} className="text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-black text-gray-900">{message.name || 'Sem nome'}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                  {message.email && (
                    <a 
                      href={`mailto:${message.email}`}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Mail size={14} />
                      {message.email}
                    </a>
                  )}
                  {message.phone && (
                    <a 
                      href={`tel:${message.phone.replace(/\D/g, '')}`}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Phone size={14} />
                      {message.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-6">
            {/* Subject */}
            {message.subject && (
              <div className="flex items-start gap-3">
                <Tag size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Assunto</p>
                  <p className="text-gray-900 font-medium">{message.subject}</p>
                </div>
              </div>
            )}

            {/* Message */}
            <div className="flex items-start gap-3">
              <MessageSquare size={18} className="text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Mensagem</p>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{message.message}</p>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-gray-400" />
                <span className="text-gray-500">Recebida em:</span>
                <span className="font-medium text-gray-900">
                  {new Date(message.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Send size={16} className="text-gray-400" />
                <span className="text-gray-500">Discord:</span>
                <span className={`font-medium ${message.discordSent ? 'text-green-600' : 'text-red-600'}`}>
                  {message.discordSent ? 'Enviado ✓' : 'Não enviado'}
                </span>
              </div>
            </div>
          </div>

          {/* Card Footer - Actions */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-3">
            {message.email && (
              <a
                href={`mailto:${message.email}?subject=Re: ${message.subject || 'Contato Eletrostart'}`}
                className="flex items-center gap-2 bg-primary hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold transition-colors"
              >
                <Mail size={18} />
                Responder por E-mail
                <ExternalLink size={14} />
              </a>
            )}
            
            {message.phone && (
              <a
                href={`https://wa.me/55${message.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold transition-colors"
              >
                <Phone size={18} />
                WhatsApp
                <ExternalLink size={14} />
              </a>
            )}

            {message.status !== 'REPLIED' && (
              <button
                onClick={() => handleStatusChange('REPLIED')}
                disabled={updating}
                className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                <CheckCircle size={18} />
                Marcar como Respondida
              </button>
            )}

            {message.status !== 'ARCHIVED' && (
              <button
                onClick={handleArchive}
                disabled={updating}
                className="flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                <Archive size={18} />
                Arquivar
              </button>
            )}
          </div>
        </div>

        {/* ID Info */}
        <div className="text-center text-xs text-gray-400">
          ID: {message.id}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessageDetail;
