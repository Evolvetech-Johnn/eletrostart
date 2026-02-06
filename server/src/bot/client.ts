import { Client, GatewayIntentBits, Collection } from "discord.js";
import dotenv from "dotenv";
import { BotCommand } from "./types.js";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.commands = new Collection<string, BotCommand>();

export default client;
