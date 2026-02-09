import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.resolve(
  __dirname,
  "../../../lista_produtos_antigravity.csv",
);

const normalize = (str: string) => {
  if (!str) return "";
  return str.trim().toLowerCase().replace(/\s+/g, " ");
};

const getBasename = (pathStr: string) => {
  if (!pathStr) return "";
  const parts = pathStr.split("/");
  const filename = parts[parts.length - 1];
  // Remove extension
  return filename.split(".").slice(0, -1).join(".");
};

const parsePrice = (priceStr: string) => {
  if (!priceStr) return 0;
  const dotPrice = priceStr.replace(",", ".");
  const price = parseFloat(dotPrice);
  return isNaN(price) ? 0 : price;
};

async function fixZeroPrices() {
  console.log("🚀 Starting Zero Price Fix Script (v2 - Enhanced Matching)");
  console.log(`📄 Reading CSV from: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error("❌ CSV file not found!");
    return;
  }

  const fileContent = fs.readFileSync(csvPath, "utf-8");
  const lines = fileContent.split("\n");

  // Maps
  const nameToPrice = new Map<string, number>();
  const imageToPrice = new Map<string, number>();

  let loadedCount = 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(";");
    // ID[0];Nome[1];Categoria[2];Subcategoria[3];Preço[4];Unidade[5];Imagem[6];Descrição[7]
    if (parts.length < 5) continue;

    const name = parts[1];
    const priceRaw = parts[4];
    const imagePath = parts[6];

    if (priceRaw) {
      const price = parsePrice(priceRaw);
      if (price > 0) {
        // Map by Name
        if (name) nameToPrice.set(normalize(name), price);

        // Map by Image Basename
        if (imagePath) {
          const basename = getBasename(imagePath);
          if (basename) {
            imageToPrice.set(normalize(basename), price);
          }
        }
        loadedCount++;
      }
    }
  }

  console.log(`📊 Loaded ${loadedCount} prices from CSV.`);

  // Fetch Zero Price Products (Active AND Inactive to rescue previous deactivations)
  const products = await prisma.product.findMany({
    where: {
      OR: [{ price: 0 }, { price: { lt: 0.01 } }],
    },
  });

  console.log(`🔍 Found ${products.length} products with price 0 to fix.`);

  let updatedCount = 0;
  let deactivatedCount = 0;
  let rescuedCount = 0;

  for (const product of products) {
    const normName = normalize(product.name);

    let correctPrice = nameToPrice.get(normName);
    let matchMethod = "Name";

    if (!correctPrice) {
      // Try Image Basename Match (assuming Product Name matches Image Basename)
      correctPrice = imageToPrice.get(normName);
      matchMethod = "ImageBasename";
    }

    if (correctPrice) {
      // Update Price & Ensure Active
      console.log(
        `✅ Fixing (${matchMethod}): "${product.name}" -> ${correctPrice}`,
      );

      const wasInactive = !product.active;

      await prisma.product.update({
        where: { id: product.id },
        data: {
          price: correctPrice,
          active: true, // Reactivate if we found a valid price
        },
      });

      updatedCount++;
      if (wasInactive) rescuedCount++;
    } else {
      // Deactivate
      // Only log if it wasn't already inactive
      if (product.active) {
        console.log(`⚠️ Price not found for: "${product.name}". Deactivating.`);
        await prisma.product.update({
          where: { id: product.id },
          data: { active: false },
        });
        deactivatedCount++;
      }
    }
  }

  console.log("\n🏁 Execution Summary:");
  console.log(`- Total Zero-Price Products Processed: ${products.length}`);
  console.log(`- Fixed (Updated Price): ${updatedCount}`);
  console.log(`- Rescued (Reactivated): ${rescuedCount}`);
  console.log(`- Deactivated (Not in List): ${deactivatedCount}`);

  // Validation check
  const remaining = await prisma.product.count({
    where: {
      active: true,
      OR: [{ price: 0 }, { price: { lt: 0.01 } }],
    },
  });

  if (remaining === 0) {
    console.log(
      "✅ VALIDATION SUCCESS: No active products with zero price remain.",
    );
  } else {
    console.log(
      `❌ VALIDATION WARNING: ${remaining} active products still have zero price!`,
    );
  }
}

fixZeroPrices()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
