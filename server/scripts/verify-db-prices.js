
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking prices in DB...');
  
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'Tubular', mode: 'insensitive' } },
        { name: { contains: 'Broca', mode: 'insensitive' } },
        { name: { contains: 'Autotransformador', mode: 'insensitive' } }
      ]
    },
    take: 50,
    select: { id: true, name: true, price: true }
  });

  console.log(JSON.stringify(products, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
