import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verifying Data...");

  const categoriesCount = await prisma.category.count();
  const productsCount = await prisma.product.count();
  const ordersCount = await prisma.order.count();

  console.log(`Categories: ${categoriesCount}`);
  console.log(`Products: ${productsCount}`);
  console.log(`Orders: ${ordersCount}`);

  const targetName = "LUVA";
  console.log(`\n🔍 Searching for "${targetName}"...`);

  const targetProducts = await prisma.product.findMany({
    where: { name: { contains: targetName, mode: "insensitive" } },
    take: 50,
  });

  if (targetProducts.length > 0) {
    console.log(`✅ FOUND ${targetProducts.length} matches:`);
    targetProducts.forEach((p) => {
      // Filter mainly relevant ones
      if (p.name.includes("3/4") || p.name.includes("PVC")) {
        console.log(
          `   ID: ${p.id} | Name: "${p.name}" | Price: R$ ${p.price} | SKU: ${p.sku}`,
        );
      }
    });
  } else {
    console.log(`❌ NOT FOUND: "${targetName}"`);
  }

  const products = await prisma.product.findMany({
    take: 5,
    include: { category: true },
  });

  console.log("\nSample Products:");
  products.forEach((p) => {
    console.log(
      `- ${p.name} (${p.category?.name || "No Category"}) - R$ ${p.price}`,
    );
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
