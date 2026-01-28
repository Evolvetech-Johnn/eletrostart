
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Map of slug to category details (from src/utils/categoryData.js structure)
const CATEGORIES_MAP = {
  iluminacao: { name: "Iluminação", description: "Lâmpadas, luminárias e fitas LED" },
  "fios-cabos": { name: "Fios e Cabos", description: "Fios flexíveis, cabos PP e paralelos" },
  "industrial-protecao": { name: "Industrial e Proteção", description: "Disjuntores, quadros e transformadores" },
  protecao: { name: "Proteção Elétrica", description: "Disjuntores e dispositivos de proteção" }, // Map to industrial-protecao if needed, or keep separate
  "chuveiros-torneiras": { name: "Chuveiros e Torneiras", description: "Chuveiros, duchas e aquecedores" },
  chuveiros: { name: "Chuveiros e Duchas", description: "Chuveiros e aquecedores" }, // Map to chuveiros-torneiras?
  tomadas: { name: "Tomadas e Interruptores", description: "Tomadas, interruptores e plugues" },
  ferramentas: { name: "Ferramentas", description: "Ferramentas para eletricistas" },
  diversos: { name: "Diversos", description: "Materiais diversos" }
};

async function main() {
  console.log('Starting product seed...');

  // 1. Create Categories
  const categoryMap = new Map(); // slug -> db_id

  for (const [slug, info] of Object.entries(CATEGORIES_MAP)) {
    console.log(`Upserting category: ${slug}`);
    const category = await prisma.category.upsert({
      where: { slug },
      update: {
        name: info.name,
        description: info.description
      },
      create: {
        name: info.name,
        slug,
        description: info.description,
        image: `/img/categories/${slug}.png` // Placeholder
      }
    });
    categoryMap.set(slug, category.id);
  }

  // 2. Load Products from JSON files
  const projectRoot = path.resolve(__dirname, '../../../');
  const missingProductsPath = path.join(projectRoot, 'missing-products.json');
  const generatedProductsPath = path.join(projectRoot, 'generated-products.json');

  let productsToSeed = [];

  if (fs.existsSync(missingProductsPath)) {
    const data = JSON.parse(fs.readFileSync(missingProductsPath, 'utf-8'));
    productsToSeed = [...productsToSeed, ...data];
    console.log(`Loaded ${data.length} products from missing-products.json`);
  }

  if (fs.existsSync(generatedProductsPath)) {
    const data = JSON.parse(fs.readFileSync(generatedProductsPath, 'utf-8'));
    // Ensure no duplicates if any
    productsToSeed = [...productsToSeed, ...data];
    console.log(`Loaded ${data.length} products from generated-products.json`);
  }

  console.log(`Total products to process: ${productsToSeed.length}`);

  // 3. Insert Products
  for (const p of productsToSeed) {
    // Determine Category ID
    // The JSON files use 'categoryId' as a slug (e.g. 'iluminacao')
    // We need to map this slug to the real ObjectId from our database
    let catSlug = p.categoryId || p.category; // Some might use 'category' key
    
    // Normalization
    if (catSlug === 'protecao') catSlug = 'industrial-protecao'; // Example mapping if needed
    if (catSlug === 'chuveiros') catSlug = 'chuveiros-torneiras';

    // If we don't have this category in our map (maybe it wasn't in CATEGORIES_MAP), try to create it or skip
    let dbCategoryId = categoryMap.get(catSlug);

    if (!dbCategoryId && catSlug) {
        // Try to find if it exists in DB directly (maybe seeded before)
        const existingCat = await prisma.category.findUnique({ where: { slug: catSlug } });
        if (existingCat) {
            dbCategoryId = existingCat.id;
            categoryMap.set(catSlug, dbCategoryId);
        } else {
            // Create a default one if missing
             console.log(`Creating missing category on the fly: ${catSlug}`);
             const newCat = await prisma.category.create({
                 data: {
                     name: catSlug.charAt(0).toUpperCase() + catSlug.slice(1),
                     slug: catSlug,
                     description: `Categoria ${catSlug}`
                 }
             });
             dbCategoryId = newCat.id;
             categoryMap.set(catSlug, dbCategoryId);
        }
    }

    // Prepare Product Data
    const sku = p.sku || p.id || p.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
    
    try {
        await prisma.product.upsert({
            where: { sku: sku },
            update: {
                name: p.name,
                description: p.description,
                price: parseFloat(p.price) || 0,
                image: p.image,
                unit: p.unit || 'un',
                stock: 100, // Default stock
                categoryId: dbCategoryId,
                subcategory: p.subcategory,
                active: true,
                variants: p.variants || undefined, // JSON
            },
            create: {
                name: p.name,
                description: p.description,
                price: parseFloat(p.price) || 0,
                stock: 100,
                sku: sku,
                image: p.image,
                unit: p.unit || 'un',
                categoryId: dbCategoryId,
                subcategory: p.subcategory,
                active: true,
                variants: p.variants || undefined, // JSON
            }
        });
        // process.stdout.write('.');
    } catch (error) {
        console.error(`Failed to seed product ${sku}: ${error.message}`);
    }
  }

  console.log('\nProduct seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
