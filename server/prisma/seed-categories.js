
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    slug: "iluminacao",
    name: "Iluminação",
    description: "Lâmpadas LED, luminárias, refletores, painéis e fitas de LED.",
    image: "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO 15W A60 6500K COM CAIXA.JPG",
  },
  {
    slug: "fios-cabos",
    name: "Fios e Cabos",
    description: "Fios e cabos para instalações elétricas diversas.",
    image: "/img/Categorias/FIOS SIL 1,5MM - 10MM/FIO SIL AZUL USAR PARA TODAS AS BITOLAS.png",
  },
  {
    slug: "protecao",
    name: "Disjuntores e Proteção",
    description: "Disjuntores DIN e NEMA, mono, bifásicos e trifásicos.",
    image: "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1X32A STECK.png",
  },
  {
    slug: "chuveiros-torneiras",
    name: "Chuveiros e Torneiras",
    description: "Chuveiros, torneiras elétricas e aquecedores.",
    image: "/img/Categorias/CHUVEIROS LORENZETTI/advanced-eletronica.png",
  },
  {
    slug: "tomadas",
    name: "Tomadas e Interruptores",
    description: "Linhas completas de tomadas, interruptores e plugues.",
    image: "/img/Categorias/INTERRUPTORES E TOMADAS/MARGIRIUS LINHA B3 INTERRUPTOR SIMPLES TOMADA 10a PLACA + SUPORTE.png",
  },
  {
    slug: "transformadores",
    name: "Transformadores",
    description: "Autotransformadores de diversas potências.",
    image: "/img/Categorias/AUTOTRANSFORMADORES/Autotransformador 5000VA.png",
  },
  {
    slug: "ferramentas",
    name: "Ferramentas",
    description: "Brocas e ferramentas para eletricistas.",
    image: "/img/Categorias/BROCAS AÇO RAPIDO/BROCA AÇO RAPIDO.png",
  },
  {
    slug: "infraestrutura",
    name: "Eletrodutos e Conexões",
    description: "Eletrodutos, abraçadeiras, luvas e conexões para infraestrutura elétrica.",
    image: "/img/Categorias/ELETRODUTOS-COMPONENTES/LUVA 1 PVC CZ HIDROSSOL.png",
  },
  {
    slug: "diversos",
    name: "Diversos",
    description: "Outros produtos e acessórios.",
    image: "/img/Categorias/eletrostart-logo.png", // Fallback image
  }
];

async function main() {
  console.log('🌱 Seeding categories...');

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: cat.slug }
    });

    if (existing) {
      console.log(`✓ Exists: ${cat.name}`);
      // Update info just in case
      await prisma.category.update({
        where: { slug: cat.slug },
        data: {
          name: cat.name,
          description: cat.description,
          image: cat.image
        }
      });
    } else {
      await prisma.category.create({
        data: cat
      });
      console.log(`+ Created: ${cat.name}`);
    }
  }

  const count = await prisma.category.count();
  console.log(`\n✅ Total Categories: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
