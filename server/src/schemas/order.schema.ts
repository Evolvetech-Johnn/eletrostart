import { z } from "zod";

export const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    doc: z.string().optional(),
  }),
  address: z.object({
    zip: z.string().min(8, "CEP inválido"),
    street: z.string().min(1, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    comp: z.string().optional(),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().length(2, "Estado deve ter 2 letras"),
  }),
  items: z.array(
    z.object({
      productId: z.string().min(1, "ID do produto é obrigatório"),
      quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
    })
  ).min(1, "O pedido deve ter pelo menos um item"),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});
