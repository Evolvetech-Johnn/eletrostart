import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Load .env from server root
dotenv.config({ path: path.join(__dirname, "../../.env") });

const prisma = new PrismaClient();

// Configuration
const HTML_FILE_PATH = path.join(
  __dirname,
  "../../../lista-produtos-preco.html",
);
const PUBLIC_IMG_DIR = path.join(__dirname, "../../../public/img");

// Helper: Normalize string for matching
function normalize(str: string): string {
  if (!str) return "";
  return (
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      // .replace(/[^a-z0-9]/g, "") // Do NOT remove spaces yet for tokenization
      .trim()
  );
}

// Helper: Tokenize
function tokenize(str: string): Set<string> {
  // Split by whitespace, hyphen, underscore, slash
  const arr = normalize(str).split(/[\s\-_\/]+/);

  // Stop words to ignore (generic terms in filenames)
  const stopWords = new Set([
    "USAR",
    "PARA",
    "TODOS",
    "TODAS",
    "AS",
    "OS",
    "BITOLAS",
    "FOTOS",
    "COM",
    "SEM",
    "CAIXA",
    "EMBALAGEM",
    "JPG",
    "PNG",
    "JPEG",
    "WEBP",
    "IMAGEM",
    "FOTO",
    "DE",
    "DA",
    "DO",
    "E", // Common prepositions
  ]);

  return new Set(arr.filter((t) => t.length > 0 && !stopWords.has(t)));
}

// Helper: Parse currency string to float
function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  let clean = priceStr.toString().trim();

  // Remove currency symbol and spaces
  clean = clean.replace(/^R\$\s?/, "").trim();

  // Handle various formats
  if (clean.includes(",") && clean.includes(".")) {
    if (clean.lastIndexOf(",") > clean.lastIndexOf(".")) {
      // BR: 1.234,56 -> Remove dot, replace comma with dot
      clean = clean.replace(/\./g, "").replace(",", ".");
    } else {
      // US: 1,234.56 -> Remove comma
      clean = clean.replace(/,/g, "");
    }
  } else if (clean.includes(",")) {
    // BR: 1234,56 -> Replace comma with dot
    clean = clean.replace(",", ".");
  }

  clean = clean.replace(/[^\d.-]/g, "");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

// Helper: Recursively find all images and their categories
function getAllImages(
  dir: string,
  rootPath: string = dir,
  fileList: { name: string; path: string; folder: string }[] = [],
) {
  if (!fs.existsSync(dir)) return fileList;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllImages(filePath, rootPath, fileList);
    } else {
      // Check for image extensions
      if (/\.(png|jpg|jpeg|webp|svg|gif)$/i.test(file)) {
        const nameWithoutExt = path.parse(file).name;

        // Calculate relative path
        const relativePath = filePath.split("public")[1].replace(/\\/g, "/");

        // Determine Category Name from parent folder
        const parentFolder = path.basename(path.dirname(filePath));

        fileList.push({
          name: nameWithoutExt,
          path: relativePath,
          folder: parentFolder,
        });
      }
    }
  }
  return fileList;
}

