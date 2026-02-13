
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst({
    where: {
      image: {
        contains: 'img',
      }
    },
    select: {
      image: true
    }
  });
  console.log('IMAGE_PATH:', product?.image);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
