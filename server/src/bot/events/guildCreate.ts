import { Events, Guild } from "discord.js";
import { deployCommands } from "../deploy.js";
import { BotEvent } from "../types.js";

const event: BotEvent = {
  name: Events.GuildCreate,
  async execute(guild: Guild) {
    console.log(
      `🎉 Bot entrou em um novo servidor: ${guild.name} (${guild.id})`
    );

    // Registrar comandos para este servidor específico imediatamente
    await deployCommands(guild.id);
  },
};

export default event;
