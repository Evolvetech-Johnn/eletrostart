
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const CATEGORY_SLUG = 'infraestrutura';
const FOLDER_NAME = 'ELETRODUTOS-COMPONENTES';
const BASE_IMG_PATH = `/img/Categorias/${FOLDER_NAME}/`;
const ABS_PATH = `d:/Evolvetech/Webdesign/Projetos/eletrostart/public/img/Categorias/${FOLDER_NAME}`;

// Helper to format name
const formatName = (filename) => {
  return filename
    .replace(/\.png|\.jpg|\.jpeg/gi, '')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .replace('Pvc', 'PVC')
    .replace('Cz', 'Cinza')
    .replace('Hidrossol', 'Hidrossol') // Brand name
    .replace(/_/g, '/'); // 1_2 -> 1/2
};

// Helper to guess price (mock)
const guessPrice = (name) => {
  if (name.includes('Abracadeira')) return 1.50;
  if (name.includes('Luva')) return 2.90;
  return 5.00;
};

async function main() {
  console.log(`Processing folder: ${FOLDER_NAME}`);

  // Get category
  const category = await prisma.category.findUnique({
    where: { slug: CATEGORY_SLUG }
  });

  if (!category) {
    console.error(`Category ${CATEGORY_SLUG} not found! Run seed-categories.js first.`);
    process.exit(1);
  }

  // Read files
  const files = fs.readdirSync(ABS_PATH);
  
  for (const file of files) {
    if (!file.match(/\.(png|jpg|jpeg)$/i)) continue;

    const name = formatName(file);
    const price = guessPrice(name);
    const image = BASE_IMG_PATH + file;
    const sku = name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    console.log(`Processing: ${name}`);

    // Upsert product
    await prisma.product.upsert({
      where: { sku },
      update: {
        image,
        categoryId: category.id,
        active: true
      },
      create: {
        name,
        description: `${name}. Produto de alta qualidade para infraestrutura elétrica.`,
        price,
        stock: 100,
        sku,
        unit: 'un',
        image,
        categoryId: category.id,
        active: true
      }
    });
  }

  console.log('✅ Done inserting products!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
