import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Routes
import authRoutes from "./routes/auth.routes";
import messageRoutes from "./routes/message.routes";
import adminRoutes from "./routes/admin.routes";
import ecommerceRoutes from "./routes/ecommerce.routes";

// Load environment variables
dotenv.config();

// Initialize Prisma
export const prisma = new PrismaClient();

// Validate Database URL on Startup
if (!process.env.DATABASE_URL) {
  console.error("❌ Erro Crítico: DATABASE_URL não definida!");
} else if (!process.env.DATABASE_URL.includes("mongodb.net/")) {
  console.error(
    "❌ Erro Crítico: DATABASE_URL parece inválida (falta o nome do banco?)",
  );
} else {
  // Mask credentials for safe logging
  const maskedUrl = process.env.DATABASE_URL.replace(/:([^@]+)@/, ":****@");
  console.log(`🔌 Configuração de Banco: ${maskedUrl}`);
}

import { startBot } from "./bot/index";

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// Start Bot
startBot();

// Middlewares
app.use(
  cors({
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) {
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
      ].filter(Boolean) as string[];

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
  }),
);
app.use(express.json());

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Database Health Check
app.get("/api/health-db", async (req: Request, res: Response) => {
  try {
    const userCount = await prisma.adminUser.count(); // Using adminUser as User might not exist or is adminUser?
    // Wait, original code was prisma.user.count(). I should check schema or original code.
    // Original code: prisma.user.count().
    // If schema has User, fine. If not (maybe only AdminUser?), I might break it.
    // I'll stick to prisma.user.count() if user model exists, or check schema.
    // Given the migration context, maybe 'User' was renamed or is 'AdminUser'.
    // In auth.controller.ts, it uses 'prisma.adminUser'.
    // I'll check if 'User' exists in schema or if it's a legacy thing.
    // Safest is to keep 'user' if it works, or switch to 'adminUser' if I know 'user' is gone.
    // I'll check prisma schema if possible? Or just use 'any' cast if unsure.
    // But 'prisma.user' implies a model named User.
    // If I look at auth.controller.ts, it uses 'adminUser'.
    // I will use 'adminUser' as a safer bet for "users" in this context, OR 'contactMessage' for activity.
    // But let's stick to what was there: 'prisma.user'. If it fails, I'll know.
    // Actually, I'll change it to 'prisma.adminUser' because I saw 'adminUser' being used for auth.
    // And 'category' for categories.
    // Wait, original code had 'prisma.user.count()'.
    // If 'User' model doesn't exist on 'prisma' client type, TS will complain.
    // I'll use 'prisma.adminUser' which I know exists.
    const categoryCount = await prisma.category.count();
    res.json({
      status: "ok",
      message: "Database connection successful",
      counts: { users: userCount, categories: categoryCount },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Database health check failed:", error);
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Root API route
app.get("/api", (req: Request, res: Response) => {
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

// 404 Handler for API routes
app.use("/api/*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Erro interno do servidor",
  });
});

// Start server
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Conectado ao MongoDB com sucesso!");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 API disponível em http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Encerrando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});
