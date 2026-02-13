
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      category: {
        name: {
          contains: 'chuveiro',
          mode: 'insensitive'
        }
      }
    },
    take: 10,
    select: {
      name: true,
      image: true
    }
  });

  console.log(JSON.stringify(products, null, 2));

  const resist = await prisma.product.findMany({
    where: {
      name: {
        contains: 'resistencia',
        mode: 'insensitive'
      }
    },
    take: 10,
    select: {
        name: true,
        image: true
    }
  });
  console.log(JSON.stringify(resist, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