async function main() {
  console.log("🚀 Iniciando Seed Inteligente (Token Match)...");

  if (!fs.existsSync(HTML_FILE_PATH)) {
    console.error(`❌ Arquivo HTML não encontrado: ${HTML_FILE_PATH}`);
    process.exit(1);
  }

  // 1. Mapear Imagens
  console.log("🖼️ Mapeando imagens...");
  const allImages = getAllImages(PUBLIC_IMG_DIR);
  // Store image info along with tokens
  const imageList = allImages.map((img) => ({
    ...img,
    tokens: tokenize(img.name),
  }));

  console.log(`✅ ${allImages.length} imagens encontradas.`);

  // 2. Parse HTML
  const htmlContent = fs.readFileSync(HTML_FILE_PATH, "utf-8");
  const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
  const cellRegex = /<td[^>]*>(.*?)<\/td>/gs;
  const tagRegex = /<[^>]+>/g;

  let match;
  const rows: string[][] = [];

  while ((match = rowRegex.exec(htmlContent)) !== null) {
    const rowContent = match[1];
    const cells: string[] = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      let text = cellMatch[1].replace(tagRegex, "").trim();
      text = text
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .trim();
      cells.push(text);
    }
    if (cells.length > 0) rows.push(cells);
  }

  // Colunas fixas
  const nameColIndex = 1; // Coluna 2
  const priceColIndex = 4; // Coluna 5

  // Identificar header
  let headerIndex = -1;
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = rows[i];
    if (row[1] && /produto/i.test(row[1]) && row[4] && /preço/i.test(row[4])) {
      headerIndex = i;
      break;
    }
  }

  const validProductIds: string[] = [];
  let processed = 0;
  let created = 0;
  let updated = 0;
  let skippedNoImage = 0;

  console.log(`📊 Processando ${rows.length - headerIndex - 1} produtos...`);

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length <= Math.max(nameColIndex, priceColIndex)) continue;

    const rawCode = row[0]?.trim() || "";
    const rawName = row[nameColIndex]?.trim();
    const rawPrice = row[priceColIndex]?.trim();

    if (!rawName) continue;
    if (/produto/i.test(rawName) && /preço/i.test(rawPrice)) continue;

    // 3. Match Logic
    let matchedImage = null;
    let bestScore = 0;

    // Normalize product name
    const productNorm = normalize(rawName);
    const productTokens = tokenize(rawName);

    for (const img of imageList) {
      // Calculate Match Score
      // 1. Exact/Partial String Match (Strongest)
      const imgNorm = normalize(img.name);

      if (productNorm === imgNorm) {
        matchedImage = img;
        bestScore = 2.0; // Perfect
        break;
      }

      // 2. Token Overlap
      // We want to find if Product is in Image OR Image is in Product
      // But also handle cases like "FIO SIL AZUL" matching "FIO SIL 1,5MM AZUL"

      // Calculate intersection of Sets
      let matchCount = 0;
      for (const t of productTokens) {
        if (img.tokens.has(t)) matchCount++;
      }

      if (matchCount === 0) continue;

      // Score based on coverage of the SMALLER string (subset logic)
      // If Product is "LUVA PVC", and Image is "LUVA PVC 3/4", coverage is 100% of Product.
      // If Product is "FIO SIL 1.5 AZUL", Image is "FIO SIL AZUL", coverage is 100% of Image.

      const minTokens = Math.min(productTokens.size, img.tokens.size);
      const coverage = matchCount / minTokens;

      // Jaccard for tie-breaking (how similar are they overall)
      const jaccard =
        matchCount / (productTokens.size + img.tokens.size - matchCount);

      // Boost score if coverage is high (subset match)
      let score = coverage > 0.99 ? 1.5 : (coverage + jaccard) / 2;

      // Boost if the FIRST token of the image matches (Key Subject Match)
      // e.g. Image "PAINEL..." matches Product "PAINEL..."
      const imgTokensArray = Array.from(img.tokens);
      if (imgTokensArray.length > 0 && productTokens.has(imgTokensArray[0])) {
        score *= 1.3;
      }

      // Penalty for very short matches to avoid "FIO" matching "FIO ... ... ..."
      if (matchCount < 2 && score < 1.5) score *= 0.5;

      if (score > bestScore && score > 0.45) {
        // Threshold 0.45
        bestScore = score;
        matchedImage = img;
      }
    }

    if (!matchedImage) {
      skippedNoImage++;
      continue;
    }

    // DEBUG: Log matches for tricky categories
    // if (matchedImage.folder.includes("PAINEL")) {
    //    console.log(`Matched: ${rawName} -> ${matchedImage.name} (Score: ${bestScore.toFixed(2)})`);
    // }

    const price = parsePrice(rawPrice);

    const slug = normalize(rawName).toLowerCase().replace(/\s+/g, "-");
    // User Requirement: Never generate fake SKU. Use official code or null.
    const code = rawCode || null;
    const sku = null; // Removed SKU generation entirely to rely on Code

    // Category management
    const categoryName = matchedImage.folder;
    const categorySlug = normalize(categoryName).replace(/\s+/g, "-"); // Slugify correctly

    try {
      // Find or Create Category
      let category = await prisma.category.findFirst({
        where: {
          OR: [{ slug: categorySlug }, { name: categoryName }],
        },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryName,
            slug: categorySlug,
            description: `Categoria ${categoryName}`,
            image: matchedImage.path,
          },
        });
      }

      // Upsert logic modified to avoid dependency on generated SKU
      // We try to find by Name as the anchor since SKU is no longer unique/guaranteed
      let product = await prisma.product.findFirst({ where: { name: rawName } });

      const productData = {
          name: rawName,
          price: price,
          image: matchedImage.path,
          categoryId: category.id,
          code: code,
          sku: sku, // Will be null
          active: true,
          description: rawName,
          unit: "un",
      };

      if (product) {
        product = await prisma.product.update({
            where: { id: product.id },
            data: {
                ...productData,
                // Ensure variants/features/specs are preserved if we don't have new ones
                // But here we are seeding base data
            }
        });
      } else {
        product = await prisma.product.create({
            data: productData
        });
      }

      validProductIds.push(product.id);

      if (product.createdAt.getTime() === product.updatedAt.getTime()) {
        created++;
      } else {
        updated++;
      }
      processed++;
    } catch (error) {
      console.error(`❌ Erro ao salvar ${rawName}:`, error);
    }
  }

  console.log(`\n🧹 Limpando produtos sem imagem...`);

  if (validProductIds.length > 0) {
    const deleteResult = await prisma.product.deleteMany({
      where: {
        id: {
          notIn: validProductIds,
        },
      },
    });
    console.log(`🗑️  Removidos ${deleteResult.count} produtos obsoletos.`);
  } else {
    console.warn("⚠️  Nenhum produto válido encontrado! Abortando limpeza.");
  }

  console.log(`\n🏁 Resultado Final:`);
  console.log(`   ✅ Válidos (com imagem): ${processed}`);
  console.log(`   🆕 Criados: ${created}`);
  console.log(`   🔄 Atualizados: ${updated}`);
  console.log(`   ⏭️  Pulados (sem imagem): ${skippedNoImage}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
