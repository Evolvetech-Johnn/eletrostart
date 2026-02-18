import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import { adminService, AuditLog, AdminUser } from "../../services/adminService";
import { AlertCircle, Loader2, Filter } from "lucide-react";
import { Button } from "../../components/ui/Button";

const AdminAuditLogs: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [targetType, setTargetType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data: users } = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: () => adminService.getUsers(),
  });

  const { data, isLoading, isError, refetch, isFetching } = useQuery<{
    logs: AuditLog[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>({
    queryKey: [
      "audit-logs",
      page,
      selectedUserId,
      targetType,
      startDate,
      endDate,
    ],
    queryFn: () =>
      adminService.getAuditLogs({
        page,
        limit,
        userId: selectedUserId || undefined,
        targetType: targetType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const handleApplyFilters = () => {
    setPage(1);
    refetch();
  };

  const totalPages = data?.pagination.totalPages || 1;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
            <p className="text-sm text-gray-500">
              Linha do tempo global de ações críticas (pedidos, mensagens,
              usuários, sistema).
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Usuário
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {users?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Módulo
              </label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                <option value="ORDER">Pedidos</option>
                <option value="PRODUCT">Produtos</option>
                <option value="CATEGORY">Categorias</option>
                <option value="MESSAGE">Mensagens</option>
                <option value="USER">Usuários</option>
                <option value="SYSTEM">Sistema</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Data inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Data final
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <Button
                  type="button"
                  className="flex items-center gap-1"
                  onClick={handleApplyFilters}
                  disabled={isFetching}
                  size="sm"
                >
                  <Filter className="w-4 h-4" />
                  Filtrar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Eventos recentes
            </h2>
            {isFetching && (
              <span className="flex items-center text-xs text-gray-500 gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Atualizando...
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="p-8 flex items-center justify-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Carregando logs...
            </div>
          ) : isError ? (
            <div className="p-6 flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              Erro ao carregar audit logs.
            </div>
          ) : !data || data.logs.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">
              Nenhum evento encontrado.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Data
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Usuário
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Módulo
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Ação
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Alvo
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Detalhes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.logs.map((log: AuditLog) => {
                      const createdAt = new Date(log.createdAt);
                      let details: any = log.details;
                      try {
                        if (typeof log.details === "string") {
                          details = JSON.parse(log.details);
                        }
                      } catch {
                        details = log.details;
                      }

                      const isOrder =
                        log.targetType === "ORDER" ||
                        (typeof details === "object" &&
                          details &&
                          ("newStatus" in details ||
                            "previousStatus" in details ||
                            "trackingCode" in details));

                      return (
                        <tr key={log.id}>
                          <td className="px-4 py-2 text-xs text-gray-600 whitespace-nowrap">
                            {createdAt.toLocaleDateString()}{" "}
                            {createdAt.toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-700 whitespace-nowrap">
                            {log.user?.name || log.user?.email || "—"}
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-700 whitespace-nowrap">
                            {log.targetType || "—"}
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-700 whitespace-nowrap">
                            {log.action}
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">
                            {(() => {
                              const targetLabel =
                                log.targetId || log.messageId || "—";
                              let targetUrl: string | null = null;

                              if (log.targetType === "ORDER" && log.targetId) {
                                targetUrl = `/admin/orders/${log.targetId}`;
                              } else if (
                                log.targetType === "PRODUCT" &&
                                log.targetId
                              ) {
                                targetUrl = `/admin/products/${log.targetId}`;
                              } else if (log.targetType === "MESSAGE") {
                                const id = log.messageId || log.targetId;
                                if (id) {
                                  targetUrl = `/admin/messages/${id}`;
                                }
                              }

                              return targetUrl ? (
                                <Link
                                  to={targetUrl}
                                  className="text-primary hover:underline"
                                >
                                  {targetLabel}
                                </Link>
                              ) : (
                                targetLabel
                              );
                            })()}
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-600 max-w-xs">
                            {isOrder && typeof details === "object" ? (
                              <div className="space-y-1">
                                {"previousStatus" in details && (
                                  <div>
                                    <span className="font-semibold">
                                      Status:
                                    </span>{" "}
                                    {details.previousStatus} →{" "}
                                    {details.newStatus}
                                  </div>
                                )}
                                {"trackingCode" in details && (
                                  <div>
                                    <span className="font-semibold">
                                      Tracking:
                                    </span>{" "}
                                    {details.trackingCode || "—"}
                                  </div>
                                )}
                              </div>
                            ) : typeof details === "string" ? (
                              <span className="line-clamp-2">{details}</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-4 py-3 border-t flex items-center justify-between text-xs text-gray-600">
                <div>
                  Página {data.pagination.page} de {totalPages} —{" "}
                  {data.pagination.total} eventos
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
