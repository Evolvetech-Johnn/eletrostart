import { z } from "zod";

export const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().min(1, "Telefone é obrigatório"),
    doc: z.string().optional(),
  }),
  deliveryMode: z.enum(["delivery", "pickup", "entrega", "retirada"]).default("entrega").optional(),
  address: z.object({
    zip: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    comp: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }).optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, "ID do produto é obrigatório"),
      quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
    })
  ).min(1, "O pedido deve ter pelo menos um item"),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  sessionId: z.string().optional(),
  status: z.enum([
    "aguardando", 
    "em_separacao", 
    "pronto_para_retirada", 
    "saiu_para_entrega", 
    "entregue", 
    "cancelado"
  ]).default("aguardando").optional(),
}).superRefine((data, ctx) => {
  if (data.deliveryMode === "delivery" || data.deliveryMode === "entrega" || !data.deliveryMode) {
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
