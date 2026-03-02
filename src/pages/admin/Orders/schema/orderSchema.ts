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
  fulfillmentType: z.enum(["delivery", "pickup"]).default("delivery").optional(),
  address: z.object({
    zip: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    comp: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }).optional(),
  items: z.array(orderItemSchema).min(1, "Adicione pelo menos 1 item ao pedido"),
  paymentMethod: z.string().min(1, "Selecione a forma de pagamento"),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.fulfillmentType === "delivery" || !data.fulfillmentType) {
    const minAddrError = (field: string) => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${field} é obrigatório para entrega`,
        path: ["address", field.toLowerCase()],
      });
    };
    if (!data.address?.zip) minAddrError("CEP");
    if (!data.address?.street) minAddrError("Rua");
    if (!data.address?.number) minAddrError("Número");
    if (!data.address?.city) minAddrError("Cidade");
    if (!data.address?.state) minAddrError("Estado");
  }
});

export type OrderFormValues = z.infer<typeof orderSchema>;
