import React from "react";
import AdminLayout from "./components/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { Cloud, HardDrive, CreditCard, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const AdminIntegrations: React.FC = () => {
  const { data: cloudinaryStatus, isLoading: isLoadingCloudinary } = useQuery({
    queryKey: ["cloudinary-status"],
    queryFn: async () => {
      const res = await apiClient.get<any>("/cloudinary/status");
      return res.data?.data || res.data;
    },
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8 p-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Integrações</h1>
          <p className="text-gray-500 mt-1">Status de conexão com serviços externos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cloudinary CDN */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Cloud size={24} />
              </div>
              {isLoadingCloudinary ? (
                <Loader2 className="animate-spin text-gray-400" size={20} />
              ) : cloudinaryStatus?.configured ? (
                <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 size={14} /> Ativo
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <AlertCircle size={14} /> Local Fallback
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-bold text-gray-900">Cloudinary (Imagens)</h3>
              <p className="text-sm text-gray-600 mt-1">
                {cloudinaryStatus?.configured 
                  ? "As imagens estão sendo enviadas para o CDN e não serão perdidas em novos deploys."
                  : "Credenciais ausentes. Imagens salvas localmente SERÃO PERDIDAS ao fazer deploy."}
              </p>
            </div>

            {!cloudinaryStatus?.configured && !isLoadingCloudinary && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  Configure <strong>CLOUDINARY_CLOUD_NAME</strong>, <strong>API_KEY</strong> e <strong>API_SECRET</strong> no Render.
                </p>
              </div>
            )}
          </div>

          {/* Mercado Pago */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <CreditCard size={24} />
              </div>
              <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Ativo
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-bold text-gray-900">Mercado Pago (PIX)</h3>
              <p className="text-sm text-gray-600 mt-1">
                Integração configurada para pagamentos automáticos e conciliação de pedidos.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-200">
          <div className="flex items-center gap-3 text-gray-600">
            <HardDrive size={20} />
            <span className="text-sm font-medium">Infraestrutura: Render + MongoDB Atlas (AWS Virginia)</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminIntegrations;
