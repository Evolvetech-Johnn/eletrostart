import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const deployCommands = async (guildId = null) => {
  const commands = [];
  const commandsPath = path.join(__dirname, "commands");

  if (!fs.existsSync(commandsPath)) {
    console.warn("⚠️  Nenhum comando encontrado para deploy.");
    return;
  }

  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    // Dynamic import for ES modules
    const command = await import(`file://${filePath}`);

    if ("data" in command.default && "execute" in command.default) {
      commands.push(command.default.data.toJSON());
    } else {
      console.log(
        `[AVISO] O comando em ${filePath} está faltando a propriedade "data" ou "execute".`
      );
    }
  }

  const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

  try {
    console.log(
      `Iniciando refresh de ${commands.length} application (/) commands.`
    );

    // Se tiver GUILD_ID, registra apenas para o servidor de teste (mais rápido)
    // Se não, registra globalmente (pode levar 1 hora)
    if (process.env.DISCORD_GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.DISCORD_CLIENT_ID,
          process.env.DISCORD_GUILD_ID
        ),
        { body: commands }
      );
      console.log("✅ Comandos (Guild) registrados com sucesso!");
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
        { body: commands }
      );
      console.log("✅ Comandos (Global) registrados com sucesso!");
    }
  } catch (error) {
    console.error(error);
  }
};
