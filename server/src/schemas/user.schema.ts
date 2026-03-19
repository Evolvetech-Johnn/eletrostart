import { z } from "zod";

const roleSchema = z.preprocess(
  (val) => (typeof val === "string" ? val.toUpperCase() : val),
  z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER", "EDITOR", "VIEWER"])
);

export const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  role: roleSchema.default("ADMIN"),
  active: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  email: z.string().email("E-mail inválido").optional(),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres").optional(),
  role: roleSchema.optional(),
  active: z.boolean().optional(),
});

export const updateUserRoleSchema = z.object({
  role: roleSchema,
});

export const updateUserStatusSchema = z.object({
  active: z.boolean(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
  newPassword: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  token: z.string().min(10, "Token inválido"),
});
