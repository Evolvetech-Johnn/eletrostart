// Serviço de integração com Discord
import dotenv from 'dotenv';
dotenv.config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

/**
 * Envia uma mensagem de contato para o Discord
 * @param {Object} data - Dados da mensagem
 * @returns {Object} - Resultado do envio { success: boolean, messageId?: string }
 */
export const sendToDiscord = async (data) => {
  if (!DISCORD_WEBHOOK_URL) {
    console.error('Discord Webhook URL não configurada');
    return { success: false, error: 'Webhook não configurado' };
  }

  const embed = {
    title: '📩 Nova Mensagem de Contato - Eletrostart',
    color: 2252955, // Cor #222998 em decimal
    fields: [
      { name: '👤 Nome', value: data.name || 'Não informado', inline: true },
      { name: '📞 Telefone', value: data.phone || 'Não informado', inline: true },
      { name: '📧 E-mail', value: data.email || 'Não informado', inline: false },
      { name: '📋 Assunto', value: data.subject || 'Não selecionado', inline: false },
      { name: '💬 Mensagem', value: data.message || 'Sem mensagem', inline: false },
      { name: '🆔 ID', value: data.id || 'N/A', inline: true },
      { name: '📅 Data', value: new Date().toLocaleString('pt-BR'), inline: true }
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: 'Formulário de Contato - eletrostart.com.br'
    }
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL + '?wait=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Eletrostart Bot',
        avatar_url: 'https://i.imgur.com/5tqvJzY.png',
        embeds: [embed]
      })
    });

    if (response.ok) {
      const result = await response.json();
      return { 
        success: true, 
        messageId: result.id 
      };
    } else {
      const errorText = await response.text();
      console.error('Erro do Discord:', errorText);
      return { 
        success: false, 
        error: `Discord respondeu com status ${response.status}` 
      };
    }
  } catch (error) {
    console.error('Erro ao enviar para Discord:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};
