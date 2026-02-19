import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Eye, Loader2, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService, Order } from "../../services/orderService";
import AdminLayout from "./components/AdminLayout";
import { toast } from "react-hot-toast";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

const AdminOrders: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";

  // Local state for search input to avoid debounce issues for now
  const [searchInput, setSearchInput] = useState(search);

  const { loading: authLoading, isAuthenticated } = useAuth();

  // Queries
  const {
    data: orders = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["orders", { page, status, search }],
    queryFn: () => orderService.getOrders({ page, status, search }),
    enabled: !authLoading && isAuthenticated,
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Status atualizado!");
    },
    onError: (err: any) => {
      toast.error(
        "Erro ao atualizar status: " + (err.message || "Erro desconhecido"),
      );
    },
  });

  // Handlers
  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) params.set("search", searchInput);
    else params.delete("search");
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value) params.set("status", e.target.value);
    else params.delete("status");
    setSearchParams(params);
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

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-gray-500">Gerencie as vendas da loja</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg border shadow-sm">
          <form
            onSubmit={onSearchSubmit}
            className="flex gap-2 flex-1 w-full md:max-w-md"
          >
            <div className="flex-1">
              <Input
                placeholder="Buscar por cliente ou ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <Button type="submit">Buscar</Button>
          </form>

          <div className="w-full md:w-auto">
            <select
              className="w-full border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-primary-500"
              value={status}
              onChange={handleStatusFilterChange}
            >
              <option value="">Todos Status</option>
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="SHIPPED">Enviado</option>
              <option value="DELIVERED">Entregue</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} /> {(error as Error).message}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-full overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 font-medium text-gray-500 text-sm">
                      ID
                    </th>
                    <th className="px-6 py-3 font-medium text-gray-500 text-sm">
                      Cliente
                    </th>
                    <th className="px-6 py-3 font-medium text-gray-500 text-sm">
                      Data
                    </th>
                    <th className="px-6 py-3 font-medium text-gray-500 text-sm">
                      Total
                    </th>
                    <th className="px-6 py-3 font-medium text-gray-500 text-sm">
                      Status
                    </th>
                    <th className="px-6 py-3 font-medium text-gray-500 text-sm">
                      Rastreio
                    </th>
                    <th className="px-6 py-3 font-medium text-gray-500 text-sm text-right">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders && orders.length > 0 ? (
                    orders.map((order: Order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono text-gray-600">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">
                              {order.customerName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {order.customerEmail}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(order.total)}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            disabled={updateStatusMutation.isPending}
                            className={`px-2 py-1 rounded text-xs font-bold border-none outline-none cursor-pointer ${getStatusColor(order.status)}`}
                          >
                            <option value="PENDING">Pendente</option>
                            <option value="PAID">Pago</option>
                            <option value="SHIPPED">Enviado</option>
                            <option value="DELIVERED">Entregue</option>
                            <option value="CANCELLED">Cancelado</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600 font-mono">
                          {order.trackingCode &&
                          order.trackingCode.trim().length > 0
                            ? order.trackingCode
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium"
                          >
                            <Eye size={16} /> Detalhes
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        Nenhum pedido encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
