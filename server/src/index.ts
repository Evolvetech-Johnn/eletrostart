import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { issueCsrfToken, verifyCsrfToken } from "./middlewares/csrf.middleware";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import { prisma } from "./lib/prisma";

// Routes
import authRoutes from "./routes/auth.routes";
import messageRoutes from "./routes/message.routes";
import adminRoutes from "./routes/admin.routes";
import customerRoutes from "./routes/customer.routes"; // [NEW] Módulo de Clientes
import ecommerceRoutes from "./routes/ecommerce.routes";
import executiveRoutes from "./modules/executive/routes";
import paymentRoutes from "./routes/payment.routes";
import { logisticsRoutes } from "./modules/logistics/routes";
import { initAnalyticsCron } from "./cron/analytics.cron";
import { initReservationCron } from "./cron/reservation.cron";
import * as Sentry from "@sentry/node";

// Sentry Initialization
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 1.0,
  });
  console.log("🛡️ Sentry iniciado no Backend");
}

// Validate Database URL on Startup
if (!env.databaseUrl) {
  console.error("❌ Erro Crítico: DATABASE_URL não definida!");
} else if (!env.databaseUrl.includes("mongodb.net/")) {
  console.error(
    "❌ Erro Crítico: DATABASE_URL parece inválida (falta o nome do banco?)",
  );
} else {
  // Mask credentials for safe logging
  const maskedUrl = env.databaseUrl.replace(/:([^@]+)@/, ":****@");
  console.log(`🔌 Configuração de Banco: ${maskedUrl}`);
}


// Initialize Express
const app = express();
const PORT = env.port;

// Trust Proxy (Essential for secure cookies on Render)
app.set("trust proxy", 1);

// Security & CORS
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
        env.frontendUrl,
      ]
        .concat(
          (env.corsOrigin || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        )
        .filter(Boolean) as string[];

      // Permitir requisições sem origin (ex: Postman, curl, Mobile Apps)
      if (!origin) return callback(null, true);

      // Verificação robusta de origens permitidas
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith(".netlify.app") ||
        origin.includes("eletrostart.com.br") ||
        origin.includes("onrender.com") || // Permite todos os subdomínios onrender para evitar problemas
        origin.includes("vercel.app")
      ) {
        callback(null, true);
      } else {
        console.log("🚫 Bloqueado por CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-CSRF-Token"],
    exposedHeaders: ["X-CSRF-Token"],
  }),
);

app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Muitas requisições deste IP, tente novamente mais tarde.",
});
app.use("/api/", limiter);


// Middlewares
app.use(express.json());
app.use(cookieParser());
// Issue CSRF token to all clients (cookie legível por JS)
app.use(issueCsrfToken);

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Database Health Check
app.get("/api/health-db", async (req: Request, res: Response) => {
  try {
    const userCount = await prisma.adminUser.count();
    res.json({ status: "ok", userCount });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Database connection failed" });
  }
});

// API Routes
app.use("/api/auth", authRoutes);

// Proteção CSRF global para todas as outras rotas /api (exceto payments que recebe webhooks)
// O verifyCsrfToken já ignora métodos seguros (GET, HEAD, OPTIONS)
app.use("/api/messages", verifyCsrfToken, messageRoutes);
app.use("/api/admin", verifyCsrfToken, adminRoutes);
app.use("/api/admin/customers", verifyCsrfToken, customerRoutes);
app.use("/api/ecommerce", verifyCsrfToken, ecommerceRoutes);
app.use("/api/executive", verifyCsrfToken, executiveRoutes);
app.use("/api/logistics", verifyCsrfToken, logisticsRoutes);

// Payment routes — sem CSRF para permitir webhooks externos do MercadoPago
app.use("/api/payments", paymentRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Frontend URL: ${env.frontendUrl}`);
  initAnalyticsCron();
  initReservationCron();
});
