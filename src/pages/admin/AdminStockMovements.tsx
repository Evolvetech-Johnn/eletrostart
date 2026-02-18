import React, { useState, useEffect } from "react";
import AdminLayout from "./components/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productService,
  StockMovement,
  Product,
  StockMovementsResponse,
} from "../../services/productService";
import { adminService, AdminUser } from "../../services/adminService";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { AlertCircle, Filter, Download, Edit3 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

type StockMovementsData = Awaited<
  ReturnType<typeof productService.getStockMovements>
>;

const AdminStockMovements: React.FC = () => {
  const [productId, setProductId] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [origin, setOrigin] = useState<string>("");
  const [emptySku, setEmptySku] = useState<boolean>(false);
  const [dateFormat, setDateFormat] = useState<string>("iso");
  const [dateTz, setDateTz] = useState<string>("");
  const [timezoneOptions, setTimezoneOptions] = useState<string[]>([]);
  const [timezoneQuery, setTimezoneQuery] = useState<string>("");

  useEffect(() => {
    const sup = (Intl as any)?.supportedValuesOf;
    if (typeof sup === "function") {
      try {
        const list = sup.call(Intl, "timeZone") as string[];
        setTimezoneOptions(list || ["America/Sao_Paulo", "Etc/UTC"]);
      } catch {
        setTimezoneOptions(["America/Sao_Paulo", "Etc/UTC"]);
      }
    } else {
      setTimezoneOptions(["America/Sao_Paulo", "Etc/UTC"]);
    }
    const savedTz = localStorage.getItem("admin_stock_timezone");
    if (savedTz) setDateTz(savedTz);
  }, []);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [delta, setDelta] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [stockModalProduct, setStockModalProduct] = useState<{
    id: string;
    name: string;
    sku?: string;
    stock: number;
  } | null>(null);
  const [stockModalValue, setStockModalValue] = useState<string>("");
  const [stockModalReason, setStockModalReason] = useState<string>("");

  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products", { all: true }],
    queryFn: () => productService.getProducts({ all: true }),
  });

  const { data: users = [] } = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: () => adminService.getUsers(),
  });

  const {
    data,
    isLoading,
    error,
  } = useQuery<StockMovementsData>({
    queryKey: [
      "stock-movements",
      {
        productId,
        type,
        origin,
        from,
        to,
        selectedUserId,
        delta,
        emptySku,
        page,
      },
    ],
    queryFn: () =>
      productService.getStockMovements({
        productId: productId || undefined,
        type: type || undefined,
        origin: origin || undefined,
        from: from || undefined,
        to: to || undefined,
        userId: selectedUserId || undefined,
        delta: delta || undefined,
        emptySku: emptySku ? "true" : undefined,
        page,
        limit: 20,
      }),
  });

  const movements = (data?.data || []) as StockMovement[];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const emptySkuCountQuery = useQuery({
    queryKey: [
      "stock-empty-sku-count",
      { productId, type, origin, from, to, selectedUserId, delta },
    ],
    queryFn: () =>
      productService.getStockEmptySkuCount({
        productId: productId || undefined,
        type: type || undefined,
        origin: origin || undefined,
        from: from || undefined,
        to: to || undefined,
        userId: selectedUserId || undefined,
        delta: delta || undefined,
      }),
  });
  const adjustStockMutation = useMutation({
    mutationFn: ({
      id,
      newStock,
      reason,
    }: {
      id: string;
      newStock: number;
      reason?: string;
    }) => productService.adjustProductStock(id, { newStock, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Estoque ajustado");
      setStockModalProduct(null);
      setStockModalValue("");
      setStockModalReason("");
    },
    onError: (err: any) => {
      toast.error("Erro ao ajustar estoque: " + (err.message || "Erro"));
    },
  });

  const handleExport = async () => {
    try {
      const url = await productService.exportStockMovements({
        productId: productId || undefined,
        type: type || undefined,
        origin: origin || undefined,
        from: from || undefined,
        to: to || undefined,
        userId: selectedUserId || undefined,
        delta: delta || undefined,
        emptySku: emptySku ? "true" : undefined,
        dateFormat,
        dateTz: dateFormat === "local" ? dateTz || undefined : undefined,
      });
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `movimentacoes-estoque-${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      toast.error("Erro ao exportar movimentações: " + (err.message || "Erro"));
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Movimentações de Estoque
            </h1>
            <p className="text-gray-500">
              Auditoria e filtros por produto/período/tipo
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="grid grid-cols-1 md:grid-cols-8 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Produto
              </label>
              <select
                className="border rounded-lg px-3 py-2 w-full bg-white"
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todos</option>
                {(products as Product[]).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.sku ? `(${p.sku})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Tipo
              </label>
              <select
                className="border rounded-lg px-3 py-2 w-full bg-white"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todos</option>
                <option value="MANUAL_ADJUST">MANUAL_ADJUST</option>
                <option value="ORDER_CREATE">ORDER_CREATE</option>
                <option value="ORDER_CANCEL">ORDER_CANCEL</option>
                <option value="ORDER_RESTORE">ORDER_RESTORE</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Origem
              </label>
              <select
                className="border rounded-lg px-3 py-2 w-full bg-white"
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todas</option>
                <option value="manual">Ajuste manual</option>
                <option value="order_create">Pedido criado</option>
                <option value="order_cancel">Cancelamento de pedido</option>
                <option value="order_restore">Reativação de pedido</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                De (data)
              </label>
              <Input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Até (data)
              </label>
              <Input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Usuário
              </label>
              <select
                className="border rounded-lg px-3 py-2 w-full bg-white"
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todos</option>
                {(users as AdminUser[]).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email || u.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Delta
              </label>
              <select
                className="border rounded-lg px-3 py-2 w-full bg-white"
                value={delta}
                onChange={(e) => {
                  setDelta(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todos</option>
                <option value="positive">Aumentos</option>
                <option value="negative">Baixas</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="emptySku"
                type="checkbox"
                className="h-4 w-4 rounded border"
                checked={emptySku}
                onChange={(e) => {
                  setEmptySku(e.target.checked);
                  setPage(1);
                }}
              />
              <label
                htmlFor="emptySku"
                className="text-xs font-semibold text-gray-600"
              >
                SKU vazio
              </label>
              <span className="text-xs text-gray-500">
                ·{" "}
                <span title="Considera filtros atuais: Produto, Origem, Período, Usuário e Delta">
                  {emptySkuCountQuery.data ?? 0}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setProductId("");
                  setType("");
                  setOrigin("");
                  setFrom("");
                  setTo("");
                  setSelectedUserId("");
                  setDelta("");
                  setEmptySku(false);
                  setDateFormat("iso");
                  setDateTz("");
                  setPage(1);
                }}
              >
                <Filter size={16} className="mr-2" /> Limpar filtros
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Formato de data
                </label>
                <select
                  className="border rounded-lg px-3 py-2 bg-white"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                >
                  <option value="iso">ISO</option>
                  <option value="local">Local (pt-BR)</option>
                </select>
              </div>
              {dateFormat === "local" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Timezone
                  </label>
                  <Input
                    placeholder="Buscar timezone..."
                    value={timezoneQuery}
                    onChange={(e) => setTimezoneQuery(e.target.value)}
                    className="mb-2"
                  />
                  <select
                    className="border rounded-lg px-3 py-2 bg-white"
                    value={dateTz}
                    onChange={(e) => {
                      setDateTz(e.target.value);
                      localStorage.setItem("admin_stock_timezone", e.target.value);
                    }}
                  >
                    <option value="">Servidor</option>
                    {timezoneOptions
                      .filter((tz) =>
                        tz.toLowerCase().includes(timezoneQuery.toLowerCase()),
                      )
                      .map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                      ))}
                  </select>
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={isLoading || movements.length === 0}
              >
                <Download size={16} className="mr-2" /> Exportar CSV
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const url = await productService.exportStockMovementsXlsx({
                      productId: productId || undefined,
                      type: type || undefined,
                      origin: origin || undefined,
                      from: from || undefined,
                      to: to || undefined,
                      userId: selectedUserId || undefined,
                      delta: delta || undefined,
                      emptySku: emptySku ? "true" : undefined,
                      dateFormat,
                      dateTz:
                        dateFormat === "local"
                          ? dateTz || undefined
                          : undefined,
                    });
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute(
                      "download",
                      `movimentacoes-estoque-${
                        new Date().toISOString().split("T")[0]
                      }.xlsx`,
                    );
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode?.removeChild(link);
                  } catch (err: any) {
                    toast.error(
                      "Erro ao exportar movimentações: " +
                        (err.message || "Erro"),
                    );
                  }
                }}
                disabled={isLoading || movements.length === 0}
              >
                <Download size={16} className="mr-2" /> Exportar Excel
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-gray-500 text-sm">Carregando...</div>
          ) : error ? (
            <div className="p-6 text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Erro ao carregar movimentações
            </div>
          ) : (
            <>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2">Data</th>
                    <th className="text-left px-3 py-2">Produto</th>
                    <th className="text-left px-3 py-2">Tipo</th>
                    <th className="text-left px-3 py-2">Origem</th>
                    <th className="text-left px-3 py-2">Delta</th>
                    <th className="text-left px-3 py-2">Antes → Depois</th>
                    <th className="text-left px-3 py-2">Por</th>
                    <th className="text-left px-3 py-2">Motivo</th>
                    <th className="text-left px-3 py-2">Pedido</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => {
                    const date = new Date(m.createdAt).toLocaleString();
                    const user =
                      m.createdBy?.name ||
                      m.createdBy?.email ||
                      (m.createdBy ? m.createdBy.id : "-");
                    let origin = "";
                    if (m.type === "MANUAL_ADJUST") {
                      origin = "Ajuste manual";
                    } else if (m.type === "ORDER_CREATE") {
                      origin = m.order?.id
                        ? `Pedido ${m.order.id}`
                        : "Pedido criado";
                    } else if (m.type === "ORDER_CANCEL") {
                      origin = m.order?.id
                        ? `Cancelamento pedido ${m.order.id}`
                        : "Cancelamento de pedido";
                    } else if (m.type === "ORDER_RESTORE") {
                      origin = m.order?.id
                        ? `Reativação pedido ${m.order.id}`
                        : "Reativação de pedido";
                    } else {
                      origin = m.type;
                    }
                    return (
                      <tr key={m.id} className="border-t">
                        <td className="px-3 py-2">{date}</td>
                        <td className="px-3 py-2">
                          {m.product?.name}{" "}
                          {m.product?.sku ? `(${m.product?.sku})` : ""}
                          {m.product?.id && (
                            <>
                              {" "}
                              ·{" "}
                              <Link
                                to={`/admin/products/${m.product.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                ver produto
                              </Link>
                            </>
                          )}
                        </td>
                        <td className="px-3 py-2">{m.type}</td>
                        <td className="px-3 py-2">{origin}</td>
                        <td className="px-3 py-2">
                          {m.quantity > 0 ? "+" : ""}
                          {m.quantity}
                        </td>
                        <td className="px-3 py-2">
                          {m.previousStock} → {m.newStock}
                        </td>
                        <td className="px-3 py-2">{user || "-"}</td>
                        <td className="px-3 py-2">{m.reason || "-"}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {m.order?.id ? (
                              <Link
                                to={`/admin/orders/${m.order.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {m.order.id}
                              </Link>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                            {m.product?.id && (
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setStockModalProduct({
                                    id: m.product!.id,
                                    name: m.product!.name || "",
                                    sku: m.product!.sku || "",
                                    stock: m.newStock,
                                  });
                                  setStockModalValue(String(m.newStock));
                                  setStockModalReason("");
                                }}
                              >
                                <Edit3 size={14} className="mr-1" />
                                Ajustar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {movements.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-3 py-4 text-center text-gray-500"
                      >
                        Nenhuma movimentação encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="flex justify-between items-center p-3 text-xs text-gray-600">
                <span>
                  Página {pagination.page} de {pagination.totalPages} · Total{" "}
                  {pagination.total}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.page <= 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setPage((p) => (p < pagination.totalPages ? p + 1 : p))
                    }
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {stockModalProduct && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h2 className="text-lg font-semibold mb-4">Ajustar estoque</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    {stockModalProduct.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stockModalProduct.sku || stockModalProduct.id}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Estoque atual: {stockModalProduct.stock}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Novo estoque
                  </label>
                  <Input
                    type="number"
                    value={stockModalValue}
                    onChange={(e) => setStockModalValue(e.target.value)}
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Motivo
                  </label>
                  <Input
                    value={stockModalReason}
                    onChange={(e) => setStockModalReason(e.target.value)}
                    placeholder="Ex: Ajuste manual, inventário, correção, etc."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStockModalProduct(null);
                    setStockModalValue("");
                    setStockModalReason("");
                  }}
                  disabled={adjustStockMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    const value = Number(stockModalValue);
                    if (!Number.isFinite(value) || value < 0) {
                      toast.error("Informe um valor de estoque válido");
                      return;
                    }
                    adjustStockMutation.mutate({
                      id: stockModalProduct.id,
                      newStock: value,
                      reason: stockModalReason || undefined,
                    });
                  }}
                  disabled={adjustStockMutation.isPending}
                >
                  {adjustStockMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminStockMovements;
