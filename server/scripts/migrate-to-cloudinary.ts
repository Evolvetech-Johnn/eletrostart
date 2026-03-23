import { PrismaClient } from "@prisma/client";
import { uploadImageToStore } from "../src/services/cloudinary.service";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

async function migrate() {
  console.log("🚀 Iniciando migração de arquivos locais para Cloudinary...");

  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log("ℹ️ Pasta /uploads não encontrada. Nada para migrar.");
    return;
  }

  // 1. Migrar ProductImage (Galerias)
  const productImages = await prisma.productImage.findMany({
    where: { url: { startsWith: "/uploads/" } }
  });

  console.log(`📸 Encontradas ${productImages.length} imagens de galeria para migrar.`);
  for (const img of productImages) {
    try {
      const localPath = path.join(process.cwd(), img.url);
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const newUrl = await uploadImageToStore(buffer, path.basename(localPath), `eletrostart/produtos/${img.productId}`);
        await prisma.productImage.update({
          where: { id: img.id },
          data: { url: newUrl }
        });
        console.log(`✅ Migrada: ${img.url} -> ${newUrl}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao migrar ProductImage ${img.id}:`, error);
    }
  }

  // 2. Migrar Product.image (Imagem Principal)
  const products = await prisma.product.findMany({
    where: { image: { startsWith: "/uploads/" } }
  });

  console.log(`📦 Encontrados ${products.length} produtos com imagem principal local.`);
  for (const product of products) {
    try {
      if (!product.image) continue;
      const localPath = path.join(process.cwd(), product.image);
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const newUrl = await uploadImageToStore(buffer, path.basename(localPath), `eletrostart/produtos/${product.id}`);
        await prisma.product.update({
          where: { id: product.id },
          data: { image: newUrl }
        });
        console.log(`✅ Migrada Principal: ${product.image} -> ${newUrl}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao migrar Produto ${product.id}:`, error);
    }
  }

  // 3. Migrar Category.image
  const categories = await prisma.category.findMany({
    where: { image: { startsWith: "/uploads/" } }
  });

  console.log(`📂 Encontradas ${categories.length} categorias para migrar.`);
  for (const cat of categories) {
    try {
      if (!cat.image) continue;
      const localPath = path.join(process.cwd(), cat.image);
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const newUrl = await uploadImageToStore(buffer, path.basename(localPath), `eletrostart/categorias`);
        await prisma.category.update({
          where: { id: cat.id },
          data: { image: newUrl }
        });
        console.log(`✅ Migrada Categoria: ${cat.image} -> ${newUrl}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao migrar Categoria ${cat.id}:`, error);
    }
  }

  console.log("🏁 Migração concluída!");
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
