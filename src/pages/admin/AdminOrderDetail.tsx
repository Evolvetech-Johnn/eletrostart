import React from "react";
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
import AdminLayout from "./components/AdminLayout";
import { toast } from "react-hot-toast";

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const orderId = id || "";

  const {
    data: order,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrder(orderId),
    enabled: !!orderId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderService.updateOrderStatus(id, status),
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
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
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

          <div className="flex items-center gap-2">
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
              <table className="w-full text-left">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;
