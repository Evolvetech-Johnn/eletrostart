import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Routes
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// Load environment variables
dotenv.config();

// Initialize Prisma
export const prisma = new PrismaClient();

import { startBot } from "./bot/index.js";

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// Start Bot
startBot();

// Middlewares
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        process.env.FRONTEND_URL,
        // Adicione a URL do Netlify aqui se já tiver (ex: 'https://seu-site.netlify.app')
      ].filter(Boolean); // Remove valores nulos/undefined

      // Permitir requisições sem origin (ex: Postman, curl, Mobile Apps)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith(".netlify.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Root API route
app.get("/api", (req, res) => {
  res.json({
    message: "Eletrostart API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      messages: "/api/messages",
      admin: "/api/admin",
    },
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Erro interno do servidor",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Encerrando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});
