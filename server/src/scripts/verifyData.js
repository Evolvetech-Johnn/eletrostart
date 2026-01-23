import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst({
    where: {
      variants: {
        not: "[]"
      }
    }
  });

  if (product) {
    console.log('Product found:', product.name);
    console.log('Variants (raw):', product.variants);
    try {
      const variants = JSON.parse(product.variants);
      console.log('Variants (parsed):', variants);
      console.log('First variant ID:', variants[0].id);
    } catch (e) {
      console.error('Error parsing variants:', e);
    }
  } else {
    console.log('No product with variants found.');
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
