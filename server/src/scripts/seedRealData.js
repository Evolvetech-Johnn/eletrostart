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
  },
  {
    id: 'solar',
    name: 'Energia Solar',
    slug: 'solar',
    description: 'Painéis solares, inversores, estruturas e conectores.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'ferramentas',
    name: 'Ferramentas',
    slug: 'ferramentas',
    description: 'Alicates, chaves, multímetros e ferramentas para eletricistas.',
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'chuveiros-torneiras',
    name: 'Chuveiros e Torneiras',
    slug: 'chuveiros-torneiras',
    description: 'Chuveiros elétricos, torneiras e duchas para residências e comércios.',
    image: '/img/categories/chuveiros-torneiras.png',
  },
  {
    id: 'fios-cabos',
    name: 'Fios e Cabos',
    slug: 'fios-cabos',
    description: 'Fios e cabos para instalações elétricas diversas.',
    image: '/img/categories/fios-cabos.png',
  },
  {
    id: 'industrial',
    name: 'Industrial',
    slug: 'industrial',
    description: 'Materiais elétricos para uso industrial e fabril.',
    image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=400',
  }
];

const productsData = [
  // Iluminação
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
  },
  {
    id: 'bulbo-9w',
    name: 'Lâmpada LED Bulbo 9W A60',
    category: 'iluminacao',
    subcategory: 'lampadas',
    price: 9.90,
    unit: 'Unidade',
    description: 'Lâmpada LED Bulbo A60 9W. Ideal para ambientes residenciais.',
    variants: [
      { id: '9w-3000k', name: '3000K (Branco Quente)', image: '/img/iluminacao/Lampadas/LAMPADA BULBO LED-20260112T181831Z-3-001/LAMPADA BULBO LED/LAMPADA BULBO A60 9W 3000K COM CAIXA.jpg' },
      { id: '9w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/LAMPADA BULBO LED-20260112T181831Z-3-001/LAMPADA BULBO LED/LAMPADA BULBO A60 9W 6500K COM CAIXA.jpg' }
    ],
    defaultVariant: '9w-6500k'
  },
  {
    id: 'bulbo-12w',
    name: 'Lâmpada LED Bulbo 12W A60',
    category: 'iluminacao',
    subcategory: 'lampadas',
    price: 12.90,
    unit: 'Unidade',
    description: 'Lâmpada LED Bulbo A60 12W. Maior luminosidade para ambientes maiores.',
    variants: [
      { id: '12w-3000k', name: '3000K (Branco Quente)', image: '/img/iluminacao/Lampadas/LAMPADA BULBO LED-20260112T181831Z-3-001/LAMPADA BULBO LED/LÂMPADA LED BULBO 12W A60 3000K COM CAIXA.JPG' },
      { id: '12w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/LAMPADA BULBO LED-20260112T181831Z-3-001/LAMPADA BULBO LED/LÂMPADA LED BULBO12W A60 6500K COM CAIXA.JPG' }
    ],
    defaultVariant: '12w-6500k'
  },
  {
    id: 'bulbo-15w',
    name: 'Lâmpada LED Bulbo 15W A60',
    category: 'iluminacao',
    subcategory: 'lampadas',
    price: 15.90,
    unit: 'Unidade',
    description: 'Lâmpada LED Bulbo A60 15W. Alta potência para iluminação.',
    variants: [
      { id: '15w-3000k', name: '3000K (Branco Quente)', image: '/img/iluminacao/Lampadas/LAMPADA BULBO LED-20260112T181831Z-3-001/LAMPADA BULBO LED/LÂMPADA LED BULBO 15W A60 3000K COM CAIXA.JPG' },
      { id: '15w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/LAMPADA BULBO LED-20260112T181831Z-3-001/LAMPADA BULBO LED/LÂMPADA LED BULBO 15W A60 6500K COM CAIXA.JPG' }
    ],
    defaultVariant: '15w-6500k'
  },
  {
    id: 'painel-12w-embutir',
    name: 'Painel LED Backlight 12W Embutir',
    category: 'iluminacao',
    subcategory: 'paineis',
    price: 25.90,
    unit: 'Unidade',
    description: 'Painel LED Backlight 12W para embutir. Design moderno e luz uniforme.',
    variants: [
      { id: '12w-emb-3000k', name: '3000K (Branco Quente)', image: '/img/iluminacao/Lampadas/PAINEL LED PLAFON-20260112T181832Z-3-001/PAINEL LED PLAFON/PAINEL BACKLIGHT 12W EMBUTIR 3000-4000-6500K.jpg' },
      { id: '12w-emb-4000k', name: '4000K (Branco Neutro)', image: '/img/iluminacao/Lampadas/PAINEL LED PLAFON-20260112T181832Z-3-001/PAINEL LED PLAFON/PAINEL BACKLIGHT 12W EMBUTIR 3000-4000-6500K.jpg' },
      { id: '12w-emb-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/PAINEL LED PLAFON-20260112T181832Z-3-001/PAINEL LED PLAFON/PAINEL BACKLIGHT 12W EMBUTIR 3000-4000-6500K.jpg' }
    ],
    defaultVariant: '12w-emb-6500k'
  },
  {
    id: 'refletor-50w',
    name: 'Refletor Slim LED 50W',
    category: 'iluminacao',
    subcategory: 'refletores',
    price: 65.90,
    unit: 'Unidade',
    description: 'Refletor Slim LED 50W 120° 6500K Autovolt. Para quadras e estacionamentos.',
    variants: [
      { id: '50w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/REFLETORES SLIM LED-20260112T181835Z-3-001/REFLETORES SLIM LED/REFLETOR SLIM LED 50W 120 6500K AUTOVOLT ALUMÍNIO.png' }
    ],
    defaultVariant: '50w-6500k'
  },
  
  // Chuveiros
  {
    id: 'chuveiro-advanced',
    name: 'Chuveiro Advanced Eletrônica Lorenzetti',
    category: 'chuveiros-torneiras',
    subcategory: 'chuveiros',
    price: 189.90,
    unit: 'Unidade',
    description: 'Chuveiro eletrônico Advanced com controle de temperatura. Segurança e conforto para o banho.',
    images: ['/img/chuveiros-e-torneiras/lorenzetti/advanced-eletronica.png'],
    features: ['Controle eletrônico de temperatura', 'Sistema de segurança integrado', 'Economia de energia', 'Fácil instalação']
  },
  {
    id: 'chuveiro-bella-ducha',
    name: 'Chuveiro Bella Ducha 4 Temperaturas Ultra Lorenzetti',
    category: 'chuveiros-torneiras',
    subcategory: 'chuveiros',
    price: 159.90,
    unit: 'Unidade',
    description: 'Chuveiro Bella Ducha com 4 opções de temperatura. Conforto total no banho.',
    images: ['/img/chuveiros-e-torneiras/lorenzetti/bella-ducha-4temperaturas-ultra.png'],
    features: ['4 temperaturas', 'Ultra economia de energia', 'Tecnologia Ultra Banho', 'Design moderno']
  },
  
  // Fios e Cabos
  {
    id: 'fio-sil-multibitola',
    name: 'Fio SIL - Flexível 450/750V',
    category: 'fios-cabos',
    subcategory: 'fios-flexiveis',
    price: 4.90,
    unit: 'Metro',
    description: 'Fio SIL flexível 450/750V. Disponível em várias bitolas de 1,5mm² a 10mm². Ideal para instalações residenciais e comerciais.',
    variants: [
      { id: 'fio-sil-azul', name: 'Azul - Neutro', color: 'Azul', image: '/img/fios-cabos/fio-sil/fio-sil-azul-usar-para-todas-as-bitolas.png' },
      { id: 'fio-sil-preto', name: 'Preto - Fase/Retorno', color: 'Preto', image: '/img/fios-cabos/fio-sil/fio-sil-preto-usar-para-todas-as-bitolas-1,5mm-a-10mm.png' },
      { id: 'fio-sil-vermelho', name: 'Vermelho - Fase', color: 'Vermelho', image: '/img/fios-cabos/fio-sil/fio-sil-vermelho-usar-para-todas-as-bitolas-1,5mm-a-10mm.png' }
    ],
    defaultVariant: 'fio-sil-azul'
  },
  
  // Proteção
  {
    id: 'disjuntor-mono-6ka',
    name: 'Disjuntor Monofásico DIN 6kA',
    category: 'protecao',
    subcategory: 'disjuntores',
    price: 12.50,
    unit: 'Unidade',
    description: 'Disjuntor termomagnético monofásico DIN com capacidade de interrupção de 6kA.',
    images: ['/img/protecao/disjuntores/monofasico-6ka.png'],
    features: ['Padrão DIN', 'Capacidade 6kA', 'Proteção contra sobrecarga', 'Fácil instalação'],
    specifications: { amperagens: ['10A', '16A', '20A', '25A', '32A', '40A', '50A', '63A'] }
  },
  
  // Tomadas
  {
    id: 'conjunto-margirius-b3',
    name: 'Conjunto Interruptor Simples + Tomada 10A Margirius',
    category: 'tomadas',
    subcategory: 'conjuntos',
    price: 24.90,
    unit: 'Conjunto',
    description: 'Conjunto completo Margirius Linha B3 com interruptor simples e tomada 10A.',
    images: ['/img/interruptores-e-tomadas/margirius/margirius-linha-b3-interruptor-simples-tomada-10a-placa-+-suporte.png'],
    features: ['Linha B3', 'Inclui placa e suporte', 'Interruptor simples + tomada 10A', 'Branco fosco']
  }
];

