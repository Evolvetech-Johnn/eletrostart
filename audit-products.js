/* eslint-env node */
// Auditoria Completa de Produtos e Imagens
// Este script verifica se todos os produtos têm imagens e se todas as imagens existem

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import process from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar todos os produtos
const PRODUCTS_PATH = path.join(__dirname, "src", "data", "products.js");

// Função para verificar se arquivo existe
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Função para extrair todos os caminhos de imagem de um arquivo
function extractImagePaths(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const imageRegex = /images:\s*\[([^\]]+)\]/g;
  const pathRegex = /['"]([^'"]+)['"]/g;

  const imagePaths = [];
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    const imagesArray = match[1];
    let pathMatch;
    while ((pathMatch = pathRegex.exec(imagesArray)) !== null) {
      imagePaths.push(pathMatch[1]);
    }
  }

  return imagePaths;
}

// Arquivos de dados de produtos
const productFiles = [
  "src/data/iluminacaoProducts.js",
  "src/data/chuveirosProducts.js",
  "src/data/fiosCabosProducts.js",
  "src/data/protecaoProducts.js",
  "src/data/tomadasInterruptoresProducts.js",
  "src/data/products.js",
];

console.log("🔍 AUDITORIA COMPLETA DE PRODUTOS E IMAGENS\n");
console.log("=".repeat(60));

let totalImages = 0;
let existingImages = 0;
let missingImages = 0;
const missingImagesList = [];
const allImagePaths = new Set();

// Verificar cada arquivo de produtos
productFiles.forEach((file) => {
  const fullPath = path.join(__dirname, file);

  if (!fileExists(fullPath)) {
    console.log(`⚠️  Arquivo não encontrado: ${file}`);
    return;
  }

  console.log(`\n📄 Analisando: ${file}`);

  const imagePaths = extractImagePaths(fullPath);

  if (imagePaths.length === 0) {
    console.log(
      "   ✅ Nenhuma imagem referenciada (arquivo vazio ou sem produtos)",
    );
    return;
  }

  console.log(`   📸 Imagens encontradas: ${imagePaths.length}`);

  imagePaths.forEach((imgPath) => {
    allImagePaths.add(imgPath);
    totalImages++;

    // Converter caminho relativo para absoluto
    const absolutePath = path.join(__dirname, "public", imgPath);

    if (fileExists(absolutePath)) {
      existingImages++;
      console.log(`   ✅ ${imgPath}`);
    } else {
      missingImages++;
      missingImagesList.push({ file, path: imgPath });
      console.log(`   ❌ FALTANDO: ${imgPath}`);
    }
  });
});

// Resumo final
console.log("\n" + "=".repeat(60));
console.log("\n📊 RESUMO DA AUDITORIA\n");
console.log(`Total de imagens referenciadas: ${totalImages}`);
console.log(`Imagens únicas: ${allImagePaths.size}`);
console.log(`✅ Imagens existentes: ${existingImages}`);
console.log(`❌ Imagens faltando: ${missingImages}`);

if (missingImages > 0) {
  console.log("\n⚠️  IMAGENS FALTANDO:\n");
  missingImagesList.forEach(({ file, path }) => {
    console.log(`   ${file}:`);
    console.log(`   → ${path}\n`);
  });
  console.log("❌ AUDITORIA FALHOU - Existem produtos sem imagens!");
  process.exit(1);
} else {
  console.log("\n✅ AUDITORIA APROVADA - Todas as imagens existem!");
  process.exit(0);
}
