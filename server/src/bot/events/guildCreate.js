import { Events } from "discord.js";
import { deployCommands } from "../deploy.js";

export default {
  name: Events.GuildCreate,
  async execute(guild) {
    console.log(
      `🎉 Bot entrou em um novo servidor: ${guild.name} (${guild.id})`
    );

    // Registrar comandos para este servidor específico imediatamente
    await deployCommands(guild.id);
  },
};
