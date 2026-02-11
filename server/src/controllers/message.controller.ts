import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import {
  sendToDiscord,
  DiscordSendResult,
} from "../services/discord.service.js";

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

    // 1. Persistir no banco ANTES de enviar ao Discord
    const message = await prisma.contactMessage.create({
      data: {
        name: nome || null,
        email: email || null,
        phone: telefone || null,
        subject: assunto || null,
        message: mensagem,
        source: "contact_form",
        discordSent: false,
        status: "NEW",
      },
    });

    // 2. Enviar para o Discord (Tentativa não-bloqueante/segura)
    let discordResult: DiscordSendResult = { success: false };
    try {
      discordResult = await sendToDiscord({
        id: message.id,
        name: message.name,
        email: message.email,
        phone: message.phone,
        subject: message.subject,
        message: message.message,
      });
    } catch (discordError) {
      console.error(
        "Erro ao enviar para Discord (ignorado para resposta ao cliente):",
        discordError,
      );
      // Não falha a requisição se o Discord falhar
    }

    // 3. Atualizar registro com status do envio
    // Se falhar aqui, apenas logamos, pois a mensagem já foi criada e o cliente já pode receber sucesso
    try {
      const updatedMessage = await prisma.contactMessage.update({
        where: { id: message.id },
        data: {
          discordSent: discordResult.success,
          discordMessageId: discordResult.messageId || null,
        },
      });

      // Resposta de sucesso
      res.status(201).json({
        success: true,
        message: "Mensagem enviada com sucesso!",
        data: {
          id: updatedMessage.id,
          discordSent: updatedMessage.discordSent,
        },
      });
    } catch (updateError) {
      console.error(
        "Erro ao atualizar status do Discord no banco:",
        updateError,
      );
      // Mesmo se falhar o update, retornamos sucesso da criação original
      res.status(201).json({
        success: true,
        message: "Mensagem enviada com sucesso!",
        data: {
          id: message.id,
          discordSent: false,
        },
      });
    }
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
