import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  role: z.enum(["ADMIN", "MANAGER", "EDITOR"]).default("ADMIN"),
  active: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  email: z.string().email("E-mail inválido").optional(),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres").optional(),
  role: z.enum(["ADMIN", "MANAGER", "EDITOR"]).optional(),
  active: z.boolean().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "EDITOR"]),
});

export const updateUserStatusSchema = z.object({
  active: z.boolean(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
  newPassword: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  token: z.string().min(10, "Token inválido"),
});
