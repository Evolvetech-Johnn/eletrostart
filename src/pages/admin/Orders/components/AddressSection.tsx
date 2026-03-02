import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { MapPin, Search, Loader2 } from "lucide-react";
import { OrderFormValues } from "../schema/orderSchema";
import { toast } from "react-hot-toast";

const AddressSection = () => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<OrderFormValues>();
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  const zipValue = watch("address.zip");
  const fulfillmentType = watch("fulfillmentType") || "delivery";
  const isDelivery = fulfillmentType === "delivery";

  const handleCepSearch = async () => {
    const rawCep = zipValue?.replace(/\D/g, "");
    if (!rawCep || rawCep.length !== 8) {
      toast.error("Digite um CEP válido com 8 números");
      return;
    }

    try {
      setIsSearchingCep(true);
      const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
      const data = await res.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setValue("address.street", data.logradouro, { shouldValidate: true });
      setValue("address.city", data.localidade, { shouldValidate: true });
      setValue("address.state", data.uf, { shouldValidate: true });
      // Opcional: focar no número
      document.getElementById("address-number")?.focus();
    } catch (err) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setIsSearchingCep(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <MapPin className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Tipo de Atendimento
          </h2>
        </div>
      </div>

      {/* Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <label
          className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
            isDelivery
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-gray-200 hover:bg-gray-50 bg-white"
          }`}
        >
          <div className="flex items-center gap-3 mb-1">
            <input
              type="radio"
              value="delivery"
              {...register("fulfillmentType")}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
            />
            <span className="font-bold text-gray-900">Entrega</span>
          </div>
          <p className="text-sm text-gray-500 ml-7">
            Entregar no endereço do cliente
          </p>
        </label>

        <label
          className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
            !isDelivery
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-gray-200 hover:bg-gray-50 bg-white"
          }`}
        >
          <div className="flex items-center gap-3 mb-1">
            <input
              type="radio"
              value="pickup"
              {...register("fulfillmentType")}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
            />
            <span className="font-bold text-gray-900">Retirada na Loja</span>
          </div>
          <p className="text-sm text-gray-500 ml-7">
            Cliente retira na unidade física
          </p>
        </label>
      </div>

      {isDelivery ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* CEP com Autocomplete */}
        <div className="md:col-span-4 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            CEP *
          </label>
          <div className="relative">
            <input
              {...register("address.zip")}
              type="text"
              placeholder="00000-000"
              onBlur={(e) => {
                // Ao sair do campo se tiver 8 chars tenta buscar
                if (e.target.value.replace(/\D/g, "").length === 8) {
                  handleCepSearch();
                }
              }}
              className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white text-sm transition-colors outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.address?.zip
                  ? "border-red-300 focus:border-red-400"
                  : "border-gray-200 focus:border-primary"
              }`}
            />
            <button
              type="button"
              onClick={handleCepSearch}
              disabled={isSearchingCep}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary transition-colors disabled:opacity-50"
            >
              {isSearchingCep ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.address?.zip && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {errors.address.zip.message}
            </p>
          )}
        </div>

        {/* Rua */}
        <div className="md:col-span-8">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Endereço (Rua/Av) *
          </label>
          <input
            {...register("address.street")}
            type="text"
            placeholder="Ex: Rua das Flores"
            className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white text-sm transition-colors outline-none focus:ring-2 focus:ring-primary/20 ${
              errors.address?.street
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-primary"
            }`}
          />
          {errors.address?.street && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {errors.address.street.message}
            </p>
          )}
        </div>

        {/* Numero */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Número *
          </label>
          <input
            {...register("address.number")}
            id="address-number"
            type="text"
            placeholder="123"
            className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white text-sm transition-colors outline-none focus:ring-2 focus:ring-primary/20 ${
              errors.address?.number
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-primary"
            }`}
          />
          {errors.address?.number && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {errors.address.number.message}
            </p>
          )}
        </div>

        {/* Complemento */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Complemento
          </label>
          <input
            {...register("address.comp")}
            type="text"
            placeholder="Apto 12"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white text-sm transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Cidade */}
        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Cidade *
          </label>
          <input
            {...register("address.city")}
            type="text"
            className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white text-sm transition-colors outline-none focus:ring-2 focus:ring-primary/20 ${
              errors.address?.city
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-primary"
            }`}
          />
          {errors.address?.city && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {errors.address.city.message}
            </p>
          )}
        </div>

        {/* UF */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Estado *
          </label>
          <input
            {...register("address.state")}
            type="text"
            placeholder="UF"
            maxLength={2}
            className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white text-sm transition-colors outline-none focus:ring-2 focus:ring-primary/20 uppercase ${
              errors.address?.state
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-primary"
            }`}
          />
          {errors.address?.state && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {errors.address.state.message}
            </p>
          )}
        </div>
      </div>
      ) : (
        <div className="bg-blue-50 text-blue-800 p-5 rounded-xl border border-blue-100 flex items-start gap-4">
          <MapPin className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold mb-1">Retirada Selecionada</h4>
            <p className="text-sm text-blue-700">
              Neste modo, o endereço não é obrigatório. O cliente virá presencialmente 
              buscar os itens na unidade.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSection;
