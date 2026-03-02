import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Selecione um produto"),
  quantity: z.number().int().min(1, "Mínimo 1 unidade"),
  unitPrice: z.number().min(0).optional(),
});

export const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    phone: z.string().optional(),
    doc: z.string().optional().refine((val) => {
      if (!val) return true; // optional
      const digits = val.replace(/\D/g, "");
      return digits.length === 11 || digits.length === 14;
    }, "CPF/CNPJ inválido"),
  }),
  address: z.object({
    zip: z.string().min(8, "CEP inválido"),
    street: z.string().min(3, "Rua obrigatória"),
    number: z.string().min(1, "Número obrigatório"),
    comp: z.string().optional(),
    city: z.string().min(2, "Cidade obrigatória"),
    state: z.string().length(2, "UF inválida (ex: SP)"),
  }),
  items: z.array(orderItemSchema).min(1, "Adicione pelo menos 1 item ao pedido"),
  paymentMethod: z.string().min(1, "Selecione a forma de pagamento"),
  notes: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof orderSchema>;
