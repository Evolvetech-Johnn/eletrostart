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
  // Remove "R$", spaces, dots (thousand separators)
  // Replace comma with dot
  const cleanStr = priceStr
    .replace(/[^\d,.-]/g, "") // Keep digits, comma, dot, minus
    .replace(/\./g, "") // Remove thousand separator dots
    .replace(",", "."); // Replace decimal comma with dot

  const num = parseFloat(cleanStr);
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
  if (rows.length === 0) {
    console.error("❌ Nenhuma linha encontrada na tabela.");
    process.exit(1);
  }

  // Look for header row
  let headerIndex = -1;
  let nameColIndex = -1;
  let priceColIndex = -1;

  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = rows[i];
    const nameIdx = row.findIndex((cell) => /produto/i.test(cell));
    const priceIdx = row.findIndex((cell) => /preço|valor/i.test(cell));

    if (nameIdx !== -1 && priceIdx !== -1) {
      headerIndex = i;
      nameColIndex = nameIdx;
      priceColIndex = priceIdx;
      break;
    }
  }

  if (headerIndex === -1) {
    console.error(
      '❌ Não foi possível identificar as colunas "Produto" e "Preço".',
    );
    console.log("Amostra das primeiras linhas:", rows.slice(0, 5));
    process.exit(1);
  }

  console.log(
    `✅ Cabeçalho encontrado na linha ${headerIndex + 1}. Colunas: Produto[${nameColIndex}], Preço[${priceColIndex}]`,
  );

  // 5. Process Rows
  let createdCount = 0;
  let updatedCount = 0;
  let totalProcessed = 0;

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length <= Math.max(nameColIndex, priceColIndex)) continue;

    const rawName = row[nameColIndex];
    const rawPrice = row[priceColIndex];

    if (!rawName) continue; // Skip empty names

    totalProcessed++;

    // Normalize and Prepare Data
    const price = parsePrice(rawPrice);
    const normalizedName = normalize(rawName);

    // Check for Image
    const imagePath = imageMap.get(normalizedName) || null;
    const hasImage = !!imagePath;

    // Determine Visibility
    // User Rule:
    // - With Image -> visible: true
    // - Without Image -> visible: false
    // Map to 'active' field in DB (assuming 'active' controls visibility based on schema)
    // Note: Schema has 'active' defaulting to true. We will enforce it.
    const isVisible = hasImage;

    const slug =
      normalizedName.replace(/\s+/g, "-") || `prod-${Date.now()}-${i}`;

    try {
      // Upsert Product
      // We match by 'name' (if unique) or 'slug'.
      // Schema says 'sku' is unique, 'slug' in Category is unique.
      // Product model has 'sku' unique. 'name' is NOT unique in schema but usually is.
      // Let's use 'sku' as the unique identifier generated from name/slug to be safe.
      // Or if the product exists by Name? Schema doesn't enforce unique Name.
      // But we should try to update if it exists.
      // Strategy: Find first by Name (or generated SKU), if found update, else create.
      // Since 'sku' is unique, let's use normalized name as SKU.

      const sku = slug;

      await prisma.product.upsert({
        where: { sku: sku },
        update: {
          price: price,
          image: imagePath, // Update image if found (or null if not? User said "Devem aparecer automaticamente quando uma imagem for adicionada futuramente" - this implies we should update it if we find one, but if we don't find one, should we clear it? "Caso não exista imagem... imageUrl = null". Yes.)
          active: isVisible,
          // We don't change name to preserve original casing if it exists, or maybe we update it?
          // Let's update name to match HTML if we want to sync.
          // But maybe better to keep existing name if just updating price/vis?
          // User said "Banco populado com todos os produtos". implies full sync.
          name: rawName,
        },
        create: {
          name: rawName,
          description: rawName, // Default description
          price: price,
          stock: 100, // Default stock
          sku: sku,
          image: imagePath,
          unit: "un",
          active: isVisible,
          // categoryId: null // We don't have category info in this list
        },
      });

      // We can't easily distinguish created vs updated with upsert in one go without result checking,
      // but for logs we can assume success.
      // Actually upsert returns the record.

      // console.log(`Processed: ${rawName} | Price: ${price} | Img: ${hasImage ? 'YES' : 'NO'}`);
    } catch (error) {
      console.error(`❌ Erro ao processar "${rawName}":`, error);
    }
  }

  console.log(`\n🏁 Processamento Finalizado!`);
  console.log(`Total Processado: ${totalProcessed}`);
  console.log(`Verifique o banco de dados para os resultados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
