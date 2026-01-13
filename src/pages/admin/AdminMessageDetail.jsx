import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Send,
  Plus,
  StickyNote,
  Save,
  History,
  Flag,
  X,
  Inbox,
  FileText,
} from "lucide-react";
import { api } from "../../services/api";
import AdminLayout from "./components/AdminLayout";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminMessageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  // Local state for editing
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [assignedToId, setAssignedToId] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [newTagName, setNewTagName] = useState(""); // State for new tag creation

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [msgResponse, tagsResponse, usersResponse] = await Promise.all([
          api.getMessage(id),
          api.getTags(),
          api.getUsers(),
        ]);

        if (msgResponse.success) {
          const msg = msgResponse.data;
          setMessage(msg);
          setNotes(msg.notes || "");
          setPriority(msg.priority || "MEDIUM");
          setAssignedToId(msg.assignedToId || "");
          setSelectedTags(msg.tags || []);
        }

        if (tagsResponse.success) {
          setAvailableTags(tagsResponse.data);
        }

        if (usersResponse.success) {
          setAdminUsers(usersResponse.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      const response = await api.createTag({
        name: newTagName.trim(),
        color: "#222998",
      });
      if (response.success) {
        const newTag = response.data;
        setAvailableTags([...availableTags, newTag]);
        setSelectedTags([...selectedTags, newTag]);
        setNewTagName("");
      }
    } catch (err) {
      alert("Erro ao criar tag: " + err.message);
    }
  };

  const handleSaveMeta = async () => {
    try {
      setUpdating(true);
      const response = await api.updateMessageMeta(id, {
        notes,
        priority,
        assignedToId: assignedToId || null,
        tags: selectedTags.map((t) => t.id),
      });

      if (response.success) {
        setMessage(response.data);
        alert("Informações atualizadas com sucesso!");
      }
    } catch (err) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case "HIGH":
        return "text-red-600 bg-red-50 border-red-200";
      case "LOW":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-orange-600 bg-orange-50 border-orange-200";
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await api.updateMessageStatus(id, newStatus);
      if (response.success) {
        setMessage((prev) => ({ ...prev, status: response.data.status }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleArchive = async () => {
    if (confirm("Deseja arquivar esta mensagem?")) {
      await handleStatusChange("ARCHIVED");
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

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Detalhes da Mensagem", 14, 20);

    // Meta Info
    doc.setFontSize(10);
    doc.text(`ID: ${message.id}`, 14, 30);
    doc.text(
      `Data: ${new Date(message.createdAt).toLocaleString("pt-BR")}`,
      14,
      35
    );
    doc.text(`Status: ${getStatusLabel(message.status)}`, 14, 40);

    // Sender Info
    doc.setFontSize(14);
    doc.text("Remetente", 14, 55);

    autoTable(doc, {
      startY: 60,
      head: [["Campo", "Valor"]],
      body: [
        ["Nome", message.name || "-"],
        ["Email", message.email || "-"],
        ["Telefone", message.phone || "-"],
      ],
    });

    // Content
    doc.setFontSize(14);
    doc.text("Conteúdo", 14, doc.lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Assunto", "Mensagem"]],
      body: [[message.subject || "-", message.message || "-"]],
      columnStyles: { 1: { cellWidth: 100 } }, // Wrap message column
    });

    // Internal Notes
    if (message.notes) {
      doc.setFontSize(14);
      doc.text("Notas Internas", 14, doc.lastAutoTable.finalY + 15);
      doc.setFontSize(10);
      doc.text(message.notes, 14, doc.lastAutoTable.finalY + 25);
    }

    doc.save(`mensagem-${message.id}.pdf`);
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
          <p className="text-gray-600">{error || "Mensagem não encontrada"}</p>
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
          <span
            className={`text-sm font-bold px-4 py-2 rounded-full border ${getStatusColor(
              message.status
            )}`}
          >
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
                <h1 className="text-2xl font-black text-gray-900">
                  {message.name || "Sem nome"}
                </h1>
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
                      href={`tel:${message.phone.replace(/\D/g, "")}`}
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
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Assunto
                  </p>
                  <p className="text-gray-900 font-medium">{message.subject}</p>
                </div>
              </div>
            )}

            {/* Message */}
            <div className="flex items-start gap-3">
              <MessageSquare size={18} className="text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Mensagem
                </p>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {message.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-gray-400" />
                <span className="text-gray-500">Recebida em:</span>
                <span className="font-medium text-gray-900">
                  {new Date(message.createdAt).toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Send size={16} className="text-gray-400" />
                <span className="text-gray-500">Discord:</span>
                <span
                  className={`font-medium ${
                    message.discordSent ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {message.discordSent ? "Enviado ✓" : "Não enviado"}
                </span>
              </div>
            </div>

            {/* Management Section (Notes, Priority, Tags) */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Flag size={20} className="text-primary" />
                Gestão Interna
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Priority & Assignee */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridade
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className={`w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none font-medium ${getPriorityColor(
                        priority
                      )}`}
                    >
                      <option value="LOW">Baixa</option>
                      <option value="MEDIUM">Média</option>
                      <option value="HIGH">Alta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsável
                    </label>
                    <select
                      value={assignedToId}
                      onChange={(e) => setAssignedToId(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                    >
                      <option value="">-- Não atribuído --</option>
                      {adminUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedTags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {tag.name}
                          <button
                            onClick={() => toggleTag(tag)}
                            className="hover:text-red-500"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="relative group">
                      <button className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                        <Plus size={12} /> Adicionar Tag
                      </button>
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-2 hidden group-hover:block z-10">
                        {availableTags
                          .filter(
                            (t) => !selectedTags.find((st) => st.id === t.id)
                          )
                          .map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => toggleTag(tag)}
                              className="w-full text-left px-2 py-1 text-sm hover:bg-gray-50 rounded"
                            >
                              {tag.name}
                            </button>
                          ))}
                        {availableTags.length === 0 && (
                          <div className="text-xs text-gray-500 p-2">
                            Sem tags disponíveis
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-2">
                      <StickyNote size={14} /> Notas Internas
                    </span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none"
                    placeholder="Adicione observações internas sobre este contato..."
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSaveMeta}
                  disabled={updating}
                  className="flex items-center gap-2 bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  Salvar Alterações
                </button>
              </div>
            </div>

            {/* Audit Log */}
            {message.auditLogs && message.auditLogs.length > 0 && (
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <History size={20} className="text-gray-400" />
                  Histórico de Atividades
                </h3>
                <div className="space-y-3">
                  {message.auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5" />
                      <div>
                        <p className="text-gray-900">
                          <span className="font-medium">
                            {log.user?.name || "Sistema"}:
                          </span>{" "}
                          {log.action}
                        </p>
                        <p className="text-gray-500 text-xs">{log.details}</p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {new Date(log.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card Footer - Actions */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-3">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-lg font-bold transition-colors"
            >
              <FileText size={18} />
              Exportar PDF
            </button>

            {message.email && (
              <a
                href={`mailto:${message.email}?subject=Re: ${
                  message.subject || "Contato Eletrostart"
                }`}
                className="flex items-center gap-2 bg-primary hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold transition-colors"
              >
                <Mail size={18} />
                Responder por E-mail
                <ExternalLink size={14} />
              </a>
            )}

            {message.phone && (
              <a
                href={`https://wa.me/55${message.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold transition-colors"
              >
                <Phone size={18} />
                WhatsApp
                <ExternalLink size={14} />
              </a>
            )}

            {message.status !== "REPLIED" && (
              <button
                onClick={() => handleStatusChange("REPLIED")}
                disabled={updating}
                className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                <CheckCircle size={18} />
                Marcar como Respondida
              </button>
            )}

            {message.status !== "ARCHIVED" && (
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
