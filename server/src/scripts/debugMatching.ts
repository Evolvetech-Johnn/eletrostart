
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_IMG_DIR = path.join(__dirname, "../../../public/img/categorias");
const HTML_FILE_PATH = path.join(__dirname, "../../../lista-produtos-preco.html");

function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
}

function tokenize(str: string): string[] {
  return normalize(str).split(/[\s\-_\/]+/).filter(t => t.length > 0);
}

function getAllImages(dir: string, fileList: any[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllImages(filePath, fileList);
    } else {
      if (/\.(png|jpg|jpeg|webp)$/i.test(file)) {
        const nameWithoutExt = path.basename(file, path.extname(file));
        fileList.push({
          name: nameWithoutExt,
          path: filePath,
          tokens: tokenize(nameWithoutExt)
        });
      }
    }
  }
  return fileList;
}

function main() {
  console.log("🔍 Testando Lógica de Match Relaxada...");

  const allImages = getAllImages(PUBLIC_IMG_DIR);
  const htmlContent = fs.readFileSync(HTML_FILE_PATH, "utf-8");
  const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
  const cellRegex = /<td[^>]*>(.*?)<\/td>/gs;
  const tagRegex = /<[^>]+>/g;

  const productNames: string[] = [];
  let match;
  while ((match = rowRegex.exec(htmlContent)) !== null) {
    const rowContent = match[1];
    const cells: string[] = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      let text = cellMatch[1].replace(tagRegex, "").trim();
      text = text.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
      cells.push(text);
    }
    if (cells.length > 4 && cells[1]) {
        productNames.push(cells[1]);
    }
  }

  // Test "Product tokens inside Image tokens" logic
  let matchedCount = 0;
  const unmatchedImages = new Set(allImages.map(i => i.path));

  for (const rawName of productNames) {
    const productTokens = tokenize(rawName);
    const productNorm = normalize(rawName).replace(/\s/g, "");
    
    // Ignore small products/tokens to avoid false positives?
    if (productTokens.length === 0) continue;

    for (const img of allImages) {
        if (!unmatchedImages.has(img.path)) continue;

        const imgNorm = normalize(img.name).replace(/\s/g, "");
        
        // 1. Exact/Partial String Match
        if (productNorm.includes(imgNorm) || imgNorm.includes(productNorm)) {
            unmatchedImages.delete(img.path);
            matchedCount++;
            continue;
        }

        // 2. NEW LOGIC: All product tokens are in image tokens
        // But exclude very small tokens or common words if product name is short?
        // E.g. "LUVA" -> matches "LUVA DE PEDREIRO" (OK)
        // E.g. "PVC" -> matches "TUBO PVC" (OK)
        
        const commonTokens = productTokens.filter(t => img.tokens.includes(t));
        
        // Rule: At least 2 tokens match OR (1 token match AND it's a significant part)
        // If product has 3 tokens, and 3 match, good.
        // If product has 1 token, and 1 match, good.
        
        if (commonTokens.length === productTokens.length) {
            console.log(`✅ Match: "${rawName}" -> "${img.name}"`);
            unmatchedImages.delete(img.path);
            matchedCount++;
        }
    }
  }

  console.log(`\n📊 Resultado:`);
  console.log(`   Imagens correspondidas: ${allImages.length - unmatchedImages.size}`);
  console.log(`   Imagens restantes: ${unmatchedImages.size}`);
  
  if (unmatchedImages.size > 0) {
      console.log("\n❌ Imagens ainda sem match:");
      allImages.filter(i => unmatchedImages.has(i.path)).forEach(i => {
          console.log(`- ${i.name}`);
      });
  }
}

main();
