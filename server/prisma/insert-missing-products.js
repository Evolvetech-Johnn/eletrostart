// Script para Inserir Produtos Faltantes
// Lê o arquivo missing-products.json e insere no MongoDB

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Corrigir preços baseado em critérios
function adjustPrice(product) {
  let price = product.price;
  const name = product.name.toUpperCase();
  
  // Ajustes específicos
  if (name.includes('AQUECEDOR')) price = 199.9;
  if (name.includes('AUTOTRANSFORMADOR')) price = 79.9;
  if (name.includes('CHUVEIRO') || name.includes('DUCHA')) price = 149.9;
  if (name.includes('CABO') || name.includes('FIO')) price = 5.9;
  
  return price;
}

async function main() {
  console.log('📦 Inserindo produtos faltantes no MongoDB...\n');

  // 1. Ler arquivo de produtos faltantes
  const missingProductsPath = path.join(__dirname, '../../missing-products.json');
  const missingProducts = JSON.parse(fs.readFileSync(missingProductsPath, 'utf-8'));
  
  console.log(`📋 ${missingProducts.length} produtos para inserir\n`);

  // 2. Buscar ou criar categorias
  const categories = await prisma.category.findMany();
  const categoryMap = {};
  for (const cat of categories) {
    categoryMap[cat.slug] = cat;
  }

  // Criar categorias faltantes
  const newCategories = ['ferramentas', 'diversos'];
  for (const catSlug of newCategories) {
    if (!categoryMap[catSlug]) {
      const catName = catSlug.charAt(0).toUpperCase() + catSlug.slice(1);
      const category = await prisma.category.create({
        data: {
          name: catName,
          slug: catSlug,
          description: `Produtos da categoria ${catName.toLowerCase()}`,
          image: `/img/categorias/${catSlug}.jpg`
        }
      });
      categoryMap[catSlug] = category;
      console.log(`✓ Categoria criada: ${catName}`);
    }
  }

  // 3. Inserir produtos
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of missingProducts) {
    try {
      // Verificar duplicados
      const existing = await prisma.product.findFirst({
        where: {
          OR: [{ sku: product.sku }, { name: product.name }]
        }
      });

      if (existing) {
        console.log(`  ⊘ Já existe: ${product.name}`);
        skipped++;
        continue;
      }

      // Ajustar preço
      const adjustedPrice = adjustPrice(product);
      
      // Preparar dados
      const productData = {
        name: product.name,
        description: product.description,
        price: adjustedPrice,
        stock: 100,
        sku: product.sku,
        image: product.image,
        unit: 'un',
        subcategory: product.subcategory,
        categoryId: categoryMap[product.categoryId]?.id || null,
        active: true,
        featured: false,
        variants: null,
        features: null,
        specifications: null,
        images: null
      };

      // Inserir
      await prisma.product.create({ data: productData });
      inserted++;
      console.log(`  ✓ ${inserted}/${missingProducts.length} - ${product.name}`);

    } catch (error) {
      errors++;
      console.error(`  ✗ Erro: ${product.name} -`, error.message);
    }
  }

  // 4. Resumo
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO');
  console.log('='.repeat(60));
  console.log(`✅ Inseridos:  ${inserted}`);
  console.log(`⊘ Ignorados:   ${skipped}`);
  console.log(`✗ Erros:       ${errors}`);
  console.log('='.repeat(60));
  console.log(`\n🎉 Total de produtos no banco: ${inserted + 46}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
