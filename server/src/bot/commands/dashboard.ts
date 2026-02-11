import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { prisma } from '../../lib/prisma';
import { BotCommand } from '../types.js';

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('Exibe estatísticas do sistema Eletrostart.'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      // Buscar contagens
      const totalMessages = await prisma.contactMessage.count();
      const newMessages = await prisma.contactMessage.count({ where: { status: 'NEW' } });
      const readMessages = await prisma.contactMessage.count({ where: { status: 'READ' } });
      const archivedMessages = await prisma.contactMessage.count({ where: { status: 'ARCHIVED' } });

      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('⚡ Dashboard Eletrostart')
        .setDescription('Resumo em tempo real do sistema.')
        .addFields(
          { name: '📨 Total de Mensagens', value: totalMessages.toString(), inline: true },
          { name: '🆕 Novas', value: newMessages.toString(), inline: true },
          { name: '👀 Lidas', value: readMessages.toString(), inline: true },
          { name: '📂 Arquivadas', value: archivedMessages.toString(), inline: true },
        )
        .setTimestamp()
        .setFooter({ text: 'Eletrostart Bot' });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Erro no comando dashboard:', error);
      await interaction.editReply('Erro ao buscar dados do dashboard.');
    }
  },
};

export default command;
