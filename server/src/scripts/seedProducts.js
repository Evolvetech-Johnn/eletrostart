import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoriesData = [
  {
    name: 'Iluminação',
    slug: 'iluminacao',
    description: 'Lâmpadas, luminárias, fitas LED e acessórios de iluminação.',
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Fios e Cabos',
    slug: 'fios-e-cabos',
    description: 'Fios flexíveis, cabos PP, cabos de rede e coaxiais.',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Tomadas e Interruptores',
    slug: 'tomadas-e-interruptores',
    description: 'Conjuntos montados, módulos, placas e suportes.',
    image: 'https://images.unsplash.com/photo-1556610022-26217c24430e?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Proteção Elétrica',
    slug: 'protecao-eletrica',
    description: 'Disjuntores, DRs, DPS e quadros de distribuição.',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?w=500&auto=format&fit=crop&q=60' // Placeholder
  },
  {
    name: 'Ferramentas',
    slug: 'ferramentas',
    description: 'Alicates, chaves, multímetros e ferramentas para eletricistas.',
    image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500&auto=format&fit=crop&q=60'
  }
];

const productsData = [
  // Iluminação
  {
    name: 'Lâmpada LED Bulbo 9W Branca Fria',
    description: 'Lâmpada LED econômica, 6500K, bivolt, base E27. Ideal para ambientes residenciais e comerciais.',
    price: 9.90,
    stock: 150,
    sku: 'LED-BULB-9W-BF',
    unit: 'un',
    categorySlug: 'iluminacao',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500&auto=format&fit=crop&q=60',
    featured: true
  },
  {
    name: 'Lâmpada LED Bulbo 12W Branca Quente',
    description: 'Lâmpada LED 3000K, luz amarela aconchegante, bivolt, base E27.',
    price: 12.50,
    stock: 80,
    sku: 'LED-BULB-12W-BQ',
    unit: 'un',
    categorySlug: 'iluminacao',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Refletor LED 50W IP65 Prova d\'Água',
    description: 'Refletor de alta potência para áreas externas, resistente a chuva.',
    price: 45.90,
    stock: 40,
    sku: 'REF-LED-50W',
    unit: 'un',
    categorySlug: 'iluminacao',
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=500&auto=format&fit=crop&q=60',
    featured: true
  },
  {
    name: 'Fita LED RGB 5050 5 Metros + Controle',
    description: 'Kit completo com fonte e controle remoto. 16 cores e efeitos.',
    price: 59.90,
    stock: 60,
    sku: 'FITA-RGB-5M',
    unit: 'kit',
    categorySlug: 'iluminacao',
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Painel Plafon LED 18W Embutir Quadrado',
    description: 'Design slim moderno, luz branca fria, completo com driver.',
    price: 22.90,
    stock: 100,
    sku: 'PLAFON-18W-EMB',
    unit: 'un',
    categorySlug: 'iluminacao',
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Painel Plafon LED 24W Sobrepor Redondo',
    description: 'Fácil instalação, alto brilho, luz neutra 4000K.',
    price: 35.90,
    stock: 75,
    sku: 'PLAFON-24W-SOB',
    unit: 'un',
    categorySlug: 'iluminacao',
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  
  // Fios e Cabos
  {
    name: 'Cabo Flexível 2.5mm² Vermelho - Rolo 100m',
    description: 'Cabo de cobre com isolação em PVC antichama 750V. Homologado Inmetro.',
    price: 189.90,
    stock: 30,
    sku: 'CABO-2.5-VM-100',
    unit: 'rl',
    categorySlug: 'fios-e-cabos',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?w=500&auto=format&fit=crop&q=60',
    featured: true
  },
  {
    name: 'Cabo Flexível 2.5mm² Azul - Rolo 100m',
    description: 'Cabo de cobre com isolação em PVC antichama 750V. Homologado Inmetro.',
    price: 189.90,
    stock: 35,
    sku: 'CABO-2.5-AZ-100',
    unit: 'rl',
    categorySlug: 'fios-e-cabos',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Cabo Flexível 4.0mm² Preto - Rolo 100m',
    description: 'Ideal para chuveiros e circuitos de maior potência. 750V.',
    price: 289.00,
    stock: 20,
    sku: 'CABO-4.0-PT-100',
    unit: 'rl',
    categorySlug: 'fios-e-cabos',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Cabo Flexível 6.0mm² Verde - Rolo 100m',
    description: 'Cabo para aterramento. Isolação PVC 750V.',
    price: 420.00,
    stock: 15,
    sku: 'CABO-6.0-VD-100',
    unit: 'rl',
    categorySlug: 'fios-e-cabos',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Cabo PP 2x1.5mm² Preto - Metro',
    description: 'Cabo com dupla isolação, ideal para extensões e ligação de equipamentos.',
    price: 3.50,
    stock: 500,
    sku: 'CABO-PP-2X1.5',
    unit: 'm',
    categorySlug: 'fios-e-cabos',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?w=500&auto=format&fit=crop&q=60',
    featured: false
  },

  // Tomadas e Interruptores
  {
    name: 'Conjunto Tomada Simples 10A Branco',
    description: 'Placa 4x2 + suporte + módulo tomada 10A. Linha modular.',
    price: 12.90,
    stock: 200,
    sku: 'TOM-SIMP-10A',
    unit: 'un',
    categorySlug: 'tomadas-e-interruptores',
    image: 'https://images.unsplash.com/photo-1556610022-26217c24430e?w=500&auto=format&fit=crop&q=60',
    featured: true
  },
  {
    name: 'Conjunto Tomada Dupla 10A Branco',
    description: 'Placa 4x2 + suporte + 2 módulos tomada 10A.',
    price: 18.90,
    stock: 150,
    sku: 'TOM-DUP-10A',
    unit: 'un',
    categorySlug: 'tomadas-e-interruptores',
    image: 'https://images.unsplash.com/photo-1556610022-26217c24430e?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Conjunto Interruptor Simples',
    description: 'Placa 4x2 + suporte + módulo interruptor simples.',
    price: 11.90,
    stock: 180,
    sku: 'INT-SIMP',
    unit: 'un',
    categorySlug: 'tomadas-e-interruptores',
    image: 'https://images.unsplash.com/photo-1556610022-26217c24430e?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Conjunto Interruptor + Tomada 10A',
    description: 'Placa 4x2 com 1 interruptor e 1 tomada 10A.',
    price: 19.90,
    stock: 120,
    sku: 'INT-TOM-10A',
    unit: 'un',
    categorySlug: 'tomadas-e-interruptores',
    image: 'https://images.unsplash.com/photo-1556610022-26217c24430e?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Módulo Tomada 20A Vermelho',
    description: 'Tomada específica para equipamentos de maior potência (plugs grossos).',
    price: 8.50,
    stock: 100,
    sku: 'MOD-TOM-20A',
    unit: 'un',
    categorySlug: 'tomadas-e-interruptores',
    image: 'https://images.unsplash.com/photo-1556610022-26217c24430e?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Adaptador T (Benjamin) 10A/20A',
    description: 'Adaptador multiplicador de tomadas 3 saídas. Padrão novo.',
    price: 7.90,
    stock: 300,
    sku: 'ADAPT-T-BENJ',
    unit: 'un',
    categorySlug: 'tomadas-e-interruptores',
    image: 'https://images.unsplash.com/photo-1556610022-26217c24430e?w=500&auto=format&fit=crop&q=60',
    featured: false
  },

  // Proteção Elétrica
  {
    name: 'Disjuntor DIN Unipolar 16A Curva C',
    description: 'Proteção para circuitos de iluminação e tomadas gerais.',
    price: 15.90,
    stock: 100,
    sku: 'DISJ-1P-16A',
    unit: 'un',
    categorySlug: 'protecao-eletrica',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Disjuntor DIN Bipolar 32A Curva C',
    description: 'Proteção para chuveiros elétricos e ar condicionado 220V.',
    price: 45.90,
    stock: 60,
    sku: 'DISJ-2P-32A',
    unit: 'un',
    categorySlug: 'protecao-eletrica',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Disjuntor DR 40A 30mA Tetrapolar',
    description: 'Proteção contra fuga de corrente e choque elétrico. Obrigatório por norma.',
    price: 120.00,
    stock: 20,
    sku: 'DR-40A-30MA',
    unit: 'un',
    categorySlug: 'protecao-eletrica',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?w=500&auto=format&fit=crop&q=60',
    featured: true
  },
  {
    name: 'Quadro de Distribuição 12/16 Disjuntores Embutir',
    description: 'Caixa para disjuntores em PVC branco, tampa opaca.',
    price: 55.00,
    stock: 25,
    sku: 'QDC-12-16',
    unit: 'un',
    categorySlug: 'protecao-eletrica',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'DPS 20kA 275V Clamper',
    description: 'Dispositivo de proteção contra surtos (raios). Protege seus equipamentos.',
    price: 49.90,
    stock: 40,
    sku: 'DPS-20KA',
    unit: 'un',
    categorySlug: 'protecao-eletrica',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?w=500&auto=format&fit=crop&q=60',
    featured: true
  },

  // Ferramentas
  {
    name: 'Alicate Universal 8" Profissional',
    description: 'Cabo isolado 1000V, aço cromo vanádio. Alta durabilidade.',
    price: 45.00,
    stock: 30,
    sku: 'ALIC-UNIV-8',
    unit: 'un',
    categorySlug: 'ferramentas',
    image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500&auto=format&fit=crop&q=60',
    featured: true
  },
  {
    name: 'Jogo Chaves de Fenda/Philips Isoladas 6 Peças',
    description: 'Kit essencial para eletricistas. Isolamento 1000V certificado.',
    price: 89.90,
    stock: 20,
    sku: 'KIT-CHAVES-ISO',
    unit: 'kit',
    categorySlug: 'ferramentas',
    image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Multímetro Digital com Capacímetro',
    description: 'Mede tensão, corrente, resistência e capacitância. Com bateria inclusa.',
    price: 65.00,
    stock: 25,
    sku: 'MULT-DIGITAL',
    unit: 'un',
    categorySlug: 'ferramentas',
    image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Passa Fio Alma de Aço 15 metros',
    description: 'Guia passa fios com ponta flexível e alma de aço. Não enferruja.',
    price: 25.90,
    stock: 50,
    sku: 'PASSA-FIO-15M',
    unit: 'un',
    categorySlug: 'ferramentas',
    image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Fita Isolante 20m Preta Profissional',
    description: 'Alta adesão e flexibilidade. Classe A.',
    price: 9.90,
    stock: 200,
    sku: 'FITA-ISO-20M',
    unit: 'un',
    categorySlug: 'ferramentas',
    image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  
  // Diversos
  {
    name: 'Campainha Sem Fio Longo Alcance',
    description: 'Fácil instalação, resistente a chuva, 32 toques.',
    price: 59.90,
    stock: 30,
    sku: 'CAMP-SEM-FIO',
    unit: 'un',
    categorySlug: 'tomadas-e-interruptores', // Agrupado aqui ou criar categoria diversos
    image: 'https://images.unsplash.com/photo-1556610022-26217c24430e?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Sensor de Presença Teto 360º',
    description: 'Economia de energia, acende a luz automaticamente ao detectar movimento.',
    price: 32.90,
    stock: 45,
    sku: 'SENSOR-TETO',
    unit: 'un',
    categorySlug: 'iluminacao',
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Relé Fotoelétrico (Fotocélula)',
    description: 'Acende a luz ao escurecer e apaga ao amanhecer. Ideal para áreas externas.',
    price: 28.50,
    stock: 50,
    sku: 'FOTOCELULA',
    unit: 'un',
    categorySlug: 'iluminacao',
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=500&auto=format&fit=crop&q=60',
    featured: false
  },
  {
    name: 'Extensão Elétrica 3 Tomadas 5 Metros',
    description: 'Cabo PP plano, plugues 2P+T. Certificado Inmetro.',
    price: 35.00,
    stock: 60,
    sku: 'EXTENSAO-5M',
    unit: 'un',
    categorySlug: 'tomadas-e-interruptores',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?w=500&auto=format&fit=crop&q=60',
    featured: false
  }
];

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Categories
  const categoryMap = {};
  
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap[cat.slug] = createdCat.id;
    console.log(`Created category: ${cat.name}`);
  }

  // 2. Create Products
  let count = 0;
  for (const prod of productsData) {
    const { categorySlug, ...productData } = prod;
    const categoryId = categoryMap[categorySlug];

    if (!categoryId) {
      console.warn(`Category slug not found: ${categorySlug} for product ${prod.name}`);
      continue;
    }

    // Check if product exists by SKU to avoid duplicates if running multiple times
    const existing = await prisma.product.findUnique({
      where: { sku: productData.sku }
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          ...productData,
          categoryId
        }
      });
      console.log(`Created product: ${prod.name}`);
      count++;
    } else {
        // Optional: Update existing
        await prisma.product.update({
            where: { id: existing.id },
            data: {
                ...productData,
                categoryId
            }
        });
        console.log(`Updated product: ${prod.name}`);
    }
  }

  console.log(`✅ Seed finished. ${count} new products created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
