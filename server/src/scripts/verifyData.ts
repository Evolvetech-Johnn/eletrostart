import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying Data...');
  
  const categoriesCount = await prisma.category.count();
  const productsCount = await prisma.product.count();
  const ordersCount = await prisma.order.count();
  
  console.log(`Categories: ${categoriesCount}`);
  console.log(`Products: ${productsCount}`);
  console.log(`Orders: ${ordersCount}`);
  
  const products = await prisma.product.findMany({
    take: 5,
    include: { category: true }
  });
  
  console.log('\nSample Products:');
  products.forEach(p => {
    console.log(`- ${p.name} (${p.category?.name || 'No Category'}) - R$ ${p.price}`);
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
