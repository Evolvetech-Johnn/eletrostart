
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verificando Categorias e Produtos...");

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  console.log(`\n📁 Total de Categorias: ${categories.length}`);
  
  if (categories.length === 0) {
    console.log("❌ Nenhuma categoria encontrada!");
  } else {
    categories.forEach(c => {
      console.log(`\n📂 Categoria: ${c.name} (Slug: ${c.slug})`);
      console.log(`   🖼️ Imagem: ${c.image}`);
      console.log(`   📦 Produtos vinculados: ${c._count.products}`);
    });
  }

  // Check products with no category
  const productsNoCategory = await prisma.product.count({
    where: {
      categoryId: null
    }
  });

  console.log(`\n⚠️ Produtos sem categoria: ${productsNoCategory}`);

  if (productsNoCategory > 0) {
      const examples = await prisma.product.findMany({
          where: { categoryId: null },
          take: 5
      });
      console.log("Exemplos de produtos sem categoria:");
      examples.forEach(p => console.log(`- ${p.name} (ID: ${p.id})`));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
