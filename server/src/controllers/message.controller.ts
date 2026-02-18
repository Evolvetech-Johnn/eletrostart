import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
// Integração Discord removida

/**
 * Cria uma nova mensagem de contato
 * 1. Valida e salva no banco
 * 2. Envia para o Discord
 * 3. Atualiza registro com status do envio
 */
export const createMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { nome, email, telefone, assunto, mensagem } = req.body;

    // Validação
    if (!mensagem) {
      return res.status(400).json({
        error: true,
        message: "A mensagem é obrigatória",
      });
    }

    // Persistir no banco
    const message = await prisma.contactMessage.create({
      data: {
        name: nome || null,
        email: email || null,
        phone: telefone || null,
        subject: assunto || null,
        message: mensagem,
        source: "contact_form",
        status: "NEW",
      },
    });

    // Resposta de sucesso
    res.status(201).json({
      success: true,
      message: "Mensagem enviada com sucesso!",
      data: {
        id: message.id,
      },
    });
  } catch (error) {
    console.error("Erro ao criar mensagem:", error);
    next(error);
  }
};

/**
 * Lista todas as mensagens (pública - limitada)
 */
export const getMessagesPublic = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const count = await prisma.contactMessage.count();

    res.json({
      success: true,
      data: {
        totalMessages: count,
      },
    });
  } catch (error) {
    next(error);
  }
};
