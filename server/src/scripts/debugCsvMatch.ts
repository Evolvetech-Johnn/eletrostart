
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.resolve(__dirname, '../../../lista_produtos_antigravity.csv');

const normalize = (str: string) => {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
};

const fileContent = fs.readFileSync(csvPath, 'utf-8');
const lines = fileContent.split('\n');

const targetName = "PLUGUE MACHO 2 PINOS 90 GRAUS 10a";
const normTarget = normalize(targetName);

console.log(`Target: "${targetName}"`);
console.log(`Normalized Target: "${normTarget}"`);

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.includes("PLUGUE MACHO 2 PINOS 90 GRAUS 10a")) {
    console.log(`\nFound in CSV at line ${i}:`);
    console.log(`Raw Line: ${JSON.stringify(line)}`);
    const parts = line.split(';');
    const name = parts[1];
    const normName = normalize(name);
    console.log(`CSV Name: "${name}"`);
    console.log(`Norm Name: "${normName}"`);
    console.log(`Match? ${normName === normTarget}`);
    console.log(`Name Char Codes: ${[...name].map(c => c.charCodeAt(0))}`);
    console.log(`Target Char Codes: ${[...targetName].map(c => c.charCodeAt(0))}`);
  }
}
