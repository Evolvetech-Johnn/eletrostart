import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

import { orderSchema, OrderFormValues } from "./schema/orderSchema";
import { orderService } from "../../../services/orderService";
import AdminLayout from "../components/AdminLayout";
import CustomerSection from "./components/CustomerSection";
import AddressSection from "./components/AddressSection";
import OrderItemsTable from "./components/OrderItemsTable";
import OrderSummaryCard from "./components/OrderSummaryCard";

const NewOrderPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const methods = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer: { name: "", email: "", phone: "", doc: "" },
      address: { zip: "", street: "", number: "", comp: "", city: "", state: "" },
      items: [{ productId: "", quantity: 1, unitPrice: 0 }],
      paymentMethod: "pix",
      notes: "",
    },
    mode: "onTouched",
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const createMutation = useMutation({
    mutationFn: (data: OrderFormValues) => orderService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Pedido criado com sucesso!");
      navigate("/admin/orders");
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro desconhecido ao criar pedido");
    }
  });

  const onSubmit = (data: OrderFormValues) => {
    // Validar se tem item (já abordado no zod, mas fallback de segurança)
    if (!data.items || data.items.length === 0) {
      toast.error("Adicione pelo menos um item");
      return;
    }
    createMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pb-12">
        {/* Header (Back + Title) */}
        <div className="flex items-center gap-4 mb-6 pt-2">
          <Link
            to="/admin/orders"
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Criar Pedido
          </h1>
        </div>

        {/* Form Grid */}
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"
          >
            {/* Lado Esquerdo - Campos (8 colunas) */}
            <div className="xl:col-span-8 space-y-8">
              <CustomerSection />
              <AddressSection />
              <OrderItemsTable />
            </div>

            {/* Lado Direito - Summary Fixado (4 colunas) */}
            <div className="xl:col-span-4 sticky top-6">
              <OrderSummaryCard isLoading={isSubmitting} />
            </div>
          </form>
        </FormProvider>
      </div>
    </AdminLayout>
  );
};

export default NewOrderPage;
