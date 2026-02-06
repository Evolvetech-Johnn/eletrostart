import { Events, Interaction } from "discord.js";
import { BotEvent } from "../types.js";

const event: BotEvent = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    // Use 'as any' or extend Client properly to access commands
    // In our types.ts we declared module augmentation, so it should be available if imported
    // But at runtime we need to make sure it's there.
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`,
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "Houve um erro ao executar esse comando!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "Houve um erro ao executar esse comando!",
          ephemeral: true,
        });
      }
    }
  },
};

export default event;
