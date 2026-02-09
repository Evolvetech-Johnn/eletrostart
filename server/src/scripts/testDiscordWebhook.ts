import dotenv from "dotenv";
import path from "path";
import { sendOrderToDiscord } from "../services/discord.service";

// Setup environment
// Assumes running from server/ root
dotenv.config({ path: path.join(process.cwd(), ".env") });

async function testWebhook() {
  console.log("🚀 Testing Discord Webhook...");
  console.log(
    "URL:",
    process.env.DISCORD_WEBHOOK_URL ? "Defined ✅" : "Missing ❌",
  );

  const dummyOrder = {
    id: "TEST-" + Date.now(),
    customerName: "Usuário de Teste (Trae AI)",
    customerPhone: "(11) 99999-9999",
    total: 150.5,
    paymentMethod: "PIX",
    items: [
      {
        productName: "Produto Exemplo A",
        quantity: 2,
        unitPrice: 50.0,
        code: "TEST-001",
      },
      {
        productName: "Produto Exemplo B",
        quantity: 1,
        unitPrice: 50.5,
        code: "TEST-002",
      },
    ],
  };

  try {
    const result = await sendOrderToDiscord(dummyOrder);
    if (result.success) {
      console.log("✅ Message sent successfully!");
      if (result.messageId) console.log("Message ID:", result.messageId);
    } else {
      console.error("❌ Failed to send message:", result.error);
    }
  } catch (error) {
    console.error("❌ Exception:", error);
  }
}

testWebhook();
