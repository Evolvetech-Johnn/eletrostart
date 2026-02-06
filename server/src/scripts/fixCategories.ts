
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Adjust path to point to public/img/Categorias
// server/src/scripts -> server/src -> server -> ../public/img/Categorias
const CATEGORIES_DIR = path.join(__dirname, "../../../public/img/Categorias");

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function generateSku(categorySlug: string, index: number): string {
  const prefix = categorySlug.substring(0, 3).toUpperCase();
  const suffix = index.toString().padStart(4, "0");
  return `${prefix}-${suffix}`;
}

async function main() {
  console.log("Starting Category and Product Audit...");

  if (!fs.existsSync(CATEGORIES_DIR)) {
    console.error(`Directory not found: ${CATEGORIES_DIR}`);
    process.exit(1);
  }

  const folders = fs.readdirSync(CATEGORIES_DIR).filter((file) => {
    return fs.statSync(path.join(CATEGORIES_DIR, file)).isDirectory();
  });

  console.log(`Found ${folders.length} category folders.`);

  for (const folder of folders) {
    const slug = slugify(folder);
    const name = folder; // Use folder name as Category Name
    const folderPath = path.join(CATEGORIES_DIR, folder);

    console.log(`Processing Category: ${name} (${slug})`);

    // 1. Upsert Category
    // Find first image for category image
    const files = fs.readdirSync(folderPath).filter(f => /\.(png|jpg|jpeg|svg|webp)$/i.test(f));
    let categoryImage = "";
    if (files.length > 0) {
      categoryImage = `/img/Categorias/${folder}/${files[0]}`;
    }

    const category = await prisma.category.upsert({
      where: { slug: slug },
      update: {
        name: name, // Ensure name matches folder
        image: categoryImage, // Update image if needed
      },
      create: {
        name: name,
        slug: slug,
        description: `Categoria ${name}`,
        image: categoryImage,
      },
    });

    console.log(`  - Category ID: ${category.id}`);

    // 2. Process Products in Folder
    let productIndex = 0;
    for (const file of files) {
      productIndex++;
      const fileNameNoExt = path.parse(file).name;
      const productName = fileNameNoExt.replace(/_/g, " "); // Basic cleanup
      const imagePath = `/img/Categorias/${folder}/${file}`;

      // Try to find product by image path OR name
      // Ideally unique image path is a good identifier if we trust the structure
      const existingProduct = await prisma.product.findFirst({
        where: {
          OR: [
            { image: imagePath },
            { name: productName }
          ]
        }
      });

      let sku = existingProduct?.sku;
      if (!sku) {
        // Generate SKU if missing
        // Try to keep it unique.
        // If we generate collision, we might need a loop or better logic.
        // For now, simple logic.
        let attempt = 0;
        while (!sku) {
             const candidateSku = generateSku(slug, productIndex + attempt);
             const check = await prisma.product.findUnique({ where: { sku: candidateSku } });
             if (!check) {
                 sku = candidateSku;
             } else {
                 attempt++;
             }
        }
      }

      const productData = {
        name: productName,
        image: imagePath,
        categoryId: category.id,
        active: true,
        sku: sku,
        // Default values for new products
        price: existingProduct?.price || 0,
        stock: existingProduct?.stock || 0,
      };

      if (existingProduct) {
        await prisma.product.update({
            where: { id: existingProduct.id },
            data: productData
        });
        // console.log(`  - Updated product: ${productName}`);
      } else {
        await prisma.product.create({
            data: productData
        });
        console.log(`  - Created product: ${productName} (SKU: ${sku})`);
      }
    }
  }

  console.log("Audit complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
