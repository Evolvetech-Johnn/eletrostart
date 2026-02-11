import { prisma } from "../lib/prisma";
import fs from "fs";
import path from "path";

// Adjust path to point to public/img/Categorias
// Assuming process.cwd() is the server root
const CATEGORIES_DIR = path.join(process.cwd(), "../public/img/Categorias");

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

export const syncCategoriesService = async () => {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  log("Starting Category and Product Audit...");

  if (!fs.existsSync(CATEGORIES_DIR)) {
    const error = `Directory not found: ${CATEGORIES_DIR}`;
    console.error(error);
    throw new Error(error);
  }

  const folders = fs.readdirSync(CATEGORIES_DIR).filter((file) => {
    return fs.statSync(path.join(CATEGORIES_DIR, file)).isDirectory();
  });

  log(`Found ${folders.length} category folders.`);

  let stats = {
    categoriesProcessed: 0,
    productsProcessed: 0,
    productsCreated: 0,
    productsUpdated: 0,
  };

  for (const folder of folders) {
    const slug = slugify(folder);
    const name = folder; // Use folder name as Category Name
    const folderPath = path.join(CATEGORIES_DIR, folder);

    log(`Processing Category: ${name} (${slug})`);

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

    stats.categoriesProcessed++;
    log(`  - Category ID: ${category.id}`);

    // 2. Process Products in Folder
    let productIndex = 0;
    for (const file of files) {
      productIndex++;
      const fileNameNoExt = path.parse(file).name;
      const productName = fileNameNoExt.replace(/_/g, " "); // Basic cleanup
      const imagePath = `/img/Categorias/${folder}/${file}`;

      // Try to find product by image path OR name
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
        sku = generateSku(slug, productIndex);
      }

      if (existingProduct) {
        // Update existing
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            categoryId: category.id, // Enforce correct category
            image: imagePath, // Ensure image path is correct
            sku: sku, // Ensure SKU exists
            active: true
          }
        });
        stats.productsUpdated++;
      } else {
        // Create new
        await prisma.product.create({
          data: {
            name: productName,
            description: `Produto ${productName}`,
            price: 0, // Default
            stock: 0, // Default
            sku: sku,
            image: imagePath,
            categoryId: category.id,
            active: true
          }
        });
        stats.productsCreated++;
      }
      stats.productsProcessed++;
    }
  }

  log("Audit Complete.");
  return { stats, logs };
};
