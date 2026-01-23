import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public/img');
const reportFile = path.join(__dirname, '../reports/audit-images.json');

const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

console.log('Starting image audit...');

try {
  const allFiles = getAllFiles(publicDir);
  
  const images = allFiles.map(file => {
    // Convert to public path starting with /img/...
    // normalized path separator
    const relativePath = file.substring(file.indexOf('public') + 6).replace(/\\/g, '/');
    return relativePath;
  });

  const byFolder = {};
  images.forEach(img => {
    const folder = path.dirname(img);
    byFolder[folder] = (byFolder[folder] || 0) + 1;
  });

  const result = {
    totalImages: images.length,
    byFolder,
    images
  };

  fs.writeFileSync(reportFile, JSON.stringify(result, null, 2));
  console.log(`Image audit saved to ${reportFile}`);
} catch (error) {
  console.error('Error auditing images:', error);
  process.exit(1);
}
