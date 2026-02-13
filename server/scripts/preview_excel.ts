
import ExcelJS from 'exceljs';
import path from 'path';

async function readExcel() {
  const filePath = path.resolve(process.cwd(), '../PRODUTOS - ELETROSTART.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.getWorksheet(1); // First sheet
  if (!worksheet) {
    console.error('No worksheet found');
    return;
  }

  const rows = [];
  for (let i = 1; i <= 10; i++) {
    const row = worksheet.getRow(i).values;
    rows.push({ row: i, content: row });
  }
  const fs = await import('fs');
  fs.writeFileSync('excel_preview.json', JSON.stringify(rows, null, 2));
  console.log('Preview written to excel_preview.json');
}

readExcel().catch(console.error);
