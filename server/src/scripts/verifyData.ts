import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Validando Dados do Banco...");

  const targetName = "TUBULAR"; // Altere para testar outros nomes
  console.log(`\n🔎 Buscando por produtos contendo "${targetName}"...`);

  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: targetName,
        mode: "insensitive",
      },
    },
    take: 10,
  });

  if (products.length === 0) {
    console.log("❌ Nenhum produto encontrado.");
  } else {
    console.log(
      `✅ Encontrados ${products.length} produtos (mostrando max 10):`,
    );
    products.forEach((p) => {
      console.log(`\n📦 Produto: ${p.name}`);
      console.log(`   💰 Preço: R$ ${p.price.toFixed(2)}`);
      console.log(`   🏷️  Código: ${p.code || "N/A"}`);
      console.log(`   🖼️  Imagem: ${p.image}`);
      console.log(`   🆔 ID: ${p.id}`);
    });
  }

  const count = await prisma.product.count();
  console.log(`\n📊 Total de produtos no banco: ${count}`);

  const categories = await prisma.category.count();
  console.log(`📁 Total de categorias: ${categories}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
