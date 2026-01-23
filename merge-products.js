import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsPath = path.join(__dirname, 'src', 'data', 'products.js');
const generatedPath = path.join(__dirname, 'generated-products.json');

const productsContent = fs.readFileSync(productsPath, 'utf8');
const generatedContent = fs.readFileSync(generatedPath, 'utf8');
const newProducts = JSON.parse(generatedContent);

// Convert new products to a string representation that fits the file style
// We'll just use JSON.stringify but strip the outer brackets
const newProductsString = JSON.stringify(newProducts, null, 2)
  .trim()
  .slice(1, -1) // Remove [ and ]
  .trim(); // Remove whitespace

// Find the last occurrence of ];
const lastBracketIndex = productsContent.lastIndexOf('];');

if (lastBracketIndex === -1) {
  console.error('Could not find closing bracket in products.js');
  process.exit(1);
}

const newContent = 
  productsContent.slice(0, lastBracketIndex) + 
  ',\n  // --- NOVOS PRODUTOS GERADOS ---\n  ' + 
  newProductsString + 
  '\n];';

fs.writeFileSync(productsPath, newContent, 'utf8');
console.log('Merged', newProducts.length, 'products into src/data/products.js');
