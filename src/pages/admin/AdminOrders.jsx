import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ShoppingBag,
  Search,
  Eye,
  Loader2,
  AlertCircle,
  Calendar,
  DollarSign,
  User,
} from "lucide-react";
import { api } from "../../services/api";
import AdminLayout from "./components/AdminLayout";
import { toast } from "react-hot-toast";

const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const page = searchParams.get("page") || 1;
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getOrders({ page, status, search });
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      setError(err.message);
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, status, search]);

  const [searchInput, setSearchInput] = useState(search);

  const handleStatusChange = async (orderId, newStatus) => {
    // Atualização otimista
    setData((prevData) =>
      prevData.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );

    try {
      await api.updateOrderStatus(orderId, { status: newStatus });
      toast.success("Status atualizado!");
      fetchOrders();
    } catch (err) {
      toast.error("Erro ao atualizar status");
      fetchOrders(); // Reverte em caso de erro
    }
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) params.set("search", searchInput);
    else params.delete("search");
    params.set("page", 1);
    setSearchParams(params);
  };

  const getStatusColor = (status) => {
    const map = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
      SHIPPED: "bg-blue-100 text-blue-800",
      DELIVERED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const map = {
      PENDING: "Pendente",
      PAID: "Pago",
      SHIPPED: "Enviado",
      DELIVERED: "Entregue",
      CANCELLED: "Cancelado",
    };
    return map[status] || status;
  };

  return (
    <AdminLayout title="Pedidos" subtitle="Gerencie as vendas da loja">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <form
          onSubmit={onSearchSubmit}
          className="flex gap-2 flex-1 w-full md:max-w-md"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente ou ID..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Buscar
          </button>
        </form>

        <div className="w-full md:w-auto">
          <select
            className="w-full border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-primary-500"
            value={status}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              if (e.target.value) params.set("status", e.target.value);
              else params.delete("status");
              setSearchParams(params);
            }}
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
          <AlertCircle size={20} /> {error}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <table className="w-full text-left">
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
                <th className="px-6 py-3 font-medium text-gray-500 text-sm text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data && data.length > 0 ? (
                data.map((order) => (
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
                        className={`px-2 py-1 rounded text-xs font-bold border-none outline-none cursor-pointer ${getStatusColor(order.status)}`}
                      >
                        <option value="PENDING">Pendente</option>
                        <option value="PAID">Pago</option>
                        <option value="SHIPPED">Enviado</option>
                        <option value="DELIVERED">Entregue</option>
                        <option value="CANCELLED">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
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
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
