
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
  
  console.log('--- Current Categories in DB ---');
  categories.forEach(c => {
    console.log(`- ${c.name} (slug: ${c.slug})`);
  });
  console.log('--------------------------------');
  console.log(`Total: ${categories.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
