import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const CATEGORY_METADATA = {
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
    description: "Lâmpada LED Bulbo 9W 3000K Branco Quente. Luz aconchegante.",
    image:
      "/img/Categorias/LAMPADA BULBO LED/LAMPADA BULBO A60 9W 3000K COM CAIXA.jpg",
  },
  {
    id: "lampada-bulbo-12w-6500k",
    name: "Lâmpada LED Bulbo 12W 6500K",
    category: "iluminacao",
    subcategory: "lampadas-bulbo",
    price: 12.9,
    unit: "Unidade",
    description: "Lâmpada LED Bulbo 12W 6500K Branco Frio.",
    image:
      "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO12W A60 6500K COM CAIXA.JPG",
  },
  {
    id: "lampada-bulbo-15w-6500k",
    name: "Lâmpada LED Bulbo 15W 6500K",
    category: "iluminacao",
    subcategory: "lampadas-bulbo",
    price: 15.9,
    unit: "Unidade",
    description: "Lâmpada LED Bulbo 15W 6500K Branco Frio.",
    image:
      "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO 15W A60 6500K COM CAIXA.JPG",
  },
  {
    id: "lampada-bulbo-50w-high-power",
    name: "Lâmpada LED Bulbo T100 50W 6500K",
    category: "iluminacao",
    subcategory: "lampadas-bulbo",
    price: 49.9,
    unit: "Unidade",
    description:
      "Lâmpada LED Alta Potência 50W 6500K. Ideal para grandes ambientes.",
    image:
      "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO 50W T100 6500K SEM CAIXA.JPG",
  },
  {
    id: "tubular-t8-20w-120cm",
    name: "Lâmpada Tubular LED T8 20W 1.20m 6500K",
    category: "iluminacao",
    subcategory: "lampadas-tubulares",
    price: 22.9,
    unit: "Unidade",
    description:
      "Lâmpada Tubular LED T8 20W 1.20m Branco Frio. Substitui fluorescentes de 40W.",
    image: "/img/Categorias/TUBULAR T8/TUBULAR T8 20W 6500K 1,20M.jpg",
  },
  {
    id: "tubular-t8-9w-60cm",
    name: "Lâmpada Tubular LED T8 9.9W 60cm 6500K",
    category: "iluminacao",
    subcategory: "lampadas-tubulares",
    price: 18.9,
    unit: "Unidade",
    description: "Lâmpada Tubular LED T8 9.9W 60cm Branco Frio.",
    image:
      "/img/Categorias/TUBULAR T8/TUBULAR T8 9,9W 60CM 3000-4000-6500K COM CAIXA.jpg",
  },
  {
    id: "painel-backlight-18w-embutir",
    name: "Painel LED Backlight 18W Embutir Quadrado",
    category: "iluminacao",
    subcategory: "paineis-led",
    price: 29.9,
    unit: "Unidade",
    description: "Painel LED de embutir 18W. Design slim e moderno.",
    image:
      "/img/Categorias/PAINEL LED PLAFON/PAINEL BACKLIGHT 18W EMBUTIR 3000-4000-6500K COM CAIXA.png",
  },
  {
    id: "painel-backlight-24w-sobrepor",
    name: "Painel LED Backlight 24W Sobrepor Quadrado",
    category: "iluminacao",
    subcategory: "paineis-led",
    price: 39.9,
    unit: "Unidade",
    description: "Painel LED de sobrepor 24W. Fácil instalação.",
    image:
      "/img/Categorias/PAINEL LED PLAFON/PAINEL BACKLIGHT 24W SOBREPOR 3000-4000-6500K SEM CAIXA.png",
  },
  {
    id: "refletor-slim-100w",
    name: "Refletor LED Slim 100W 6500K",
    category: "iluminacao",
    subcategory: "refletores-led",
    price: 89.9,
    unit: "Unidade",
    description:
      "Refletor LED 100W Bivolt. Alta luminosidade para áreas externas.",
    image:
      "/img/Categorias/REFLETORES SLIM LED/REFLETOR SLIM LED 100W 120 6500K AUTOVOLT ALUMÍNIO.png",
  },
  {
    id: "refletor-slim-30w",
    name: "Refletor LED Slim 30W 6500K",
    category: "iluminacao",
    subcategory: "refletores-led",
    price: 39.9,
    unit: "Unidade",
    description: "Refletor LED 30W Bivolt. Ideal para jardins e fachadas.",
    image:
      "/img/Categorias/REFLETORES SLIM LED/REFLETOR SLIM LED 30W 120 6500K AUTOVOLT ALUMÍNIO.png",
  },
  {
    id: "luminaria-galaxy-36w",
    name: "Luminária Galaxy Style Tube 36W 6500K",
    category: "iluminacao",
    subcategory: "luminarias",
    price: 45.9,
    unit: "Unidade",
    description: "Luminária completa de sobrepor 36W.",
    image:
      "/img/Categorias/LUMINARIAS/Luminaria galaxy style tube 36w 6500k com embalagem .png",
  },
  // --- CHUVEIROS E TORNEIRAS ---
  {
    id: "aquecedor-versatil-lorenzetti",
    name: "Aquecedor Elétrico Versátil 5500W 127V",
    category: "chuveiros-torneiras",
    subcategory: "aquecedores",
    price: 189.9,
    unit: "Unidade",
    description:
      "Aquecedor elétrico versátil Lorenzetti para pias e lavatórios.",
    image:
      "/img/Categorias/AQUECEDORES LORENZETTI/Aquecedor elétrico versatil 5500W 127V branco lorenzetti.png",
  },
  {
    id: "chuveiro-advanced-eletronica",
    name: "Chuveiro Advanced Eletrônica",
    category: "chuveiros-torneiras",
    subcategory: "chuveiros",
    price: 149.9,
    unit: "Unidade",
    description:
      "Chuveiro Lorenzetti Advanced com controle eletrônico de temperatura.",
    image: "/img/Categorias/CHUVEIROS LORENZETTI/advanced-eletronica.png",
  },
  {
    id: "chuveiro-top-jet-eletronica",
    name: "Chuveiro Top Jet Eletrônica",
    category: "chuveiros-torneiras",
    subcategory: "chuveiros",
    price: 129.9,
    unit: "Unidade",
    description: "Chuveiro Lorenzetti Top Jet com comando eletrônico.",
    image: "/img/Categorias/CHUVEIROS LORENZETTI/top-jet-eletronica.png",
  },
  {
    id: "chuveiro-bella-ducha",
    name: "Chuveiro Bella Ducha 4 Temperaturas",
    category: "chuveiros-torneiras",
    subcategory: "chuveiros",
    price: 59.9,
    unit: "Unidade",
    description: "Bella Ducha 4 temperaturas. Econômica e eficiente.",
    image:
      "/img/Categorias/CHUVEIROS LORENZETTI/bella-ducha-4TEMPERATURAS-ultra.png",
  },
  {
    id: "torneira-prima-touch",
    name: "Torneira Eletrônica Prima Touch Zagonel",
    category: "chuveiros-torneiras",
    subcategory: "torneiras-eletricas",
    price: 289.9,
    unit: "Unidade",
    description: "Torneira eletrônica com tecnologia touch e bica giratória.",
    image:
      "/img/Categorias/TORNEIRA ELETRONICA ZAGONEL/PRIMA TOUCH ZAGONEL.png",
  },
  {
    id: "torneira-luna",
    name: "Torneira Eletrônica Luna Zagonel",
    category: "chuveiros-torneiras",
    subcategory: "torneiras-eletricas",
    price: 249.9,
    unit: "Unidade",
    description: "Torneira eletrônica Luna, design moderno e eficiência.",
    image:
      "/img/Categorias/TORNEIRA ELETRONICA ZAGONEL/TORNEIRA ELETRONICA ZAGONEL LUNA.png",
  },
  // --- FIOS E CABOS ---
  {
    id: "fio-sil-1-5mm-vermelho",
    name: "Fio Sólido 1.5mm Vermelho SIL",
    category: "fios-cabos",
    subcategory: "fios-flexiveis",
    price: 1.2,
    unit: "Metro",
    description:
      "Fio flexível 1.5mm Vermelho, ideal para instalações residenciais.",
    image:
      "/img/Categorias/FIOS SIL 1,5MM - 10MM/FIO SIL VERMELHO USAR PARA TODAS AS BITOLAS 1,5MM A 10MM.png",
  },
  {
    id: "fio-sil-2-5mm-azul",
    name: "Fio Flexível 2.5mm Azul SIL",
    category: "fios-cabos",
    subcategory: "fios-flexiveis",
    price: 1.9,
    unit: "Metro",
    description: "Fio flexível 2.5mm Azul, ideal para tomadas.",
    image:
      "/img/Categorias/FIOS SIL 1,5MM - 10MM/FIO SIL AZUL USAR PARA TODAS AS BITOLAS.png",
  },
  {
    id: "fio-sil-2-5mm-verde",
    name: "Fio Flexível 2.5mm Verde SIL",
    category: "fios-cabos",
    subcategory: "fios-flexiveis",
    price: 1.9,
    unit: "Metro",
    description: "Fio flexível 2.5mm Verde, padrão para terra.",
    image:
      "/img/Categorias/FIOS SIL 1,5MM - 10MM/FIO SIL VERDE USAR PARA TODAS AS FOTOS.png",
  },
  {
    id: "cabo-pp-2x1-5",
    name: "Cabo PP 2x1.5mm",
    category: "fios-cabos",
    subcategory: "cabos-pp",
    price: 3.5,
    unit: "Metro",
    description: "Cabo PP 2 vias de 1.5mm, flexível e resistente.",
    image: "/img/Categorias/CABO PP/CABO PP 2 VIAS.png",
  },
  {
    id: "cabo-pp-3-vias",
    name: "Cabo PP 3 Vias",
    category: "fios-cabos",
    subcategory: "cabos-pp",
    price: 4.5,
    unit: "Metro",
    description: "Cabo PP 3 vias, ideal para extensões e equipamentos.",
    image: "/img/Categorias/CABO PP/Cabo PP 3 VIAS.png",
  },
  {
    id: "cabo-paralelo-2x1-5",
    name: "Cabo Paralelo 2x1.5mm",
    category: "fios-cabos",
    subcategory: "cabos-paralelos",
    price: 2.5,
    unit: "Metro",
    description: "Cabo paralelo branco 2x1.5mm.",
    image:
      "/img/Categorias/CABO PARALELO 2 VIAS/CABO PARALELO 2x1,5mm USAR PARA TODOS.png",
  },
  // --- INDUSTRIAL E PROTEÇÃO ---
  {
    id: "autotransformador-300va",
    name: "Autotransformador 300VA",
    category: "industrial-protecao",
    subcategory: "auto-transformador",
    price: 89.9,
    unit: "Unidade",
    description: "Autotransformador Bivolt 300VA. Converte 110V/220V.",
    image: "/img/Categorias/AUTOTRANSFORMADORES/Autotransformador 300VA.png",
  },
  {
    id: "autotransformador-5000va",
    name: "Autotransformador 5000VA",
    category: "industrial-protecao",
    subcategory: "auto-transformador",
    price: 459.9,
    unit: "Unidade",
    description: "Autotransformador potente 5000VA para equipamentos pesados.",
    image: "/img/Categorias/AUTOTRANSFORMADORES/Autotransformador 5000VA.png",
  },
  {
    id: "abracadeira-1-pol",
    name: "Abraçadeira Fixa Tubo PVC 1 Pol",
    category: "industrial-protecao",
    subcategory: "acessorios",
    price: 0.9,
    unit: "Unidade",
    description: "Abraçadeira para fixação de eletrodutos de 1 polegada.",
    image:
      "/img/Categorias/ELETRODUTOS-COMPONENTES/ABRACADEIRA FIXA TUBO PVC 1 POLEGADA CZ HIDROSSOL.png",
  },
  {
    id: "luva-3-4-pvc",
    name: "Luva 3/4 PVC Cinza",
    category: "industrial-protecao",
    subcategory: "acessorios",
    price: 1.5,
    unit: "Unidade",
    description: "Luva de emenda para eletroduto PVC 3/4.",
    image:
      "/img/Categorias/ELETRODUTOS-COMPONENTES/LUVA 3 4 PVC CZ HIDROSSOL.png",
  },
  {
    id: "disjuntor-din-mono-10a-soprano",
    name: "Disjuntor DIN Monofásico 10A Soprano",
    category: "industrial-protecao",
    subcategory: "disjuntores-din",
    price: 12.9,
    unit: "Unidade",
    description: "Disjuntor termomagnético padrão DIN 1x10A.",
    image:
      "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x10A SOPRANO.png",
  },
  {
    id: "disjuntor-din-bifasico-40a-soprano",
    name: "Disjuntor DIN Bifásico 40A Soprano",
    category: "industrial-protecao",
    subcategory: "disjuntores-din",
    price: 35.9,
    unit: "Unidade",
    description: "Disjuntor termomagnético padrão DIN 2x40A.",
    image:
      "/img/Categorias/DISJUNTORES/DISJUNTOR DIN BIFASICO 2x40A SOPRANO.png",
  },
  {
    id: "disjuntor-din-trifasico-63a-soprano",
    name: "Disjuntor DIN Trifásico 63A Soprano",
    category: "industrial-protecao",
    subcategory: "disjuntores-din",
    price: 55.9,
    unit: "Unidade",
    description: "Disjuntor termomagnético padrão DIN 3x63A.",
    image:
      "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3x63A SOPRANO.png",
  },
  {
    id: "disjuntor-nema-mono-50a",
    name: "Disjuntor NEMA Monofásico 50A",
    category: "industrial-protecao",
    subcategory: "disjuntores-nema",
    price: 18.9,
    unit: "Unidade",
    description: "Disjuntor padrão NEMA (preto) 1x50A.",
    image: "/img/Categorias/DISJUNTORES/DISJUNTOR NEMA MONO 1x50A SOPRANO.png",
  },
  {
    id: "disjuntor-caixa-moldada-150a",
    name: "Disjuntor Caixa Moldada 150A",
    category: "industrial-protecao",
    subcategory: "disjuntores-caixa-moldada",
    price: 289.0,
    unit: "Unidade",
    description: "Disjuntor industrial caixa moldada 150A com borne.",
    image:
      "/img/Categorias/DISJUNTORES/DISJUNTOR TRIFASICO 3x150A CX MOLDADA C BORNE SOPRANO.png",
  },
  // --- INTERRUPTORES E TOMADAS ---
  {
    id: "conjunto-interruptor-simples-tomada",
    name: "Conjunto Interruptor Simples + Tomada 10A",
    category: "tomadas",
    subcategory: "interruptores-tomadas",
    price: 15.9,
    unit: "Unidade",
    description:
      "Conjunto montado Margirius Linha B3: 1 Interruptor + 1 Tomada 10A.",
    image:
      "/img/Categorias/INTERRUPTORES E TOMADAS/MARGIRIUS LINHA B3 INTERRUPTOR SIMPLES TOMADA 10a PLACA + SUPORTE.png",
  },
  {
    id: "plugue-macho-2-pinos",
    name: "Plugue Macho 2 Pinos 10A",
    category: "tomadas",
    subcategory: "plugues",
    price: 3.9,
    unit: "Unidade",
    description: "Plugue macho 2 pinos 10A, saída lateral 90 graus.",
    image:
      "/img/Categorias/PLUGUES MACHO E FEMEA/PLUGUE MACHO 2 PINOS 90 GRAUS 10a.png",
  },
  {
    id: "plugue-femea-3-polos",
    name: "Plugue Fêmea 3 Polos 10A",
    category: "tomadas",
    subcategory: "plugues",
    price: 4.5,
    unit: "Unidade",
    description: "Plugue fêmea 3 polos 10A Margirius.",
    image:
      "/img/Categorias/PLUGUES MACHO E FEMEA/Pino femea margirius 10a 3 polo.png",
  },
  // --- FERRAMENTAS ---
  {
    id: "broca-aco-rapido",
    name: "Broca Aço Rápido",
    category: "ferramentas",
    subcategory: "brocas",
    price: 12.9,
    unit: "Unidade",
    description: "Broca de aço rápido de alta resistência.",
    image: "/img/Categorias/BROCAS AÇO RAPIDO/BROCA AÇO RAPIDO.png",
  },
];

