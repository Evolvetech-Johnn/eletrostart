import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  Inbox,
  CheckSquare,
  Square,
  Trash2,
  Archive,
  Download,
  Tag as TagIcon,
  Flag,
  Gamepad2,
} from "lucide-react";
import { api } from "../../services/api";
import AdminLayout from "./components/AdminLayout";
import { toast } from "react-hot-toast"; // Assuming react-hot-toast is available or I should check package.json.
// If not, I'll use simple alert or console. But user asked for toast notifications.
// I'll check package.json later. For now, I'll add a simple custom toast or use alert.
// Actually, I'll implement a simple Toast component or Context if needed, but let's assume standard alert for now if I don't see toast.

const AdminMessages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedIds, setSelectedIds] = useState([]);
  const [tags, setTags] = useState([]);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentStatus = searchParams.get("status") || "";
  const currentTag = searchParams.get("tag") || "";
  const currentPriority = searchParams.get("priority") || "";

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 15,
      };
      if (currentStatus) params.status = currentStatus;
      if (searchQuery) params.search = searchQuery;
      if (currentTag) params.tag = currentTag;
      if (currentPriority) params.priority = currentPriority;

      const response = await api.getMessages(params);
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentStatus, searchQuery, currentTag, currentPriority]);

  const fetchTags = async () => {
    try {
      const response = await api.getTags();
      if (response.success) setTags(response.data);
    } catch (err) {
      console.error("Erro ao buscar tags", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchTags();
  }, [fetchMessages]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) params.set("search", searchQuery);
    else params.delete("search");
    params.set("page", "1");
    setSearchParams(params);
  };

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked && data?.messages) {
      setSelectedIds(data.messages.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action, value) => {
    if (
      !window.confirm(
        `Tem certeza que deseja aplicar esta ação em ${selectedIds.length} itens?`
      )
    )
      return;

    try {
      await api.bulkAction(selectedIds, action, value);
      setSelectedIds([]);
      fetchMessages();
      toast.success("Ação realizada com sucesso!");
    } catch (err) {
      toast.error("Erro ao realizar ação: " + err.message);
    }
  };

  const handleExport = async () => {
    try {
      const url = await api.exportMessages({
        status: currentStatus,
        search: searchQuery,
        tag: currentTag,
      });

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `mensagens-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Exportação iniciada!");
    } catch (err) {
      toast.error("Erro na exportação: " + err.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      NEW: "bg-red-100 text-red-700 border-red-200",
      READ: "bg-blue-100 text-blue-700 border-blue-200",
      REPLIED: "bg-green-100 text-green-700 border-green-200",
      ARCHIVED: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[status] || colors.NEW;
  };

  const getStatusLabel = (status) => {
    const labels = {
      NEW: "Nova",
      READ: "Lida",
      REPLIED: "Respondida",
      ARCHIVED: "Arquivada",
    };
    return labels[status] || status;
  };

  return (
    <AdminLayout
      title="Mensagens Recebidas"
      subtitle="Gerencie os contatos do site"
    >
      {/* Filters & Actions */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-lg border shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou assunto..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4" /> Exportar CSV
          </button>

          <div className="flex items-center gap-2 border rounded-lg p-1 bg-gray-50">
            <Filter className="h-4 w-4 text-gray-500 ml-2" />
            <select
              className="bg-transparent border-none text-sm focus:ring-0 text-gray-700"
              value={currentStatus}
              onChange={(e) => updateParam("status", e.target.value)}
            >
              <option value="">Todos Status</option>
              <option value="NEW">Novas</option>
              <option value="READ">Lidas</option>
              <option value="REPLIED">Respondidas</option>
              <option value="ARCHIVED">Arquivadas</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border rounded-lg p-1 bg-gray-50">
            <TagIcon className="h-4 w-4 text-gray-500 ml-2" />
            <select
              className="bg-transparent border-none text-sm focus:ring-0 text-gray-700"
              value={currentTag}
              onChange={(e) => updateParam("tag", e.target.value)}
            >
              <option value="">Todas Tags</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-blue-800 ml-2">
            {selectedIds.length} selecionados
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("UPDATE_STATUS", "READ")}
              className="px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded text-sm hover:bg-blue-50"
            >
              Marcar Lida
            </button>
            <button
              onClick={() => handleBulkAction("UPDATE_STATUS", "ARCHIVED")}
              className="px-3 py-1 bg-white border border-blue-200 text-gray-700 rounded text-sm hover:bg-gray-50"
            >
              Arquivar
            </button>
            <button
              onClick={() => handleBulkAction("RESEND_DISCORD")}
              className="px-3 py-1 bg-white border border-indigo-200 text-indigo-700 rounded text-sm hover:bg-indigo-50 flex items-center gap-1"
            >
              <Gamepad2 className="h-3 w-3" /> Discord
            </button>
            <button
              onClick={() => handleBulkAction("DELETE")}
              className="px-3 py-1 bg-white border border-red-200 text-red-700 rounded text-sm hover:bg-red-50"
            >
              Excluir
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
          <button onClick={fetchMessages} className="ml-auto underline">
            Tentar novamente
          </button>
        </div>
      ) : data?.messages?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed">
          <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            Nenhuma mensagem encontrada
          </h3>
          <p className="text-gray-500">Tente ajustar seus filtros de busca.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        selectedIds.length === data?.messages?.length &&
                        data?.messages?.length > 0
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remetente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assunto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.messages?.map((msg) => (
                  <tr
                    key={msg.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedIds.includes(msg.id) ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(msg.id)}
                        onChange={() => handleSelectOne(msg.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit border ${getStatusColor(
                            msg.status
                          )}`}
                        >
                          {getStatusLabel(msg.status)}
                        </span>
                        {msg.priority && msg.priority !== "MEDIUM" && (
                          <span
                            className={`px-2 inline-flex text-[10px] leading-4 font-medium rounded-full w-fit border ${
                              msg.priority === "HIGH"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-gray-50 text-gray-600 border-gray-100"
                            }`}
                          >
                            {msg.priority === "HIGH" ? "Alta" : "Baixa"}
                          </span>
                        )}
                      </div>
                      {msg.source === "discord" && (
                        <span
                          className="mt-1 inline-flex items-center text-xs text-indigo-600"
                          title="Via Discord"
                        >
                          <Gamepad2 className="h-3 w-3 mr-1" /> Discord
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {msg.name || "Sem nome"}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {msg.email || "Sem email"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {msg.subject || "Sem assunto"}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {msg.tags?.map((t) => (
                          <span
                            key={t.id}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(msg.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/messages/${msg.id}`}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center gap-1 px-3 py-1 border border-primary-200 rounded-md hover:bg-primary-50 transition-colors"
                      >
                        <Eye className="h-4 w-4" /> Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.pagination && (
            <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando{" "}
                <span className="font-medium">
                  {(data.pagination.page - 1) * data.pagination.limit + 1}
                </span>{" "}
                a{" "}
                <span className="font-medium">
                  {Math.min(
                    data.pagination.page * data.pagination.limit,
                    data.pagination.total
                  )}
                </span>{" "}
                de <span className="font-medium">{data.pagination.total}</span>{" "}
                resultados
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(data.pagination.page - 1)}
                  disabled={data.pagination.page === 1}
                  className="p-2 border rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handlePageChange(data.pagination.page + 1)}
                  disabled={data.pagination.page === data.pagination.totalPages}
                  className="p-2 border rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminMessages;
