import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoriesData = [
  {
    id: 'iluminacao',
    name: 'Iluminação',
    slug: 'iluminacao',
    description: 'Lâmpadas LED, luminárias, refletores e fitas de LED.',
    image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'protecao',
    name: 'Disjuntores e Proteção',
    slug: 'protecao',
    description: 'Disjuntores, DRs, DPS e quadros de distribuição.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'tomadas',
    name: 'Tomadas e Interruptores',
    slug: 'tomadas',
    description: 'Linhas completas de tomadas, interruptores e placas.',
    image: '/img/categories/tomadas-interruptores.png',
  }
];

const productsData = [
  {
    id: 'bulbo-6.5w',
    name: 'Lâmpada LED Bulbo 6,5W A60',
    category: 'iluminacao',
    subcategory: 'lampadas',
    price: 8.90,
    unit: 'Unidade',
    description: 'Lâmpada LED Bulbo A60 6,5W. Economia de energia e alta durabilidade.',
    variants: [
      { id: '6.5w-3000k', name: '3000K (Branco Quente)', image: '/img/iluminacao/Lampadas/LAMPADA BULBO LED-20260112T181831Z-3-001/LAMPADA BULBO LED/LÂMPADA LED BULBO 6,5W A60 3000K COM CAIXA.JPG' },
      { id: '6.5w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/LAMPADA BULBO LED-20260112T181831Z-3-001/LAMPADA BULBO LED/LÂMPADA LED BULBO 6,5W A60 6500K COM CAIXA.jpg' }
    ],
    defaultVariant: '6.5w-6500k'
  }
];

async function main() {
  console.log('🌱 Seeding Real Data...');

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }

  for (const prod of productsData) {
    const { category, ...prodData } = prod;
    const cat = await prisma.category.findUnique({ where: { id: category } });
    
    if (cat) {
      await prisma.product.upsert({
        where: { id: prod.id },
        update: {
          ...prodData,
          categoryId: cat.id,
          variants: JSON.stringify(prod.variants),
          sku: prod.id,
          stock: 100,
        },
        create: {
          ...prodData,
          categoryId: cat.id,
          variants: JSON.stringify(prod.variants),
          sku: prod.id,
          stock: 100,
        },
      });
    }
  }

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
