import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Prisma Client
const serverPrismaPath = path.resolve(__dirname, '../server/node_modules/@prisma/client/index.js');
let PrismaClient;
try {
  const prismaModule = await import(serverPrismaPath);
  PrismaClient = prismaModule.PrismaClient;
} catch (e) {
  try {
    const { PrismaClient: PC } = require('../server/node_modules/@prisma/client');
    PrismaClient = PC;
  } catch (e2) {
    console.error('Could not load PrismaClient:', e2);
    process.exit(1);
  }
}

// Load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '../server/.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnv();

const REPORTS_DIR = path.join(__dirname, '../reports');
const PUBLIC_IMG_DIR = path.join(__dirname, '../public/img');
const PLACEHOLDER_PATH = '/img/placeholder.png';

// Helper function to normalize strings for matching
function normalize(str) {
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '');
}

// Find best matching image for a product
function findBestMatch(productName, category, availableImages) {
  const normalizedProductName = normalize(productName);
  const normalizedCategory = normalize(category?.name || '');
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const imagePath of availableImages) {
    const normalizedPath = normalize(imagePath);
    let score = 0;
    
    // Extract keywords from product name
    const keywords = normalizedProductName.split(/\s+/).filter(k => k.length > 2);
    
    // Score based on keyword matches
    for (const keyword of keywords) {
      if (normalizedPath.includes(keyword)) {
        score += 10;
      }
    }
    
    // Bonus for category match
    if (normalizedCategory && normalizedPath.includes(normalizedCategory)) {
      score += 5;
    }
    
    // Prefer images in category folders
    if (imagePath.toLowerCase().includes('/categorias/')) {
      score += 2;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = imagePath;
    }
  }
  
  return bestScore > 5 ? bestMatch : null;
}

// Ensure placeholder exists
function ensurePlaceholder() {
  const placeholderFullPath = path.join(PUBLIC_IMG_DIR, 'placeholder.png');
  
  if (!fs.existsSync(placeholderFullPath)) {
    console.log('⚠️  Placeholder image not found, creating placeholder.svg instead...');
    
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#e2e8f0"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#1e293b" text-anchor="middle" dominant-baseline="middle">
    Sem Imagem
  </text>
</svg>`;
    
    const svgPath = path.join(PUBLIC_IMG_DIR, 'placeholder.svg');
    fs.writeFileSync(svgPath, svgContent);
    console.log(`✅ Created ${svgPath}`);
    return '/img/placeholder.svg';
  }
  
  return PLACEHOLDER_PATH;
}

async function syncProductsImages() {
  console.log('🔄 Starting product-image synchronization...\n');
  
  // Load audit reports
  const diffReport = JSON.parse(
    fs.readFileSync(path.join(REPORTS_DIR, 'audit-diff.json'), 'utf8')
  );
  const imagesReport = JSON.parse(
    fs.readFileSync(path.join(REPORTS_DIR, 'audit-images.json'), 'utf8')
  );
  
  const availableImages = new Set(imagesReport.images);
  const orphanImages = new Set(diffReport.orphanImages);
  
  // Ensure placeholder
  const placeholderPath = ensurePlaceholder();
  
  const prisma = new PrismaClient();
  const results = {
    timestamp: new Date().toISOString(),
    updatedProducts: [],
    placeholderAssigned: [],
    errors: []
  };
  
  try {
    // Get all products with broken paths
    const brokenPathProducts = diffReport.brokenPathProducts;
    
    console.log(`📋 Found ${brokenPathProducts.length} products with broken image paths\n`);
    
    for (const product of brokenPathProducts) {
      try {
        const bestMatch = findBestMatch(product.name, product.category, orphanImages);
        
        if (bestMatch) {
          // Update product with matched image
          await prisma.product.update({
            where: { id: product.id },
            data: { image: bestMatch }
          });
          
          results.updatedProducts.push({
            id: product.id,
            name: product.name,
            oldImage: product.image,
            newImage: bestMatch
          });
          
          // Remove from orphan set
          orphanImages.delete(bestMatch);
          
          console.log(`✅ ${product.name}`);
          console.log(`   Old: ${product.image}`);
          console.log(`   New: ${bestMatch}\n`);
        } else {
          // Assign placeholder
          await prisma.product.update({
            where: { id: product.id },
            data: { image: placeholderPath }
          });
          
          results.placeholderAssigned.push({
            id: product.id,
            name: product.name,
            oldImage: product.image
          });
          
          console.log(`⚠️  ${product.name} - No match found, assigned placeholder\n`);
        }
      } catch (error) {
        results.errors.push({
          productId: product.id,
          productName: product.name,
          error: error.message
        });
        console.error(`❌ Error updating ${product.name}:`, error.message);
      }
    }
    
    // Save results
    const resultsPath = path.join(REPORTS_DIR, 'sync-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 SYNC SUMMARY:');
    console.log(`   Products Updated: ${results.updatedProducts.length}`);
    console.log(`   Placeholders Assigned: ${results.placeholderAssigned.length}`);
    console.log(`   Errors: ${results.errors.length}`);
    console.log(`   Remaining Orphan Images: ${orphanImages.size}`);
    console.log(`\n✅ Results saved to: ${resultsPath}`);
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

syncProductsImages();
