import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root (relative to src/scripts/syncImages.ts -> ../../.env)
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

// Directory containing images (relative to src/scripts/syncImages.ts -> ../../public/img/Categorias)
// Adjust path: src/scripts/.. = src, src/.. = server, server/.. = project root? 
// No, standard structure: server/src/scripts. So ../../ points to server root.
// If public is in server/public, then ../../public is correct.
const IMAGES_DIR = path.join(__dirname, '../../public/img/Categorias');

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function main() {
  console.log('🔄 Iniciando sincronização de imagens para o banco de dados...');
  console.log(`📂 Lendo diretório: ${IMAGES_DIR}`);

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Diretório não encontrado: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const categories = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`📊 Encontradas ${categories.length} categorias de imagens.`);

  for (const categoryName of categories) {
    const categorySlug = slugify(categoryName);
    const categoryPath = path.join(IMAGES_DIR, categoryName);
    
    // 1. Upsert Category
    console.log(`\n🔹 Processando Categoria: ${categoryName}`);
    
    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: {}, // Don't overwrite if exists
      create: {
        name: categoryName,
        slug: categorySlug,
        description: `Produtos da categoria ${categoryName}`,
        image: `/img/Categorias/${categoryName}/cover.png` // Placeholder
      }
    });

    // 2. Process Images in Category Folder
    const files = fs.readdirSync(categoryPath)
      .filter(file => /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(file));

    for (const file of files) {
      const productName = path.parse(file).name; // Filename without extension
      const productSlug = slugify(productName + '-' + categorySlug); // Ensure uniqueness
      const publicImagePath = `/img/Categorias/${categoryName}/${file}`;
      
      // Basic price/stock logic (randomized for demo purposes if new)
      const randomPrice = Math.floor(Math.random() * 500) + 50;
      
      // Upsert Product
      await prisma.product.upsert({
        where: { sku: productSlug }, // Using slug as SKU for uniqueness mapping
        update: {
          image: publicImagePath, // Update image path to ensure it matches file
          active: true
        },
        create: {
          name: productName,
          description: `Produto ${productName} da linha ${categoryName}`,
          price: randomPrice,
          stock: 100,
          sku: productSlug,
          image: publicImagePath,
          unit: 'un',
          active: true,
          categoryId: category.id,
          featured: false
        }
      });
    }
  }

  console.log('\n✅ Sincronização concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
