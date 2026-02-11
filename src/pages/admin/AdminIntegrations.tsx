import React, { useState } from "react";
import {
  Gamepad2,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../services/adminService";
import AdminLayout from "./components/AdminLayout";
import { Button } from "../../components/ui/Button";

const AdminIntegrations: React.FC = () => {
  const queryClient = useQueryClient();
  const [testing, setTesting] = useState(false);

  const { data: logs = [], isLoading: loading } = useQuery({
    queryKey: ["discordLogs"],
    queryFn: adminService.getDiscordLogs,
  });

  const testDiscordMutation = useMutation({
    mutationFn: adminService.testDiscord,
    onMutate: () => setTesting(true),
    onSettled: () => setTesting(false),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["discordLogs"] });
    },
    onError: (err: any) => {
      toast.error("Erro no teste: " + (err.message || "Erro desconhecido"));
    },
  });

  const syncMessagesMutation = useMutation({
    mutationFn: adminService.syncMessages,
    onMutate: () => setTesting(true),
    onSettled: () => setTesting(false),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["discordLogs"] });
    },
    onError: (err: any) => {
      toast.error(
        "Erro na sincronização: " + (err.message || "Erro desconhecido"),
      );
    },
  });

  const handleTestDiscord = () => {
    testDiscordMutation.mutate();
  };

  const handleSync = () => {
    syncMessagesMutation.mutate();
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Integrações</h1>
          <p className="text-gray-500">
            Gerencie as conexões com serviços externos
          </p>
        </div>

        {/* Discord Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-[#5865F2]/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#5865F2] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#5865F2]/20">
                <Gamepad2 size={28} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Discord</h2>
                <p className="text-sm text-gray-500">
                  Notificações e Sincronização de mensagens
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSync}
                isLoading={testing}
                loadingText="Sincronizando..."
                variant="outline"
                className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
              >
                {!testing && <RefreshCw size={16} className="mr-2" />}
                Sincronizar
              </Button>
              <Button
                onClick={handleTestDiscord}
                isLoading={testing}
                loadingText="Testando..."
                className="!bg-[#5865F2] !hover:bg-[#4752C4] !text-white shadow-lg shadow-[#5865F2]/20 border-none"
              >
                {!testing && <CheckCircle size={16} className="mr-2" />}
                Testar Conexão
              </Button>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
              Logs de Atividade
            </h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-gray-300" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                Nenhuma atividade registrada recentemente
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    {log.status === "SUCCESS" ? (
                      <CheckCircle
                        size={18}
                        className="text-green-500 mt-0.5 flex-shrink-0"
                      />
                    ) : (
                      <AlertCircle
                        size={18}
                        className="text-red-500 mt-0.5 flex-shrink-0"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {log.details}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(log.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminIntegrations;
