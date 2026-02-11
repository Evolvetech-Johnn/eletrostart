import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Nome do produto é obrigatório"),
  description: z.string().optional(),
  price: z.number().min(0, "Preço deve ser maior ou igual a 0"),
  stock: z.number().int().min(0, "Estoque deve ser maior ou igual a 0"),
  categoryId: z.string().optional().nullable(),
  subcategory: z.string().optional().nullable(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  code: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  image: z.string().optional(),
  unit: z.string().optional(),
  variants: z.any().optional(),
  features: z.any().optional(),
  specifications: z.any().optional(),
  images: z.any().optional(),
});

export const updateProductSchema = createProductSchema.partial();
