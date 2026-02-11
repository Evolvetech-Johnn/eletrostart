import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];

export const env = {
  port: process.env.PORT || 3001,
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
  
  // Discord
  discordToken: process.env.DISCORD_TOKEN,
  discordGuildId: process.env.DISCORD_GUILD_ID,
  discordChannelId: process.env.DISCORD_CHANNEL_ID,
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
};

// Simple validation
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`);
  // In production, we might want to exit, but for dev we'll just warn to avoid crashing if user is setting up
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}
