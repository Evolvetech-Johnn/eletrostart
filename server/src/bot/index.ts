import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import client from "./client.js";
import { deployCommands } from "./deploy.js";
import { BotCommand, BotEvent } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const startBot = async () => {
  if (!process.env.DISCORD_BOT_TOKEN) {
    console.log(
      "⚠️  Token do Discord não configurado. O bot não será iniciado.",
    );
    return;
  }

  // Carregar Comandos
  const commandsPath = path.join(__dirname, "commands");
  if (fs.existsSync(commandsPath)) {
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const commandModule = await import(`file://${filePath}`);
      const command: BotCommand = commandModule.default;

      if (command && "data" in command && "execute" in command) {
        // @ts-ignore - name property exists on command.data
        client.commands.set(command.data.name, command);
      }
    }
  }

  // Carregar Eventos
  const eventsPath = path.join(__dirname, "events");
  if (fs.existsSync(eventsPath)) {
    const eventFiles = fs
      .readdirSync(eventsPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file);
      const eventModule = await import(`file://${filePath}`);
      const event: BotEvent = eventModule.default;

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
    }
  }

  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
    // Opcional: Deploy automático no início (pode ser removido em prod para evitar rate limit)
    // await deployCommands();
  } catch (error) {
    console.error("❌ Erro ao iniciar o bot do Discord:", error);
  }
};

export const stopBot = () => {
  client.destroy();
};
