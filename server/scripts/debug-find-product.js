
import xlsx from 'xlsx';

const EXCEL_PATH = '../PRODUTOS - ELETROSTART.xlsx';

function main() {
    const workbook = xlsx.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    console.log(`Searching ${data.length} rows...`);
    
    const searchTerms = ["PLUGUE MACHO", "187"];
    
    const hits = data.filter(row => {
        const prod = row['Produto'] || row['Descrição'] || '';
        const price = row['Preço'];
        const jsonRow = JSON.stringify(row).toLowerCase();
        
        // Check fuzzy
        if (prod.toString().toUpperCase().includes("PLUGUE") && prod.toString().toUpperCase().includes("10A")) return true;
        
        return false;
    });
    
    console.log(`Found ${hits.length} matches:`);
    hits.forEach(row => {
        const p = row['Produto'] ? row['Produto'].replace(/\s+/g, ' ').trim() : '';
        console.log(`"${p}" | ${row['Preço']}`);
    });
}

main();
