
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

const excelPath = path.resolve(__dirname, '../../PRODUTOS - ELETROSTART.xlsx');
const logPath = path.resolve(__dirname, 'price-update-report.txt');

async function main() {
  console.log(`🚀 Starting Price Update Script`);
  console.log(`📄 Reading Excel from: ${excelPath}`);

  let logContent = `Price Update Report - ${new Date().toISOString()}\n\n`;

  try {
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${excelData.length} rows in Excel.`);
    logContent += `Total rows in Excel: ${excelData.length}\n\n`;

    let updatedCount = 0;
    let notFoundCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const row of excelData) {
      const name = row['Produto'];
      const newPriceRaw = row['Preço'];

      if (!name || newPriceRaw === undefined) {
        logContent += `⚠️ SKIPPED - Missing Name or Price: ${JSON.stringify(row)}\n`;
        skippedCount++;
        continue;
      }
      
      const newPrice = Number(newPriceRaw);
      if (isNaN(newPrice)) {
          logContent += `⚠️ SKIPPED - Invalid Price for "${name}": ${newPriceRaw}\n`;
          skippedCount++;
          continue;
      }

      // Try to find the product in DB
      // We search by name (case insensitive matching would be ideal, but Prisma default is case sensitive usually. 
      // We will try finding exactly first, then maybe insensitive if needed? 
      // For now, let's assume exact or close enough. 
      // To allow "fuzzy" matching, we might need to fetch all products and match in JS, 
      // but let's try direct query first for exact matches, or fetch all if dataset is small (it is small).
      
      // Let's fetch all products first to do case-insensitive matching in memory, 
      // as it's safer and the catalog isn't huge (likely < 1000 items).
      
    }


    // Improve strategy: Fetch all products once
    console.log('📥 Fetching all products from database...');
    const allProducts = await prisma.product.findMany();
    console.log(`📦 Database has ${allProducts.length} products.`);
    
    // Normalize helper
    const normalize = (str) => {
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
        
        if (!excelNameRaw || priceVal === undefined) continue;
        
        const newPrice = Number(priceVal);
        const excelNameNorm = normalize(excelNameRaw);
        const excelTokens = new Set(excelNameNorm.split(" "));

        let bestMatch = null;
        let maxScore = 0;

        for (const dbProd of allProducts) {
             const dbNameNorm = normalize(dbProd.name);
             const dbTokens = dbNameNorm.split(" ");
             
             let matches = 0;
             for (const token of dbTokens) {
                 if (excelTokens.has(token)) matches++;
             }
             
             // Jaccard-ish or just simple overlap ratio
             // Score = matches / max(excelTokens, dbTokens) -> conservative
             // Or matches / excelTokens -> heuristic if excel is more descriptive
             
             const score = matches / Math.max(excelTokens.size, dbTokens.length);
             
             if (score > maxScore) {
                 maxScore = score;
                 bestMatch = dbProd;
             }
        }

        if (bestMatch && maxScore >= SIMILARITY_THRESHOLD) {
            // Update if price is different
            if (Math.abs(bestMatch.price - newPrice) > 0.01) {
                 console.log(`✅ MATCH FOUND (${(maxScore*100).toFixed(0)}%): "${excelNameRaw}" -> "${bestMatch.name}"`);
                 console.log(`   Price Update: ${bestMatch.price} -> ${newPrice}`);
                 
                 // Perform update (ENABLE THIS ACTION)
                 await prisma.product.update({
                    where: { id: bestMatch.id },
                    data: { price: newPrice }
                });
                
                logContent += `✅ UPDATED [${(maxScore*100).toFixed(0)}% Match]: "${bestMatch.name}" | Old: ${bestMatch.price} -> New: ${newPrice} (Excel: ${excelNameRaw})\n`;
                updatedCount++;
            } else {
                 // console.log(`   Price Match (No Change): ${bestMatch.price}`);
            }
        } else {
            // Product not found in DB
            logContent += `❌ NOT FOUND (Max Score ${(maxScore*100).toFixed(0)}%): "${excelNameRaw}"\n`;
            notFoundCount++;
        }
    }

    const summary = `
\n--- SUMMARY ---
Updated: ${updatedCount}
Not Found in DB: ${notFoundCount}
(See full details in price-update-report.txt)
`;
    console.log(summary);
    logContent += summary;

    fs.writeFileSync(logPath, logContent);
    console.log(`📝 Report saved to ${logPath}`);

  } catch (error) {
    console.error('❌ Error executing script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
