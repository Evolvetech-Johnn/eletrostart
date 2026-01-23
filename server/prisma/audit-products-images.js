// Script de Auditoria de Produtos x Imagens
// Verifica quais imagens não têm produtos correspondentes

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Função para converter nome de arquivo em dados de produto
function parseProductFromFilename(filename, category) {
  // Remove extensão
  const name = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '');
  
  // Gera ID/SKU
  const sku = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Determina preço baseado em categoria
  let price = 29.9;
  if (name.includes('BIFASICO') || name.includes('BIFÁSICO')) price = 59.9;
  if (name.includes('TRIFASICO') || name.includes('TRIFÁSICO')) price = 89.9;
  if (name.includes('LAMPADA') || name.includes('LÂMPADA') || name.includes('LED')) price = 19.9;
  if (name.includes('TUBULAR')) price = 19.9;
  if (name.includes('PAINEL')) price = 39.9;
  if (name.includes('LUMINARIA') || name.includes('LUMINÁRIA')) price = 49.9;
  if (name.includes('PLUGUE')) price = 8.9;
  if (name.includes('CABO') || name.includes('FIO')) price = 5.9;
  if (name.includes('CHUVEIRO') || name.includes('DUCHA')) price = 149.9;
  if (name.includes('AQUECEDOR')) price = 199.9;
  if (name.includes('AUTOTRANSFORMADOR')) price = 79.9;
  if (name.includes('BROCA')) price = 12.9;
  
  return {
    name,
    sku,
    price,
    description: `${name}. Produto de alta qualidade para instalações elétricas.`
  };
}

// Mapeamento de pastas para categorias
const folderToCategoryMap = {
  'DISJUNTORES': { id: 'protecao', subcategory: 'disjuntores' },
  'LAMPADA BULBO LED': { id: 'iluminacao', subcategory: 'lampadas' },
  'PAINEL LED PLAFON': { id: 'iluminacao', subcategory: 'paineis' },
  'LUMINARIAS': { id: 'iluminacao', subcategory: 'luminarias' },
  'TUBULAR T8': { id: 'iluminacao', subcategory: 'tubulares' },
  'PLUGUES MACHO E FEMEA': { id: 'tomadas', subcategory: 'plugues' },
  'INTERRUPTORES E TOMADAS': { id: 'tomadas', subcategory: 'interruptores-tomadas' },
  'CABO PARALELO 2 VIAS': { id: 'fios-cabos', subcategory: 'cabos-paralelos' },
  'CABO PP': { id: 'fios-cabos', subcategory: 'cabos-pp' },
  'FIO DE COBRE': { id: 'fios-cabos', subcategory: 'fios' },
  'CHUVEIROS LORENZETTI': { id: 'chuveiros', subcategory: 'chuveiros' },
  'AQUECEDORES LORENZETTI': { id: 'chuveiros', subcategory: 'aquecedores' },
  'AUTOTRANSFORMADORES': { id: 'protecao', subcategory: 'autotransformadores' },
  'BROCAS AÇO RAPIDO': { id: 'ferramentas', subcategory: 'brocas' }
};

async function scanImages() {
  const imagesDir = path.join(__dirname, '../../public/img/Categorias');
  const imageFiles = [];
  
  // Scan recursively
  function scanDir(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        scanDir(fullPath);
      } else if (/\.(png|jpg|jpeg|webp)$/i.test(item)) {
        // Get folder name (category)
        const folderName = path.basename(path.dirname(fullPath));
        const relativePath = `/img/Categorias/${folderName}/${item}`;
        
        imageFiles.push({
          filename: item,
          folder: folderName,
          path: relativePath,
          fullPath
        });
      }
    }
  }
  
  if (fs.existsSync(imagesDir)) {
    scanDir(imagesDir);
  }
  
  return imageFiles;
}

async function main() {
  console.log('🔍 Auditando produtos x imagens...\n');
  
  // 1. Carregar produtos existentes
  const existingProducts = await prisma.product.findMany({
    select: { name: true, sku: true, image: true }
  });
  
  console.log(`📦 Produtos existentes no MongoDB: ${existingProducts.length}\n`);
  
  // 2. Escanear imagens
  const images = await scanImages();
  console.log(`🖼️  Imagens encontradas: ${images.length}\n`);
  
  // 3. Encontrar imagens sem produtos
  const missingProducts = [];
  
  for (const img of images) {
    const hasProduct = existingProducts.some(p => 
      p.image === img.path || 
      p.image?.includes(img.filename) ||
      p.name.toLowerCase().includes(img.filename.toLowerCase().replace(/\.(png|jpg|jpeg)$/i, ''))
    );
    
    if (!hasProduct) {
      const categoryInfo = folderToCategoryMap[img.folder] || { 
        id: 'diversos', 
        subcategory: img.folder.toLowerCase() 
      };
      
      const productData = parseProductFromFilename(img.filename, categoryInfo);
      
      missingProducts.push({
        ...productData,
        image: img.path,
        folder: img.folder,
        categoryId: categoryInfo.id,
        subcategory: categoryInfo.subcategory
      });
    }
  }
  
  console.log(`\n📊 RESUMO:`);
  console.log(`   Produtos existentes: ${existingProducts.length}`);
  console.log(`   Imagens totais:      ${images.length}`);
  console.log(`   Produtos faltantes:  ${missingProducts.length}\n`);
  
  if (missingProducts.length > 0) {
    console.log('📋 Produtos a serem criados:\n');
    
    // Agrupar por categoria
    const grouped = {};
    for (const p of missingProducts) {
      if (!grouped[p.folder]) grouped[p.folder] = [];
      grouped[p.folder].push(p);
    }
    
    for (const [folder, products] of Object.entries(grouped)) {
      console.log(`\n  ${folder} (${products.length} produtos):`);
      products.forEach((p, i) => {
        console.log(`    ${i + 1}. ${p.name} - R$ ${p.price.toFixed(2)}`);
      });
    }
    
    // Salvar em arquivo JSON para revisão
    const outputPath = path.join(__dirname, '../../missing-products.json');
    fs.writeFileSync(outputPath, JSON.stringify(missingProducts, null, 2));
    console.log(`\n📄 Produtos faltantes salvos em: missing-products.json`);
    
    return missingProducts;
  } else {
    console.log('✅ Todos os produtos têm imagens correspondentes!');
    return [];
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
