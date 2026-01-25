import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src', 'data', 'products.js');
console.log(`Reading file: ${filePath}`);

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const marker = '// --- NOVOS PRODUTOS GERADOS ---';
  const index = content.indexOf(marker);

  if (index !== -1) {
    console.log('Marker found. Reverting...');
    let beforeMarker = content.substring(0, index);
    
    // Remove trailing whitespace/newlines
    beforeMarker = beforeMarker.trimEnd();
    
    // Remove trailing comma if present
    if (beforeMarker.endsWith(',')) {
      beforeMarker = beforeMarker.slice(0, -1);
    }
    
    // Add closing bracket
    const newContent = beforeMarker + '\n];\n';
    
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log('Successfully reverted src/data/products.js');
  } else {
    console.log('Marker not found. File might already be reverted.');
  }
} else {
  console.error('File not found!');
}