async function main() {
  console.log('🌱 Starting REAL DATA seed...');

  // 1. Upsert Categories
  for (const cat of categoriesData) {
    // Check if category exists by ID to avoid unique constraint on slug if using different ID logic
    // But here ID and Slug match logic, so let's use slug
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image
      }
    });
    console.log(`Synced category: ${cat.name}`);
  }

  // 2. Upsert Products
  for (const prod of productsData) {
    // Find category ID by slug
    const category = await prisma.category.findUnique({
      where: { slug: prod.category }
    });

    if (!category) {
      console.warn(`Category not found for product: ${prod.name} (${prod.category})`);
      continue;
    }

    // Prepare image path
    // Logic: if variants exist, use image from default variant or first variant. 
    // If images array exists, use first one.
    let mainImage = null;
    if (prod.variants && prod.variants.length > 0) {
      const defaultVar = prod.variants.find(v => v.id === prod.defaultVariant);
      mainImage = defaultVar ? defaultVar.image : prod.variants[0].image;
    } else if (prod.images && prod.images.length > 0) {
      mainImage = prod.images[0];
    } else if (prod.image) {
        mainImage = prod.image;
    }

    // Clean up data for Prisma
    const { id, category: catSlug, images, variants, features, specifications, ...rest } = prod;

    // We can't use the original ID because it might not be UUID, but we can try to use it if it fits or map it.
    // The current schema uses String @id @default(uuid()), so we can use string IDs.
    
    // Upsert product by SKU (using ID as SKU equivalent for now or just name check)
    // Actually, let's use the ID from the file as the ID in database if possible, or store it in SKU.
    // Let's store original ID as SKU to be safe and maintain reference.
    
    const productData = {
      name: prod.name,
      description: prod.description,
      price: prod.price,
      unit: prod.unit,
      stock: 100, // Default stock
      sku: prod.id, // Store original ID as SKU
      image: mainImage || '',
      categoryId: category.id,
      subcategory: prod.subcategory,
      variants: JSON.stringify(variants || []),
      features: JSON.stringify(features || []),
      specifications: JSON.stringify(specifications || {}),
      images: JSON.stringify(images || []),
      active: true
    };

    const existing = await prisma.product.findUnique({
        where: { sku: prod.id }
    });

    if (existing) {
        await prisma.product.update({
            where: { id: existing.id },
            data: productData
        });
        console.log(`Updated product: ${prod.name}`);
    } else {
        await prisma.product.create({
            data: productData
        });
        console.log(`Created product: ${prod.name}`);
    }
  }

  console.log('✅ Seed finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
