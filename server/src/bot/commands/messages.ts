import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { prisma } from '../../index.js';
import { BotCommand } from '../types.js';

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('mensagens')
    .setDescription('Lista as mensagens de contato mais recentes.')
    .addStringOption(option =>
      option.setName('status')
        .setDescription('Filtrar por status')
        .setRequired(false)
        .addChoices(
          { name: 'Novas', value: 'NEW' },
          { name: 'Lidas', value: 'READ' },
          { name: 'Arquivadas', value: 'ARCHIVED' }
        )
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const status = interaction.options.getString('status');
    const where = status ? { status } : {};

    try {
      const messages = await prisma.contactMessage.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' }
      });

      if (messages.length === 0) {
        await interaction.editReply('Nenhuma mensagem encontrada.');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(status ? `Últimas Mensagens (${status})` : 'Últimas Mensagens')
        .setTimestamp();

      messages.forEach(msg => {
        embed.addFields({
          name: `${msg.subject || 'Sem assunto'} - ${msg.name}`,
          value: `📅 ${msg.createdAt.toLocaleDateString('pt-BR')} | Status: ${msg.status}\nID: ${msg.id}`
        });
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      await interaction.editReply('Erro ao buscar mensagens.');
    }
  },
};

export default command;
