import { useFormContext } from "react-hook-form";
import { User } from "lucide-react";
import { OrderFormValues } from "../schema/orderSchema";

const CustomerSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<OrderFormValues>();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <User className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          Dados do Cliente
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nome Completo *
          </label>
          <input
            {...register("customer.name")}
            type="text"
            placeholder="Ex: João da Silva"
            className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white text-sm transition-colors outline-none focus:ring-2 focus:ring-primary/20 ${
              errors.customer?.name
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-primary"
            }`}
          />
          {errors.customer?.name && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {errors.customer.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            E-mail *
          </label>
          <input
            {...register("customer.email")}
            type="email"
            placeholder="joao@exemplo.com"
            className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white text-sm transition-colors outline-none focus:ring-2 focus:ring-primary/20 ${
              errors.customer?.email
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-primary"
            }`}
          />
          {errors.customer?.email && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {errors.customer.email.message}
            </p>
          )}
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Telefone
          </label>
          <input
            {...register("customer.phone")}
            type="tel"
            placeholder="(11) 99999-9999"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white text-sm transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* CPF/CNPJ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            CPF / CNPJ
          </label>
          <input
            {...register("customer.doc")}
            type="text"
            placeholder="000.000.000-00"
            className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white text-sm transition-colors outline-none focus:ring-2 focus:ring-primary/20 ${
              errors.customer?.doc
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-primary"
            }`}
          />
          {errors.customer?.doc && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {errors.customer.doc.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSection;
