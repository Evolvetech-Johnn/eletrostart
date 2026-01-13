import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responde com Pong! e latência.'),
  async execute(interaction) {
    await interaction.reply(`🏓 Pong! Latência: ${Date.now() - interaction.createdTimestamp}ms.`);
  },
};
