import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesReportPath = path.join(__dirname, "../reports/audit-images.json");
const productsReportPath = path.join(
  __dirname,
  "../reports/audit-products-db.json",
);
const diffReportPath = path.join(__dirname, "../reports/audit-diff.json");

console.log("Starting audit diff...");

try {
  if (!fs.existsSync(imagesReportPath) || !fs.existsSync(productsReportPath)) {
    console.error(
      "Previous audit reports missing. Run audit:images and audit:products first.",
    );
    process.exit(1);
  }

  const imagesData = JSON.parse(fs.readFileSync(imagesReportPath, "utf8"));
  const productsData = JSON.parse(fs.readFileSync(productsReportPath, "utf8"));

  const diskImages = new Set(imagesData.images);
  const dbImages = productsData.imagePathsInDb; // These are strings

  const missingImageProducts = productsData.productsMissingImage;

  const brokenPathProducts = [];
  const duplicateImageUsage = [];
  const imageUsageCount = {};

  // Analyze DB images usage
  productsData.productsWithBrokenImagePath.forEach((p) => {
    // Already flagged as format broken
    brokenPathProducts.push(p);
  });

  // We need to fetch all products to check logic again or just rely on imagePathsInDb?
  // Let's use imagePathsInDb for Orphan check, but we need product mapping for broken link check
  // Since audit-products-db.json didn't export full list, we might miss some details if we don't assume consistency.
  // Wait, audit-products-db.json exported "productsMissingImage" and "productsWithBrokenImagePath".
  // It implies we need to check if the image path actually exists on disk.

  // We can't rely solely on "productsWithBrokenImagePath" from db script because that only checked format.
  // We need to check if the file exists.

  // BUT we don't have the full product list in the report...
  // I should have exported full products or checked existence there?
  // The prompt says: "Comparar imagens x produtos".
  // I should probably modify audit-products-db to export all products or at least the map of id->image.

  // Let's rely on reading the DB again? No, "Executar apenas scripts offline".
  // I'll modify audit-products-db.mjs to include a lightweight list of all products {id, image} or I can infer from what I have?
  // No, I need to know which products point to non-existent images.

  // Check all products for broken image paths (file doesn't exist on disk)
  const allProducts = productsData.allProducts || [];
  
  allProducts.forEach((product) => {
    if (!product.image) return;
    
    // Check if image exists on disk
    if (!diskImages.has(product.image)) {
      brokenPathProducts.push({
        id: product.id,
        name: product.name,
        image: product.image,
        category: product.category
      });
    }
    
    // Track image usage count
    imageUsageCount[product.image] = (imageUsageCount[product.image] || 0) + 1;
  });

  // Find duplicate image usage
  Object.entries(imageUsageCount).forEach(([imagePath, count]) => {
    if (count > 1) {
      const productsUsingThis = allProducts.filter(p => p.image === imagePath);
      duplicateImageUsage.push({
        imagePath,
        count,
        products: productsUsingThis.map(p => ({ id: p.id, name: p.name }))
      });
    }
  });

  // Find orphan images (images on disk not referenced by any product)
  const orphanImages = [];
  diskImages.forEach((imgPath) => {
    if (!dbImages.includes(imgPath)) {
      orphanImages.push(imgPath);
    }
  });

  const result = {
    timestamp: new Date().toISOString(),
    totalImages: imagesData.totalImages,
    totalProducts: productsData.totalProducts,
    missingImageProducts: missingImageProducts.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category
    })),
    brokenPathProducts,
    orphanImages,
    duplicateImageUsage,
    summary: {
      productsWithoutImage: missingImageProducts.length,
      productsWithBrokenPath: brokenPathProducts.length,
      orphanImagesCount: orphanImages.length,
      duplicateUsageCount: duplicateImageUsage.length
    }
  };

  fs.writeFileSync(diffReportPath, JSON.stringify(result, null, 2));
  console.log(`\n✅ Diff report saved to ${diffReportPath}`);
  
  console.log(`\n📊 AUDIT DIFF SUMMARY:`);
  console.log(`   Total Images on Disk: ${result.totalImages}`);
  console.log(`   Total Products in DB: ${result.totalProducts}`);
  console.log(`   Products Missing Image: ${result.summary.productsWithoutImage}`);
  console.log(`   Products with Broken Path: ${result.summary.productsWithBrokenPath}`);
  console.log(`   Orphan Images: ${result.summary.orphanImagesCount}`);
  console.log(`   Duplicate Image Usage: ${result.summary.duplicateUsageCount}`);
  
  if (result.summary.productsWithoutImage > 0) {
    console.log(`\n⚠️  ${result.summary.productsWithoutImage} products need images assigned`);
  }
  if (result.summary.productsWithBrokenPath > 0) {
    console.log(`⚠️  ${result.summary.productsWithBrokenPath} products have broken image paths`);
  }
  if (result.summary.orphanImagesCount > 0) {
    console.log(`ℹ️  ${result.summary.orphanImagesCount} images on disk are not used by any product`);
  }

} catch (e) {
  console.error('Error generating diff:', e);
  process.exit(1);
}
