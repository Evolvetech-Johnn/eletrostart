
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelPath = path.resolve(__dirname, '../PRODUTOS - ELETROSTART.xlsx');

console.log(`Reading file from: ${excelPath}`);

try {
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  console.log(`Sheet Name: ${sheetName}`);
  const worksheet = workbook.Sheets[sheetName];
  
  // Get first row to check columns
  const data = XLSX.utils.sheet_to_json(worksheet);
  if (data.length > 0) {
    const firstRow = data[0];
    console.log('Columns found:', Object.keys(firstRow));
    console.log('First row sample:', JSON.stringify(firstRow, null, 2));
  } else {
    console.log('No data found in sheet');
  }
  
} catch (error) {
  console.error('Error reading Excel:');
  console.error(error);
}
