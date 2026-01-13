import React, { useState, useEffect } from "react";
import {
  Gamepad2,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { api } from "../../services/api";
import AdminLayout from "./components/AdminLayout";

const AdminIntegrations = () => {
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      const response = await api.getDiscordLogs();
      if (response.success) {
        setLogs(response.data);
      }
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchLogs();
      setLoading(false);
    };
    init();
  }, []);

  const handleTestDiscord = async () => {
    try {
      setTesting(true);
      const response = await api.testDiscord();
      if (response.success) {
        toast.success(response.message);
        fetchLogs();
      }
    } catch (err) {
      toast.error("Erro no teste: " + err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleSync = async () => {
    try {
      setTesting(true);
      const response = await api.syncMessages();
      if (response.success) {
        toast.success(response.message);
        fetchLogs();
      }
    } catch (err) {
      toast.error("Erro na sincronização: " + err.message);
    } finally {
      setTesting(false);
    }
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
              <button
                onClick={handleSync}
                disabled={testing}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-lg font-bold transition-colors text-sm disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={testing ? "animate-spin" : ""}
                />
                Sincronizar
              </button>
              <button
                onClick={handleTestDiscord}
                disabled={testing}
                className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm shadow-lg shadow-[#5865F2]/20 disabled:opacity-50"
              >
                {testing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                Testar Conexão
              </button>
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