async function main() {
  console.log("🌱 Iniciando seed de Produtos e Categorias...");

  // 1. Criar Categorias
  for (const [key, data] of Object.entries(CATEGORY_METADATA)) {
    const category = await prisma.category.upsert({
      where: { slug: key },
      update: {
        name: data.name,
      },
      create: {
        name: data.name,
        slug: key,
      },
    });
    console.log(`✅ Categoria atualizada: ${category.name}`);
  }

  // 2. Criar Produtos
  for (const p of products) {
    // Buscar ID da categoria pelo slug
    const category = await prisma.category.findUnique({
      where: { slug: p.category },
    });

    if (!category) {
      console.warn(
        `⚠️ Categoria não encontrada para produto ${p.name}: ${p.category}`,
      );
      continue;
    }

    // Criar ou atualizar produto
    const product = await prisma.product.upsert({
      where: { sku: p.id }, // Usando o ID do JSON como SKU para unicidade
      update: {
        name: p.name,
        price: p.price,
        unit: p.unit,
        description: p.description,
        image: p.image,
        categoryId: category.id,
        subcategory: p.subcategory,
        stock: 100, // Estoque padrão
        active: true,
      },
      create: {
        sku: p.id,
        name: p.name,
        price: p.price,
        unit: p.unit,
        description: p.description,
        image: p.image,
        categoryId: category.id,
        subcategory: p.subcategory,
        stock: 100,
        active: true,
      },
    });
    console.log(`✅ Produto atualizado: ${product.name}`);
  }

  console.log("🏁 Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
