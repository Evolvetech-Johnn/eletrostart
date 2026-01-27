import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Routes
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import ecommerceRoutes from "./routes/ecommerce.routes.js";

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
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://eletrostart.com.br",
        "https://www.eletrostart.com.br",
        "https://eletrostart-site.onrender.com",
        "https://eletrostartbackend-api.onrender.com",
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      // Permitir requisições sem origin (ex: Postman, curl, Mobile Apps)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith(".netlify.app")
      ) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
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

// Database Health Check
app.get("/api/health-db", async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    res.json({ 
      status: "ok", 
      message: "Database connection successful", 
      counts: { users: userCount, categories: categoryCount },
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    res.status(500).json({ 
      status: "error", 
      message: "Database connection failed", 
      error: error.message 
    });
  }
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
app.use("/api/store", ecommerceRoutes);
app.use("/api/ecommerce", ecommerceRoutes); // Alias for ecommerce endpoints

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
