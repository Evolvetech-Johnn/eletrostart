import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to resolve Prisma Client from server directory
const serverPrismaPath = path.resolve(
  __dirname,
  "../server/node_modules/@prisma/client/index.js",
);

let PrismaClient;
try {
  // Dynamic import to handle ESM/CJS mismatch or path issues
  const prismaModule = await import(serverPrismaPath);
  PrismaClient = prismaModule.PrismaClient;
} catch (e) {
  console.error(
    "Failed to import PrismaClient from server node_modules. Trying default require...",
  );
  try {
    const {
      PrismaClient: PC,
    } = require("../server/node_modules/@prisma/client");
    PrismaClient = PC;
  } catch (e2) {
    console.error(
      "Could not load PrismaClient. Make sure dependencies are installed in server/",
      e2,
    );
    process.exit(1);
  }
}

const reportFile = path.join(__dirname, "../reports/audit-products-db.json");

// Load environment variables manually from server/.env
function loadEnv() {
  const envPath = path.join(__dirname, "../server/.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnv();

async function auditProducts() {
  console.log("Starting product DB audit...");
  const prisma = new PrismaClient();

  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        image: true,
      },
    });

    const productsMissingImage = products.filter(
      (p) => !p.image || p.image.trim() === "",
    );

    // Simple check for broken paths (basic validation, real check in diff)
    const productsWithBrokenImagePath = products.filter((p) => {
      if (!p.image) return false;
      // Check if it starts with /img/
      return !p.image.startsWith("/img/");
    });

    const imagePathsInDb = [
      ...new Set(products.map((p) => p.image).filter(Boolean)),
    ];

    const result = {
      totalProducts: products.length,
      allProducts: products.map((p) => ({
        id: p.id,
        name: p.name,
        image: p.image,
        category: p.category,
      })),
      productsMissingImage,
      productsWithBrokenImagePath, // This is just format check here
      imagePathsInDb,
    };

    fs.writeFileSync(reportFile, JSON.stringify(result, null, 2));
    console.log(`Product DB audit saved to ${reportFile}`);
  } catch (error) {
    console.error("Error querying database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

auditProducts();
