import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search, Eye, Loader2, AlertCircle, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService, Order, UpdateOrderParams } from "../../services/orderService";
import AdminLayout from "./components/AdminLayout";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendente" },
  { value: "PAID", label: "Pago" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELLED", label: "Cancelado" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
};



/* ─────────────────────────── Modals ──────────────────────────── */

/* ─── Edit Modal ─── */
interface OrderEditModalProps {
  order: Order;
  onClose: () => void;
}

const OrderEditModal: React.FC<OrderEditModalProps> = ({ order, onClose }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<UpdateOrderParams>({
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone ?? "",
    customerDoc: order.customerDoc ?? "",
    addressZip: order.addressZip,
    addressStreet: order.addressStreet,
    addressNumber: order.addressNumber,
    addressComp: order.addressComp ?? "",
    addressCity: order.addressCity,
    addressState: order.addressState,
    notes: order.notes ?? "",
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateOrderParams) => orderService.updateOrder(order.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", order.id] });
      toast.success("Pedido atualizado!");
      onClose();
    },
    onError: (err: any) => toast.error("Erro ao atualizar: " + (err.message || "Erro")),
  });

  const set = (k: keyof UpdateOrderParams, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const fields: { label: string; key: keyof UpdateOrderParams; type?: string }[] = [
    { label: "Nome do Cliente *", key: "customerName" },
    { label: "E-mail *", key: "customerEmail", type: "email" },
    { label: "Telefone", key: "customerPhone" },
    { label: "CPF/CNPJ", key: "customerDoc" },
    { label: "CEP", key: "addressZip" },
    { label: "Rua", key: "addressStreet" },
    { label: "Número", key: "addressNumber" },
    { label: "Complemento", key: "addressComp" },
    { label: "Cidade", key: "addressCity" },
    { label: "Estado (UF)", key: "addressState" },
    { label: "Observações", key: "notes" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Editar Pedido #{order.id.slice(0, 8)}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(form); }} className="p-6 space-y-3">
          {fields.map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
              <input
                type={type ?? "text"}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={(form[key] as string) ?? ""}
                onChange={(e) => set(key, e.target.value)}
              />
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl border text-gray-600 hover:bg-gray-50 text-sm font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={updateMutation.isPending}
              className="px-6 py-2 rounded-xl bg-[#222998] text-white text-sm font-bold hover:bg-blue-800 disabled:opacity-60">
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────── Main Page ──────────────────────────── */

const AdminOrders: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(search);

  const [editOrder, setEditOrder] = useState<Order | null>(null);

  const isAdmin =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const { data: orders = [], isLoading: loading, error } = useQuery<Order[]>({
    queryKey: ["orders", { page, status, search }],
    queryFn: () => orderService.getOrders({ page, status, search }),
    enabled: !authLoading && isAuthenticated,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Status atualizado!");
    },
    onError: (err: any) => toast.error("Erro ao atualizar: " + (err.message || "Erro")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orderService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Pedido excluído!");
    },
    onError: (err: any) => toast.error("Erro ao excluir: " + (err.message || "Erro")),
  });

  const handleDelete = (order: Order) => {
    if (!window.confirm(
      `Excluir pedido #${order.id.slice(0, 8)} de ${order.customerName}?\n\nO estoque será restaurado automaticamente.`
    )) return;
    deleteMutation.mutate(order.id);
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) params.set("search", searchInput); else params.delete("search");
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value) params.set("status", e.target.value); else params.delete("status");
    setSearchParams(params);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-5 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">Pedidos</h1>
            <p className="text-gray-500 mt-1">Gerencie os pedidos do E-commerce</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/orders/new"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-200"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Pedido</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border shadow-sm">
          <form onSubmit={onSearchSubmit} className="flex gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar por cliente ou ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
              Buscar
            </button>
          </form>
          <select
            className="border rounded-lg px-3 py-2 bg-white text-sm"
            value={status}
            onChange={handleStatusFilterChange}
          >
            <option value="">Todos Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin h-8 w-8 text-[#222998]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
            <AlertCircle size={20} /> {(error as Error).message}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["ID", "Cliente", "Data", "Total", "Status", "Rastreio", "Ações"].map((h) => (
                      <th key={h} className="px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.length > 0 ? (
                    orders.map((order: Order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 font-mono text-gray-500 text-xs">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">{order.customerName}</p>
                          <p className="text-xs text-gray-400">{order.customerEmail}</p>
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900">
                          {fmt(order.total)}
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                            disabled={updateStatusMutation.isPending}
                            className={`px-2 py-1 rounded-lg text-xs font-bold border-none outline-none cursor-pointer ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-800"}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500 font-mono">
                          {order.trackingCode?.trim() || "-"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 justify-end">
                            <Link
                              to={`/admin/orders/${order.id}`}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                              title="Detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setEditOrder(order)}
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                              title="Editar dados"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(order)}
                                disabled={deleteMutation.isPending}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-40"
                                title="Excluir pedido"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                        Nenhum pedido encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t bg-gray-50 text-sm text-gray-500">
              <span>Página {page}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { const p = new URLSearchParams(searchParams); p.set("page", String(page - 1)); setSearchParams(p); }}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border hover:bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { const p = new URLSearchParams(searchParams); p.set("page", String(page + 1)); setSearchParams(p); }}
                  disabled={orders.length < 20}
                  className="p-1.5 rounded-lg border hover:bg-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals Extras (Update/Confirm Delete) permaneceram intactos abaixo do List */}
      {editOrder && (
        <OrderEditModal
          order={editOrder}
          onClose={() => setEditOrder(null)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
