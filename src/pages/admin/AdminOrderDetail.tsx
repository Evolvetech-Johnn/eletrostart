import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  User,
  MapPin,
  CreditCard,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../../services/orderService";
import { productService } from "../../services/productService";
import {
  buildWhatsappMessage,
  orderToMessageDetails,
} from "../../utils/orderMessage";
import AdminLayout from "./components/AdminLayout";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const orderId = id || "";
  const { loading: authLoading, isAuthenticated } = useAuth();

  const {
    data: order,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrder(orderId),
    enabled: !!orderId && !authLoading && isAuthenticated,
  });

  const [trackingDraft, setTrackingDraft] = useState("");

  useEffect(() => {
    if (order?.trackingCode !== undefined && order?.trackingCode !== null) {
      setTrackingDraft(order.trackingCode);
    } else {
      setTrackingDraft("");
    }
  }, [order?.trackingCode]);

  const [productCodes, setProductCodes] = useState<
    Record<string, string | undefined>
  >({});
  useEffect(() => {
    const loadCodes = async () => {
      try {
        const ids = Array.from(
          new Set((order?.items || []).map((i) => i.productId).filter(Boolean)),
        );
        const results = await Promise.all(
          ids.map(async (pid) => {
            try {
              const p = await productService.getProduct(pid);
              return { id: pid, code: p.code };
            } catch {
              return { id: pid, code: undefined };
            }
          }),
        );
        const map: Record<string, string | undefined> = {};
        results.forEach((r) => (map[r.id] = r.code));
        setProductCodes(map);
      } catch {
        // silencioso; códigos são opcionais na mensagem
      }
    };
    if (order && order.items && order.items.length > 0) {
      loadCodes();
    }
  }, [order?.id]);

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      trackingCode,
    }: {
      id: string;
      status: string;
      trackingCode?: string;
    }) => orderService.updateOrderStatus(id, status, trackingCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Status atualizado!");
    },
    onError: (err: any) => {
      toast.error("Erro ao atualizar: " + (err.message || "Erro desconhecido"));
    },
  });

  const handleStatusChange = (newStatus: string) => {
    if (!window.confirm(`Mudar status para ${newStatus}?`)) return;
    updateStatusMutation.mutate({
      id: orderId,
      status: newStatus,
      trackingCode: trackingDraft,
    });
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
      SHIPPED: "bg-blue-100 text-blue-800",
      DELIVERED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  const buildMessageFromOrder = () => {
    if (!order) return "";
    const details = orderToMessageDetails(order, productCodes);
    return buildWhatsappMessage(details);
  };

  const copyWhatsappMessage = () => {
    const msg = buildMessageFromOrder();
    if (!msg) return;
    navigator.clipboard.writeText(msg).then(
      () => toast.success("Mensagem copiada"),
      () => toast.error("Não foi possível copiar a mensagem"),
    );
  };

  const openWhatsappWeb = () => {
    const msg = buildMessageFromOrder();
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />{" "}
          {(error as Error)?.message || "Pedido não encontrado"}
        </div>
        <div className="mt-4">
          <Link to="/admin/orders" className="text-blue-600 hover:underline">
            &larr; Voltar para pedidos
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link
            to="/admin/orders"
            className="inline-flex items-center text-gray-600 hover:text-primary"
          >
            <ArrowLeft size={16} className="mr-1" /> Voltar
          </Link>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-sm text-gray-500">Mudar Status:</span>
            <select
              className="border rounded px-3 py-1 bg-white"
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updateStatusMutation.isPending}
            >
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="SHIPPED">Enviado</option>
              <option value="DELIVERED">Entregue</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
            <button
              type="button"
              className="px-3 py-1 rounded border text-sm hover:bg-gray-50"
              onClick={copyWhatsappMessage}
              title="Copiar mensagem de pedido para WhatsApp"
            >
              Copiar WhatsApp
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700"
              onClick={openWhatsappWeb}
              title="Abrir WhatsApp Web com a mensagem"
            >
              Abrir WhatsApp
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Pedido #{order.id.slice(0, 8)}
          </h1>
          <p className="text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="font-bold flex items-center gap-2">
                  <Package size={18} /> Itens do Pedido
                </h3>
              </div>
              <div className="w-full overflow-x-auto">
                <table className="min-w-[900px] w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-sm font-medium text-gray-500">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">
                        Qtd
                      </th>
                      <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">
                        Unitário
                      </th>
                      <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {item.productName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-3 text-right font-medium text-gray-500"
                      >
                        Subtotal
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-gray-900">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(order.subtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-3 text-right font-medium text-gray-500"
                      >
                        Frete
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-gray-900">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(order.shippingCost)}
                      </td>
                    </tr>
                    <tr className="bg-gray-100">
                      <td
                        colSpan={3}
                        className="px-6 py-4 text-right font-black text-gray-900 text-lg"
                      >
                        Total
                      </td>
                      <td className="px-6 py-4 text-right font-black text-gray-900 text-lg">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(order.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {order.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold mb-2">Observações</h3>
                <p className="text-gray-600 bg-yellow-50 p-4 rounded border border-yellow-100">
                  {order.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Customer */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-800">
                <User size={18} /> Cliente
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Nome</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Email</p>
                  <p className="font-medium break-all">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Telefone</p>
                  <p className="font-medium">{order.customerPhone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">CPF/CNPJ</p>
                  <p className="font-medium">{order.customerDoc || "-"}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-800">
                <MapPin size={18} /> Endereço de Entrega
              </h3>
              <div className="text-gray-600">
                <p>
                  {order.addressStreet}, {order.addressNumber}
                </p>
                {order.addressComp && <p>{order.addressComp}</p>}
                <p>
                  {order.addressCity} - {order.addressState}
                </p>
                <p>CEP: {order.addressZip}</p>
              </div>
            </div>

            {/* Payment & Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-800">
                <CreditCard size={18} /> Pagamento
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    Status do Pedido
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Método</p>
                  <p className="font-medium capitalize">
                    {order.paymentMethod || "Não informado"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    Status Pagamento
                  </p>
                  <p className="font-medium">
                    {order.paymentStatus || "Pendente"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    Código de rastreio
                  </p>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="flex-1 border rounded px-3 py-1 text-sm font-mono"
                      placeholder="EX: BR123456789XYZ"
                      value={trackingDraft}
                      onChange={(e) => setTrackingDraft(e.target.value)}
                    />
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-primary text-white text-xs font-semibold disabled:opacity-60"
                      disabled={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: orderId,
                          status: order.status,
                          trackingCode: trackingDraft.trim() || undefined,
                        })
                      }
                    >
                      {updateStatusMutation.isPending
                        ? "Salvando..."
                        : "Salvar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold mb-4 text-gray-800">
                  Linha do Tempo do Pedido
                </h3>
                <ol className="relative border-l border-gray-200">
                  {order.statusHistory.map((entry) => (
                    <li key={entry.id} className="mb-4 ml-4">
                      <div className="absolute w-2 h-2 bg-primary rounded-full -left-1.5 mt-1" />
                      <p className="text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {entry.status}
                      </p>
                      {entry.changedBy && (
                        <p className="text-xs text-gray-500">
                          por{" "}
                          {entry.changedBy.name ||
                            entry.changedBy.email ||
                            "Usuário"}
                        </p>
                      )}
                      {entry.notes && (
                        <p className="text-xs text-gray-500 mt-1">
                          {entry.notes}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;
