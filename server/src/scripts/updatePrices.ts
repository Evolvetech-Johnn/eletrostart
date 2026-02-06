import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path: src/scripts/.. -> src, src/.. -> server. 
// Excel is likely in server root or project root? 
// Original script was in server/scripts, and path was ../../PRODUTOS.xlsx
// So server/scripts/../../ -> server/.. -> project root?
// Let's assume project root D:/Evolvetech/Webdesign/Projetos/eletrostart/PRODUTOS - ELETROSTART.xlsx
// New script is in server/src/scripts. So ../../../
const excelPath = path.resolve(__dirname, '../../../PRODUTOS - ELETROSTART.xlsx');
const logPath = path.resolve(__dirname, '../../price-update-report.txt'); // Save report in server root

async function main() {
  console.log(`🚀 Starting Price Update Script`);
  console.log(`📄 Reading Excel from: ${excelPath}`);

  let logContent = `Price Update Report - ${new Date().toISOString()}\n\n`;

  try {
    if (!fs.existsSync(excelPath)) {
        throw new Error(`Excel file not found at ${excelPath}`);
    }

    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData: any[] = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${excelData.length} rows in Excel.`);
    logContent += `Total rows in Excel: ${excelData.length}\n\n`;

    let updatedCount = 0;
    let notFoundCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Improve strategy: Fetch all products once
    console.log('📥 Fetching all products from database...');
    const allProducts = await prisma.product.findMany();
    console.log(`📦 Database has ${allProducts.length} products.`);
    
    // Normalize helper
    const normalize = (str: string) => {
      return str
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "") // Remove special chars
        .replace(/\s+/g, " ") // Collapse whitespace
        .trim();
    };

    const SIMILARITY_THRESHOLD = 0.6; // 60% token overlap required

    for (const row of excelData) {
        const excelNameRaw = row['Produto'];
        const priceVal = row['Preço'];
        const supplier = row['Fornecedor'] || '';
        
        if (!excelNameRaw || priceVal === undefined) {
            skippedCount++;
            continue;
        }
        
        const newPrice = Number(priceVal);
        if (isNaN(newPrice)) {
            skippedCount++;
            continue;
        }

        const excelNameNorm = normalize(excelNameRaw);
        const excelTokens = new Set(excelNameNorm.split(" "));

        let bestMatch = null;
        let maxScore = 0;

        for (const dbProd of allProducts) {
             const dbNameNorm = normalize(dbProd.name);
             const dbTokens = dbNameNorm.split(" ");
             
             // Calculate Jaccard similarity or simple token overlap
             const intersection = dbTokens.filter(t => excelTokens.has(t));
             const score = intersection.length / Math.max(excelTokens.size, dbTokens.length);

             if (score > maxScore && score >= SIMILARITY_THRESHOLD) {
                 maxScore = score;
                 bestMatch = dbProd;
             }
        }

        if (bestMatch) {
            // Update price
            await prisma.product.update({
                where: { id: bestMatch.id },
                data: { price: newPrice }
            });
            updatedCount++;
            logContent += `✅ UPDATED: "${excelNameRaw}" -> "${bestMatch.name}" | Old: ${bestMatch.price} | New: ${newPrice}\n`;
        } else {
            notFoundCount++;
            logContent += `❌ NOT FOUND: "${excelNameRaw}" (Best score: ${maxScore.toFixed(2)})\n`;
        }
    }

    console.log(`\n🏁 Update Complete!`);
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`❌ Not Found: ${notFoundCount}`);
    console.log(`⚠️ Skipped: ${skippedCount}`);
    
    logContent += `\nSummary:\nUpdated: ${updatedCount}\nNot Found: ${notFoundCount}\nSkipped: ${skippedCount}\nErrors: ${errorCount}`;
    
    fs.writeFileSync(logPath, logContent);
    console.log(`📝 Log saved to: ${logPath}`);

  } catch (error) {
    console.error('CRITICAL ERROR:', error);
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
