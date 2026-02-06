import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root
dotenv.config({ path: path.join(__dirname, "../../.env") });

const prisma = new PrismaClient();

// Configuration
const HTML_FILE_PATH = path.join(
  __dirname,
  "../../../lista-produtos-preco.html",
);
const PUBLIC_IMG_DIR = path.join(__dirname, "../../../public/img"); // Project root public/img

// Helper: Normalize string for matching
function normalize(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, "") // Keep only alphanumeric
    .trim();
}

// Helper: Parse currency string to float
function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  let clean = priceStr.toString().trim();

  // Remove currency symbol and spaces
  clean = clean.replace(/^R\$\s?/, "").trim();

  // Handle various formats
  // Case 1: 1.234,56 (BR standard) -> has comma and dot, comma is last
  // Case 2: 1,234.56 (US standard) -> has comma and dot, dot is last
  // Case 3: 1234,56 (BR no thousands) -> has comma only
  // Case 4: 1234.56 (US no thousands) -> has dot only
  // Case 5: 38.4 (User example) -> dot decimal

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
  // else if only dot, assume it's decimal (like 38.4) or simple integer (100.00)
  // We leave dot as is for parseFloat

  // Final cleanup: keep only digits, dot, minus
  clean = clean.replace(/[^\d.-]/g, "");

  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

// Helper: Recursively find all images in a directory
function getAllImages(
  dir: string,
  fileList: { name: string; path: string }[] = [],
) {
  if (!fs.existsSync(dir)) return fileList;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllImages(filePath, fileList);
    } else {
      // Check for image extensions
      if (/\.(png|jpg|jpeg|webp|svg|gif)$/i.test(file)) {
        // We store the relative path from 'public' (e.g., /img/Categorias/...)
        // But for matching, we use the filename without extension
        const nameWithoutExt = path.parse(file).name;

        // Calculate relative path for DB (assuming frontend serves from public root)
        // If dir is .../server/public/img/..., and we want /img/...
        // We need to find where 'public' ends.
        // Let's assume we want the path starting with /img
        const relativePath = filePath.split("public")[1].replace(/\\/g, "/");

        fileList.push({
          name: nameWithoutExt,
          path: relativePath,
        });
      }
    }
  }
  return fileList;
}

