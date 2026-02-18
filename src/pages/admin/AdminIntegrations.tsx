import React from "react";
import AdminLayout from "./components/AdminLayout";

const AdminIntegrations: React.FC = () => {
  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6 p-6">
        <h1 className="text-2xl font-black text-gray-900">Integrações</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-700">
            Não há integrações ativas no momento. O suporte ao Discord foi
            descontinuado e todo o backend roda via Render com MongoDB Atlas.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminIntegrations;
