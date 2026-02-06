import {
  REST,
  Routes,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { BotCommand } from "./types";

dotenv.config();

export const deployCommands = async (guildId: string | null = null) => {
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
  const commandsPath = path.join(__dirname, "commands");

  if (!fs.existsSync(commandsPath)) {
    console.warn("⚠️  Nenhum comando encontrado para deploy.");
    return;
  }

  // Support both .ts and .js
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commandModule = await import(`file://${filePath}`);
    const command: BotCommand = commandModule.default;

    if (command && "data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[AVISO] O comando em ${filePath} está faltando a propriedade "data" ou "execute".`,
      );
    }
  }

  if (!process.env.DISCORD_BOT_TOKEN) {
    console.error("❌ Token do Discord não encontrado!");
    return;
  }

  const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

  try {
    console.log(
      `Iniciando refresh de ${commands.length} application (/) commands.`,
    );

    const targetGuildId = guildId || process.env.DISCORD_GUILD_ID;

    if (process.env.DISCORD_CLIENT_ID && targetGuildId) {
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.DISCORD_CLIENT_ID,
          targetGuildId,
        ),
        { body: commands },
      );
      console.log(
        `✅ Comandos (Guild: ${targetGuildId}) registrados com sucesso!`,
      );
    } else {
      if (process.env.DISCORD_CLIENT_ID) {
        await rest.put(
          Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
          { body: commands },
        );
        console.log("✅ Comandos (Global) registrados com sucesso!");
      }
    }
  } catch (error) {
    console.error(error);
  }
};
