import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

interface CategoryMetadata {
  name: string;
  subcategories: { id: string; name: string }[];
}

const CATEGORY_METADATA: Record<string, CategoryMetadata> = {
  iluminacao: {
    name: "Iluminação",
    subcategories: [
      { id: "fitas-mangueiras", name: "Fitas e Mangueiras LED" },
      { id: "luminarias", name: "Luminárias" },
      { id: "luminarias-emergencia", name: "Luminárias de emergência" },
      { id: "lustres-pendentes", name: "Lustres e Pendentes" },
      { id: "lampadas-bulbo", name: "Lâmpadas Bulbo" },
      { id: "lampadas-decorativas", name: "Lâmpadas Decorativas" },
      { id: "lampadas-tubulares", name: "Lâmpadas Tubulares" },
      { id: "paineis-led", name: "Painéis LED" },
      { id: "plafon-plafonier", name: "Plaflon e Plafonier" },
      { id: "refletores-led", name: "Refletores LED" },
      { id: "spot", name: "Spot" },
    ],
  },
  "chuveiros-torneiras": {
    name: "Chuveiros e Torneiras",
    subcategories: [
      { id: "aquecedores", name: "Aquecedores" },
      { id: "chuveiros", name: "Chuveiros" },
      { id: "resistencias", name: "Resistências" },
      { id: "torneiras-eletricas", name: "Torneiras Elétricas" },
    ],
  },
  "fios-cabos": {
    name: "Fios e Cabos",
    subcategories: [
      { id: "fios-flexiveis", name: "Fios Flexíveis" },
      { id: "cabos-pp", name: "Cabos PP" },
      { id: "cabos-energia", name: "Cabos de Energia" },
      { id: "cabos-paralelos", name: "Cabos Paralelos" },
    ],
  },
  "industrial-protecao": {
    name: "Industrial e Proteção",
    subcategories: [
      { id: "acessorios", name: "Acessórios" },
      { id: "auto-transformador", name: "Auto Transformador" },
      { id: "barramento-pente", name: "Barramento Pente" },
      { id: "disjuntores-caixa-moldada", name: "Disjuntores Caixa Moldada" },
      { id: "disjuntores-din", name: "Disjuntores Din" },
      { id: "disjuntores-nema", name: "Disjuntores Nema" },
      { id: "interruptores-diferencial", name: "Interruptores Diferencial" },
      { id: "quadros-comando", name: "Quadros de Comando" },
      { id: "quadros-medicoes", name: "Quadros e Medições" },
      { id: "terminal", name: "Terminal" },
    ],
  },
  tomadas: {
    name: "Interruptores e Tomadas",
    subcategories: [
      { id: "tomadas", name: "Tomadas" },
      { id: "interruptores", name: "Interruptores" },
      { id: "interruptores-tomadas", name: "Interruptores e Tomadas" },
      { id: "conjuntos", name: "Conjuntos Montados" },
      { id: "plugues", name: "Plugues e Adaptadores" },
    ],
  },
  ferramentas: {
    name: "Ferramentas",
    subcategories: [
      { id: "alicates", name: "Alicates" },
      { id: "chaves", name: "Chaves de Fenda/Philips" },
      { id: "multimetros", name: "Multímetros" },
      { id: "furadeiras", name: "Furadeiras e Parafusadeiras" },
      { id: "brocas", name: "Brocas" },
    ],
  },
  diversos: {
    name: "Diversos",
    subcategories: [{ id: "outros", name: "Outros" }],
  },
};

const products = [
  // --- ILUMINAÇÃO ---
  {
    id: "lampada-bulbo-9w-6500k",
    name: "Lâmpada LED Bulbo A60 9W 6500K",
    category: "iluminacao",
    subcategory: "lampadas-bulbo",
    price: 9.9,
    unit: "Unidade",
    description:
      "Lâmpada LED Bulbo 9W 6500K Branco Frio. Economia e durabilidade.",
    image:
      "/img/Categorias/LAMPADA BULBO LED/LAMPADA BULBO A60 9W 6500K COM CAIXA.jpg",
  },
  {
    id: "lampada-bulbo-9w-3000k",
    name: "Lâmpada LED Bulbo A60 9W 3000K",
    category: "iluminacao",
    subcategory: "lampadas-bulbo",
    price: 9.9,
    unit: "Unidade",
    description:
      "Lâmpada LED Bulbo 9W 3000K Branco Quente. Ideal para ambientes aconchegantes.",
    image:
      "/img/Categorias/LAMPADA BULBO LED/LAMPADA BULBO A60 9W 3000K COM CAIXA.jpg",
  },
];

async function main() {
  console.log("🌱 Seeding Products...");

  // Create Categories
  for (const [slug, metadata] of Object.entries(CATEGORY_METADATA)) {
    await prisma.category.upsert({
      where: { slug },
      update: {
        name: metadata.name,
        // subcategories: JSON.stringify(metadata.subcategories)
      },
      create: {
        slug,
        name: metadata.name,
        // subcategories: JSON.stringify(metadata.subcategories)
      },
    });
  }

  // Create Products
  for (const prod of products) {
    const { category, ...prodData } = prod;
    const cat = await prisma.category.findUnique({ where: { slug: category } });

    if (cat) {
      await prisma.product.upsert({
        where: { id: prod.id },
        update: {
          ...prodData,
          categoryId: cat.id,
          stock: 100,
          sku: prod.id,
        },
        create: {
          ...prodData,
          categoryId: cat.id,
          stock: 100,
          sku: prod.id,
        },
      });
    }
  }

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
