// Serviço de integração com Discord
import dotenv from "dotenv";
import { EmbedBuilder, TextChannel } from "discord.js";
import client from "../bot/client.js";

dotenv.config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

export interface DiscordMessageData {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message: string;
}

export interface DiscordSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface DiscordOrderData {
  id: string;
  customerName: string;
  customerPhone: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    code?: string;
  }[];
  total: number;
  paymentMethod: string;
}

/**
 * Envia uma notificação de novo pedido para o Discord
 */
export const sendOrderToDiscord = async (
  data: DiscordOrderData,
): Promise<DiscordSendResult> => {
  const itemsList = data.items
    .map(
      (item) =>
        `- ${item.productName} (x${item.quantity}) - R$ ${item.unitPrice.toFixed(2)}`,
    )
    .join("\n");

  // Limitar o tamanho da lista de itens se for muito grande
  const formattedItems =
    itemsList.length > 1000
      ? itemsList.substring(0, 1000) + "\n... (lista truncada)"
      : itemsList;

  const embed = new EmbedBuilder()
    .setTitle("🛒 Novo Pedido Realizado!")
    .setColor(0x00ff00) // Green
    .addFields(
      { name: "👤 Cliente", value: data.customerName, inline: true },
      { name: "📞 Telefone", value: data.customerPhone || "N/A", inline: true },
      {
        name: "💰 Total",
        value: `R$ ${data.total.toFixed(2)}`,
        inline: true,
      },
      {
        name: "💳 Pagamento",
        value: data.paymentMethod || "Não informado",
        inline: true,
      },
      { name: "🆔 ID do Pedido", value: data.id, inline: true },
      {
        name: "📦 Itens",
        value: formattedItems || "Nenhum item",
        inline: false,
      },
      {
        name: "📅 Data",
        value: new Date().toLocaleString("pt-BR"),
        inline: true,
      },
    )
    .setTimestamp()
    .setFooter({ text: "Sistema de Pedidos - eletrostart.com.br" });

  // 1. Tentar enviar via Bot Client
  if (client.isReady() && DISCORD_CHANNEL_ID) {
    try {
      const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
      if (channel && channel.isSendable() && channel.isTextBased()) {
        const textChannel = channel as TextChannel;
        const message = await textChannel.send({ embeds: [embed] });
        return { success: true, messageId: message.id };
      }
    } catch (error) {
      console.error(
        "Erro ao enviar pedido via Bot Client (tentando webhook):",
        error,
      );
    }
  }

  // 2. Fallback para Webhook
  if (!DISCORD_WEBHOOK_URL) {
    console.error("Discord Webhook URL não configurada");
    return { success: false, error: "Configuração do Discord ausente" };
  }

  try {
    const webhookEmbed = {
      title: embed.data.title,
      color: embed.data.color,
      fields: embed.data.fields,
      timestamp: embed.data.timestamp,
      footer: embed.data.footer,
    };

    const response = await fetch(DISCORD_WEBHOOK_URL + "?wait=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [webhookEmbed],
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord API responded with ${response.status}`);
    }

    const result = await response.json();
    return { success: true, messageId: (result as any).id };
  } catch (error: any) {
    console.error("Erro ao enviar pedido para Discord via Webhook:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Envia uma mensagem de contato para o Discord
 * Tenta usar o Bot Client primeiro, depois fallback para Webhook
 * @param {DiscordMessageData} data - Dados da mensagem
 * @returns {Promise<DiscordSendResult>} - Resultado do envio
 */
export const sendToDiscord = async (
  data: DiscordMessageData,
): Promise<DiscordSendResult> => {
  const embed = new EmbedBuilder()
    .setTitle("📩 Nova Mensagem de Contato - Eletrostart")
    .setColor(0x222998)
    .addFields(
      { name: "👤 Nome", value: data.name || "Não informado", inline: true },
      {
        name: "📞 Telefone",
        value: data.phone || "Não informado",
        inline: true,
      },
      {
        name: "📧 E-mail",
        value: data.email || "Não informado",
        inline: false,
      },
      {
        name: "📋 Assunto",
        value: data.subject || "Não selecionado",
        inline: false,
      },
      {
        name: "💬 Mensagem",
        value: data.message || "Sem mensagem",
        inline: false,
      },
      { name: "🆔 ID", value: data.id || "N/A", inline: true },
      {
        name: "📅 Data",
        value: new Date().toLocaleString("pt-BR"),
        inline: true,
      },
    )
    .setTimestamp()
    .setFooter({ text: "Formulário de Contato - eletrostart.com.br" });

  // 1. Tentar enviar via Bot Client
  if (client.isReady() && DISCORD_CHANNEL_ID) {
    try {
      const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
      if (channel && channel.isSendable() && channel.isTextBased()) {
        const textChannel = channel as TextChannel;
        const message = await textChannel.send({ embeds: [embed] });
        return { success: true, messageId: message.id };
      }
    } catch (error) {
      console.error("Erro ao enviar via Bot Client (tentando webhook):", error);
    }
  }

  // 2. Fallback para Webhook
  if (!DISCORD_WEBHOOK_URL) {
    console.error("Discord Webhook URL não configurada e Bot indisponível");
    return { success: false, error: "Configuração do Discord ausente" };
  }

  try {
    // Adapter para formato de webhook raw
    const webhookEmbed = {
      title: embed.data.title,
      color: embed.data.color,
      fields: embed.data.fields,
      timestamp: embed.data.timestamp,
      footer: embed.data.footer,
    };

    const response = await fetch(DISCORD_WEBHOOK_URL + "?wait=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Eletrostart Bot",
        avatar_url: "https://i.imgur.com/5tqvJzY.png",
        embeds: [webhookEmbed],
      }),
    });

    if (response.ok) {
      const result = (await response.json()) as { id: string };
      return {
        success: true,
        messageId: result.id,
      };
    } else {
      const errorText = await response.text();
      console.error("Erro do Discord:", errorText);
      return {
        success: false,
        error: `Discord respondeu com status ${response.status}`,
      };
    }
  } catch (error: any) {
    console.error("Erro ao enviar para Discord:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
