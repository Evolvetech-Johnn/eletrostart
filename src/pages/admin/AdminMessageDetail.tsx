import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  MessageSquare,
  Clock,
  Tag as TagIcon,
  CheckCircle,
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
  FileText,
} from "lucide-react";
import { adminService, Tag } from "../../services/adminService";
import AdminLayout from "./components/AdminLayout";
import { toast } from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";

const AdminMessageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local state for editing
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [assignedToId, setAssignedToId] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");

  // Queries
  const {
    data: message,
    isLoading: isLoadingMessage,
    error: messageError,
  } = useQuery({
    queryKey: ["message", id],
    queryFn: () => adminService.getMessage(id!),
    enabled: !!id,
  });

  const { data: availableTags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: adminService.getTags,
  });

  const { data: adminUsers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: adminService.getUsers,
  });

  // Sync local state with fetched message
  useEffect(() => {
    if (message) {
      setNotes(message.notes || "");
      setPriority(message.priority || "MEDIUM");
      setAssignedToId(message.assignedToId || "");
      setSelectedTags(message.tags || []);
    }
  }, [message]);

  // Mutations
  const updateMetaMutation = useMutation({
    mutationFn: (data: {
      notes: string;
      priority: "LOW" | "MEDIUM" | "HIGH";
      assignedToId: string | undefined;
      tags: string[];
    }) => adminService.updateMessageMeta(id!, data),
    onSuccess: (updatedMessage) => {
      queryClient.setQueryData(["message", id], updatedMessage);
      toast.success("Informações atualizadas com sucesso!");
    },
    onError: (err: any) => {
      toast.error("Erro ao salvar: " + (err.message || "Erro desconhecido"));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: "NEW" | "READ" | "REPLIED" | "ARCHIVED") =>
      adminService.updateMessageStatus(id!, status),
    onSuccess: (updatedMessage) => {
      queryClient.setQueryData(["message", id], updatedMessage);
      toast.success(
        `Status atualizado para ${getStatusLabel(updatedMessage.status)}`,
      );
    },
    onError: (err: any) => {
      toast.error(
        "Erro ao atualizar status: " + (err.message || "Erro desconhecido"),
      );
    },
  });

  const createTagMutation = useMutation({
    mutationFn: (name: string) =>
      adminService.createTag({ name, color: "#222998" }),
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setSelectedTags((prev) => [...prev, newTag]);
      setNewTagName("");
      toast.success("Tag criada com sucesso!");
    },
    onError: (err: any) => {
      toast.error("Erro ao criar tag: " + (err.message || "Erro desconhecido"));
    },
  });

  // Handlers
  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    createTagMutation.mutate(newTagName.trim());
  };

  const handleSaveMeta = () => {
    updateMetaMutation.mutate({
      notes,
      priority,
      assignedToId: assignedToId || undefined,
      tags: selectedTags.map((t) => t.id),
    });
  };

  const toggleTag = (tag: Tag) => {
    if (selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleStatusChange = (
    newStatus: "NEW" | "READ" | "REPLIED" | "ARCHIVED",
  ) => {
    updateStatusMutation.mutate(newStatus);
  };

  const handleArchive = () => {
    if (window.confirm("Deseja arquivar esta mensagem?")) {
      handleStatusChange("ARCHIVED");
    }
  };

  const handleExportPDF = async () => {
    if (!message) return;

    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

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
        35,
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
      // @ts-ignore - jspdf-autotable adds lastAutoTable to doc
      doc.text("Conteúdo", 14, doc.lastAutoTable.finalY + 15);

      autoTable(doc, {
        // @ts-ignore
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Assunto", "Mensagem"]],
        body: [[message.subject || "-", message.message || "-"]],
        columnStyles: { 1: { cellWidth: 100 } }, // Wrap message column
      });

      // Internal Notes
      if (message.notes) {
        doc.setFontSize(14);
        // @ts-ignore
        doc.text("Notas Internas", 14, doc.lastAutoTable.finalY + 15);
        doc.setFontSize(10);
        // @ts-ignore
        doc.text(message.notes, 14, doc.lastAutoTable.finalY + 25);
      }

      doc.save(`mensagem-${message.id}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    }
  };

  // Helpers
  const getPriorityColor = (p: string) => {
    switch (p) {
      case "HIGH":
        return "text-red-600 bg-red-50 border-red-200";
      case "LOW":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-orange-600 bg-orange-50 border-orange-200";
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-red-100 text-red-700 border-red-200",
      READ: "bg-blue-100 text-blue-700 border-blue-200",
      REPLIED: "bg-green-100 text-green-700 border-green-200",
      ARCHIVED: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[status] || colors.NEW;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NEW: "Nova",
      READ: "Lida",
      REPLIED: "Respondida",
      ARCHIVED: "Arquivada",
    };
    return labels[status] || status;
  };

  if (isLoadingMessage) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (messageError || !message) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <AlertCircle size={48} className="text-red-500" />
          <p className="text-gray-600">
            {(messageError as Error)?.message || "Mensagem não encontrada"}
          </p>
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
              message.status,
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
                <TagIcon size={18} className="text-gray-400 mt-1" />
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
                <span className="text-gray-500">Origem:</span>
                <span className="font-medium text-gray-900">
                  {message.source || "Site"}
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
                  <Select
                    label="Prioridade"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className={`${getPriorityColor(priority)}`}
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                  </Select>

                  <Select
                    label="Responsável"
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                  >
                    <option value="">-- Não atribuído --</option>
                    {adminUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </Select>

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
                            (t) => !selectedTags.find((st) => st.id === t.id),
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

                        {/* Create new tag input inside dropdown */}
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <form
                            onSubmit={handleCreateTag}
                            className="flex gap-2"
                          >
                            <Input
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                              placeholder="Nova tag..."
                              className="text-xs h-8"
                            />
                            <Button type="submit" size="sm" className="px-2">
                              <Plus size={14} />
                            </Button>
                          </form>
                        </div>

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
                  <Textarea
                    label="Notas Internas"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    placeholder="Adicione observações internas sobre este contato..."
                    leftIcon={<StickyNote size={14} />}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleSaveMeta}
                  isLoading={updateMetaMutation.isPending}
                  loadingText="Salvando..."
                >
                  {!updateMetaMutation.isPending && (
                    <Save size={18} className="mr-2" />
                  )}
                  Salvar Alterações
                </Button>
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
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="bg-white hover:bg-gray-100 border-gray-200 text-gray-700"
            >
              <FileText size={18} className="mr-2" />
              Exportar PDF
            </Button>

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
              <Button
                onClick={() => handleStatusChange("REPLIED")}
                isLoading={updateStatusMutation.isPending}
                variant="outline"
                className="bg-white hover:bg-gray-100 border-gray-200 text-gray-700"
              >
                {!updateStatusMutation.isPending && (
                  <CheckCircle size={18} className="mr-2" />
                )}
                Marcar como Respondida
              </Button>
            )}

            {message.status !== "ARCHIVED" && (
              <Button
                onClick={handleArchive}
                isLoading={updateStatusMutation.isPending}
                variant="secondary"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                {!updateStatusMutation.isPending && (
                  <TagIcon size={18} className="mr-2" />
                )}
                Arquivar
              </Button>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessageDetail;
