import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando integridade do banco de dados...');
  
  const productsCount = await prisma.product.count();
  const activeProducts = await prisma.product.count({ where: { active: true } });
  const inactiveProducts = await prisma.product.count({ where: { active: false } });
  
  console.log(`\n📦 Total de Produtos: ${productsCount}`);
  console.log(`✅ Produtos Ativos (Com Imagem): ${activeProducts}`);
  console.log(`🚫 Produtos Inativos (Sem Imagem): ${inactiveProducts}`);
  
  const sampleActive = await prisma.product.findFirst({ where: { active: true } });
  const sampleInactive = await prisma.product.findFirst({ where: { active: false } });
  
  console.log('\n--- Exemplo Ativo ---');
  console.log(sampleActive ? `${sampleActive.name} | R$ ${sampleActive.price} | Img: ${sampleActive.image}` : 'Nenhum');
  
  console.log('\n--- Exemplo Inativo ---');
  console.log(sampleInactive ? `${sampleInactive.name} | R$ ${sampleInactive.price} | Img: ${sampleInactive.image}` : 'Nenhum');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
