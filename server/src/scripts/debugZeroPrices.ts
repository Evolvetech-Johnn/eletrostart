
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkZeroPrices() {
  const zeroPriceProducts = await prisma.product.findMany({
    where: {
      OR: [
        { price: 0 },
        { price: { lt: 0.01 } } // Float safety
      ]
    },
    select: {
      id: true,
      name: true,
      price: true,
      sku: true,
      code: true
    }
  });

  console.log(`Found ${zeroPriceProducts.length} products with zero price.`);
  if (zeroPriceProducts.length > 0) {
    console.log('Sample:', zeroPriceProducts.slice(0, 5));
  }
}

checkZeroPrices()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
