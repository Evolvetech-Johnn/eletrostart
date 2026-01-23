// Script de Migração de Produtos para MongoDB
// Importa os produtos existentes e insere no banco de dados

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Mapeamento de categorias
const categoryMap = {
  'protecao': {
    name: 'Proteção',
    slug: 'protecao',
    description: 'Produtos de proteção elétrica: disjuntores, DR, fusíveis e acessórios',
    image: '/img/categorias/protecao.jpg'
  },
  'iluminacao': {
    name: 'Iluminação',
    slug: 'iluminacao',
    description: 'Produtos de iluminação: lâmpadas, luminárias, painéis LED e tubulares',
    image: '/img/categorias/iluminacao.jpg'
  },
  'tomadas': {
    name: 'Tomadas e Interruptores',
    slug: 'tomadas',
    description: 'Tomadas, interruptores, plugues e acessórios',
    image: '/img/categorias/tomadas.jpg'
  },
  'fios-cabos': {
    name: 'Fios e Cabos',
    slug: 'fios-cabos',
    description: 'Fios e cabos elétricos de diversas bitolas',
    image: '/img/categorias/fios-cabos.jpg'
  },
  'chuveiros': {
    name: 'Chuveiros e Torneiras',
    slug: 'chuveiros',
    description: 'Chuveiros e torneiras elétricas',
    image: '/img/categorias/chuveiros.jpg'
  }
};

async function main() {
  console.log('🚀 Iniciando migração de produtos para MongoDB...\n');

  try {
    // 1. Ler arquivo de produtos
    const productsPath = path.join(__dirname, '../../generated-products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    
    console.log(`📦 ${productsData.length} produtos encontrados no arquivo\n`);

    // 2. Criar categorias únicas
    console.log('📁 Criando categorias...');
    const uniqueCategories = [...new Set(productsData.map(p => p.category))];
    
    const createdCategories = {};
    for (const catId of uniqueCategories) {
      const catData = categoryMap[catId] || {
        name: catId.charAt(0).toUpperCase() + catId.slice(1),
        slug: catId,
        description: `Produtos da categoria ${catId}`,
        image: `/img/categorias/${catId}.jpg`
      };

      // Verificar se categoria já existe
      const existing = await prisma.category.findFirst({
        where: { slug: catData.slug }
      });

      if (existing) {
        createdCategories[catId] = existing;
        console.log(`  ✓ Categoria "${catData.name}" já existe`);
      } else {
        const category = await prisma.category.create({
          data: catData
        });
        createdCategories[catId] = category;
        console.log(`  ✓ Categoria "${catData.name}" criada!`);
      }
    }

    console.log(`\n✅ ${Object.keys(createdCategories).length} categorias processadas\n`);

    // 3. Inserir produtos
    console.log('📦 Inserindo produtos no MongoDB...\n');
    
    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const product of productsData) {
      try {
        // Verificar se produto já existe (por SKU ou nome)
        const existing = await prisma.product.findFirst({
          where: {
            OR: [
              { sku: product.id },
              { name: product.name }
            ]
          }
        });

        if (existing) {
          console.log(`  ⊘ Produto já existe: ${product.name}`);
          skippedCount++;
          continue;
        }

        // Preparar dados do produto
        const productData = {
          name: product.name,
          description: product.description || `${product.name}. Produto de alta qualidade.`,
          price: product.price || 0.0,
          stock: 100, // Estoque padrão
          sku: product.id,
          image: product.image,
          unit: product.unit || 'un',
          subcategory: product.subcategory || null,
          categoryId: createdCategories[product.category]?.id || null,
          active: true,
          featured: false,
          
          // Campos JSON nativos (MongoDB)
          variants: product.variants || null,
          features: product.features || null,
          specifications: product.specifications || null,
          images: product.images || null
        };

        // Inserir produto
        await prisma.product.create({
          data: productData
        });

        insertedCount++;
        console.log(`  ✓ ${insertedCount}/${productsData.length} - ${product.name}`);

      } catch (error) {
        errorCount++;
        console.error(`  ✗ Erro ao inserir "${product.name}":`, error.message);
      }
    }

    // 4. Resumo
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA MIGRAÇÃO');
    console.log('='.repeat(60));
    console.log(`✅ Produtos inseridos:  ${insertedCount}`);
    console.log(`⊘ Produtos ignorados:   ${skippedCount} (já existiam)`);
    console.log(`✗ Erros:                ${errorCount}`);
    console.log(`📁 Categorias criadas:  ${Object.keys(createdCategories).length}`);
    console.log('='.repeat(60));
    
    console.log('\n🎉 Migração concluída com sucesso!');
    console.log('\n💡 Próximos passos:');
    console.log('   - Acesse MongoDB Atlas para ver os produtos');
    console.log('   - Use "npx prisma studio" para visualizar/editar');
    console.log('   - Ajuste preços e estoques conforme necessário\n');

  } catch (error) {
    console.error('\n❌ Erro fatal na migração:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
