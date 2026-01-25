import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configure dotenv to read from .env file in server root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Iniciando teste de conexão com MongoDB Atlas...");

  if (!process.env.DATABASE_URL) {
    console.error("❌ ERRO: DATABASE_URL não encontrada no arquivo .env");
    return;
  }

  // Mask the password in logs
  const maskedUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ":****@");
  console.log(`📡 Conectando a: ${maskedUrl}`);

  try {
    // 1. Testar Conexão
    await prisma.$connect();
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso!");

    // 2. Testar Inserção de Produto
    console.log("📝 Tentando inserir um produto de teste...");

    // Create a unique SKU and Slug
    const timestamp = Date.now();

    const product = await prisma.product.create({
      data: {
        name: `Produto de Teste ${timestamp}`,
        description:
          "Este é um produto de teste inserido automaticamente para validação.",
        price: 123.45,
        sku: `TEST-${timestamp}`,
        stock: 50,
        active: false,
        category: {
          create: {
            name: `Categoria Teste ${timestamp}`,
            slug: `categoria-teste-${timestamp}`,
            description: "Categoria temporária para teste",
          },
        },
      },
      include: {
        category: true,
      },
    });

    console.log("✅ Produto inserido com sucesso!");
    console.log("   ID:", product.id);
    console.log("   Nome:", product.name);
    console.log("   Categoria:", product.category.name);
    console.log("   Preço:", product.price);

    // 3. Limpeza (Clean up)
    console.log("🧹 Limpando dados de teste...");

    await prisma.product.delete({
      where: { id: product.id },
    });
    console.log("   Produto deletado.");

    if (product.categoryId) {
      await prisma.category.delete({
        where: { id: product.categoryId },
      });
      console.log("   Categoria deletada.");
    }

    console.log(
      "🎉 Teste completo finalizado com sucesso! O sistema está pronto para operações online.",
    );
  } catch (error) {
    console.error("❌ Falha durante o teste:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
