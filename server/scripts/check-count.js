import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.product.count();
    console.log(`\n📊 Total de produtos no banco de dados: ${count}`);
    
    if (count < 100) {
        console.log("⚠️  Quantidade abaixo de 100. Necessário popular.");
        process.exit(1); // Exit code 1 indicates need to populate
    } else {
        console.log("✅  Banco já possui dados suficientes.");
        process.exit(0);
    }
  } catch (error) {
    console.error('❌ Erro ao contar produtos:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
