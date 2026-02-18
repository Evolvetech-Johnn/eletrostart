/* eslint-env node */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import process from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para listar arquivos recursivamente
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

// Caminho para a pasta de imagens
const imagesDir = path.join(__dirname, "public", "img", "Categorias");

// Obter todas as imagens
let allImages = [];
try {
  allImages = getAllFiles(imagesDir);
} catch (e) {
  console.error("Erro ao ler diretório de imagens:", e.message);
  process.exit(1);
}

// Normalizar caminhos para comparação (usar barras normais e remover parte do caminho absoluto)
const normalizedImages = allImages.map((img) => {
  // Pega apenas a parte relativa a partir de public
  const relativePath = img.split("public")[1].replace(/\\/g, "/");
  return relativePath;
});

console.log(
  `Total de arquivos de imagem encontrados em public/img/Categorias: ${normalizedImages.length}`,
);

// Ler products.js como texto
const productsPath = path.join(__dirname, "src", "data", "products.js");
const productsContent = fs.readFileSync(productsPath, "utf8");

// Extrair caminhos de imagem usados em products.js usando regex
// Procura por "image: '/img/Categorias/..." ou "\"image\": '/img/Categorias/..."
const usedImagesRegex =
  /(?:image|["']image["']):\s*["'](\/img\/Categorias\/[^"']+)["']/g;
const usedImages = [];
let match;

while ((match = usedImagesRegex.exec(productsContent)) !== null) {
  usedImages.push(match[1]);
  // if (usedImages.length > 90) console.log('Found:', match[0]); // Debug
}

console.log(
  `Total de referências de imagem encontradas em products.js: ${usedImages.length}`,
);

// Comparar
const unusedImages = normalizedImages.filter(
  (img) => !usedImages.includes(img),
);
const missingImages = usedImages.filter(
  (img) => !normalizedImages.includes(img),
);

const report = [];
report.push("\n--- Relatório de Auditoria ---");
report.push(`Imagens na pasta: ${normalizedImages.length}`);
report.push(`Imagens referenciadas no código: ${usedImages.length}`);

if (unusedImages.length > 0) {
  report.push(
    `\n⚠️  ${unusedImages.length} Imagens na pasta NÃO usadas no código:`,
  );
  unusedImages.forEach((img) => report.push(`  - ${img}`));
} else {
  report.push("\n✅ Todas as imagens da pasta estão sendo usadas.");
}

if (missingImages.length > 0) {
  report.push(
    `\n❌ ${missingImages.length} Imagens referenciadas no código NÃO encontradas na pasta:`,
  );
  missingImages.forEach((img) => report.push(`  - ${img}`));
} else {
  report.push(
    "\n✅ Todas as referências de imagem no código apontam para arquivos existentes.",
  );
}

fs.writeFileSync("audit-result.txt", report.join("\n"));
console.log("Relatório salvo em audit-result.txt");
