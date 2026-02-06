import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { BotCommand } from '../types.js';

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responde com Pong! e latência.'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply(`🏓 Pong! Latência: ${Date.now() - interaction.createdTimestamp}ms.`);
  },
};

export default command;