async function main() {
  console.log("🚀 Iniciando Seed de Produtos a partir do HTML...");

  // 1. Read HTML File
  if (!fs.existsSync(HTML_FILE_PATH)) {
    console.error(`❌ Arquivo HTML não encontrado: ${HTML_FILE_PATH}`);
    process.exit(1);
  }
  console.log(`📄 Lendo arquivo: ${HTML_FILE_PATH}`);
  const htmlContent = fs.readFileSync(HTML_FILE_PATH, "utf-8");

  // 2. Build Image Map
  console.log("🖼️ Mapeando imagens do sistema...");
  const allImages = getAllImages(PUBLIC_IMG_DIR);
  const imageMap = new Map<string, string>();

  allImages.forEach((img) => {
    const key = normalize(img.name);
    // If duplicate names, the last one wins (or we could handle duplicates)
    imageMap.set(key, img.path);
  });
  console.log(`✅ ${allImages.length} imagens encontradas.`);

  // 3. Parse HTML (Simple Regex Approach)
  // Find rows <tr>...</tr>
  const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
  const cellRegex = /<td[^>]*>(.*?)<\/td>/gs;
  const tagRegex = /<[^>]+>/g; // To strip tags from cell content

  let match;
  const rows: string[][] = [];

  while ((match = rowRegex.exec(htmlContent)) !== null) {
    const rowContent = match[1];
    const cells: string[] = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      // Clean cell content: decode entities if needed (basic ones), strip tags
      let text = cellMatch[1].replace(tagRegex, "").trim();
      // Decode basic entities
      text = text
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .trim();
      cells.push(text);
    }
    if (cells.length > 0) rows.push(cells);
  }

  console.log(`📊 Encontradas ${rows.length} linhas na tabela.`);

  // 4. Identify Columns
  // User enforced: Col 2 (index 1) = Name, Col 5 (index 4) = Price
  const nameColIndex = 1;
  const priceColIndex = 4;

  // Find header index just to skip it
  let headerIndex = -1;
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = rows[i];
    // Check if this looks like the header row provided by user
    // "Cod", "Produto", "Quantidade", "Custo Compra", "Preço"
    if (row[1] && /produto/i.test(row[1]) && row[4] && /preço/i.test(row[4])) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    console.warn(
      "⚠️ Cabeçalho não encontrado com certeza, assumindo linha 0 como cabeçalho e começando da 1.",
    );
    headerIndex = 0;
  } else {
    console.log(`✅ Cabeçalho identificado na linha ${headerIndex + 1}.`);
  }

  console.log(
    `ℹ️ Usando colunas fixas: Produto[${nameColIndex}], Preço[${priceColIndex}]`,
  );

  let count = 0;
  let updatedCount = 0;
  let createdCount = 0;
  let skippedCount = 0;

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];

    // Log first row to debug
    if (i === headerIndex + 1) {
      console.log("🔍 Primeira linha de dados (bruta):", row);
    }

    if (row.length <= Math.max(nameColIndex, priceColIndex)) {
      skippedCount++;
      continue;
    }

    const rawName = row[nameColIndex]?.replace(/&nbsp;/g, " ").trim();
    const rawPrice = row[priceColIndex]?.replace(/&nbsp;/g, " ").trim();
    const rawCode = row[0]?.replace(/&nbsp;/g, " ").trim() || "";

    if (!rawName) {
      skippedCount++;
      continue;
    }

    // Skip header repetition if any
    if (/produto/i.test(rawName) && /preço/i.test(rawPrice)) {
      skippedCount++;
      continue;
    }

    const price = parsePrice(rawPrice);

    // Debug specific product
    if (rawName.includes("LUVA 3/4 PVC") && rawName.includes("HIDROSSOL")) {
      console.log(`\n️ DEBUG PRODUTO ALVO:`);
      console.log(`   Nome Raw: "${rawName}"`);
      console.log(`   Preço Raw: "${rawPrice}"`);
      console.log(`   Preço Parsed: ${price}`);
    }

    // Generate SKU from name (slug) + code to ensure uniqueness
    const slug = normalize(rawName).toLowerCase().replace(/\s+/g, "-");
    const sku = rawCode ? `${slug}-${rawCode}` : `${slug}-${Date.now()}`;

    // Find image
    // Tenta encontrar imagem exata ou parcial
    // A lógica de imagem é complexa, vamos simplificar:
    // Se existir uma imagem que contenha o nome do produto (slug), usa.
    // O mapa imagesMap tem chaves normalizadas.
    const normalizedNameForImage = normalize(rawName);
    const imagePath = imageMap.get(normalizedNameForImage);

    try {
      // Try to find by Name first to avoid duplicates with different SKUs
      const existingProduct = await prisma.product.findFirst({
        where: { name: rawName },
      });

      if (existingProduct) {
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            price: price,
            sku: sku, // Update SKU to match new format if needed
            image: imagePath || existingProduct.image,
            // Don't update description/category to preserve manual edits?
            // Or update them? User said "Systemic Error", implies we should fix everything.
            // But description is not in the HTML table (only Name).
            // So we keep existing description.
          },
        });
        updatedCount++;
      } else {
        // Upsert by SKU just in case
        await prisma.product.upsert({
          where: { sku: sku },
          update: {
            name: rawName,
            price: price,
            image: imagePath,
          },
          create: {
            name: rawName,
            price: price,
            sku: sku,
            image: imagePath,
            description: rawName, // Default description
            category: {
              connectOrCreate: {
                where: { slug: "geral" },
                create: { name: "Geral", slug: "geral" },
              },
            },
          },
        });
        createdCount++;
      }

      count++;
      if (count % 100 === 0) {
        process.stdout.write(
          `\r✅ Processados: ${count}/${rows.length - headerIndex - 1}`,
        );
      }
    } catch (error) {
      console.error(`❌ Erro ao processar "${rawName}":`, error.message);
    }
  }

  console.log(`\n\n🏁 Seed concluído!`);
  console.log(`   Processados: ${count}`);
  console.log(`   Criados: ${createdCount}`);
  console.log(`   Atualizados: ${updatedCount}`);
  console.log(`   Pulados: ${skippedCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
