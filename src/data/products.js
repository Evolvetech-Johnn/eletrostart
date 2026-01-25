export const categories = [
  {
    id: "iluminacao",
    name: "Iluminação",
    slug: "iluminacao",
    description:
      "Lâmpadas LED, luminárias, refletores, painéis e fitas de LED.",
    image:
      "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO 15W A60 6500K COM CAIXA.JPG",
  },
  {
    id: "fios-cabos",
    name: "Fios e Cabos",
    slug: "fios-cabos",
    description: "Fios e cabos para instalações elétricas diversas.",
    image:
      "/img/Categorias/FIOS SIL 1,5MM - 10MM/FIO SIL AZUL USAR PARA TODAS AS BITOLAS.png",
  },
  {
    id: "protecao",
    name: "Disjuntores e Proteção",
    slug: "protecao",
    description: "Disjuntores DIN e NEMA, mono, bifásicos e trifásicos.",
    image:
      "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1X32A STECK.png",
  },
  {
    id: "chuveiros-torneiras",
    name: "Chuveiros e Torneiras",
    slug: "chuveiros-torneiras",
    description: "Chuveiros, torneiras elétricas e aquecedores.",
    image: "/img/Categorias/CHUVEIROS LORENZETTI/advanced-eletronica.png",
  },
  {
    id: "tomadas",
    name: "Tomadas e Interruptores",
    slug: "tomadas",
    description: "Linhas completas de tomadas, interruptores e plugues.",
    image:
      "/img/Categorias/INTERRUPTORES E TOMADAS/MARGIRIUS LINHA B3 INTERRUPTOR SIMPLES TOMADA 10a PLACA + SUPORTE.png",
  },
  {
    id: "transformadores",
    name: "Transformadores",
    slug: "transformadores",
    description: "Autotransformadores de diversas potências.",
    image: "/img/Categorias/AUTOTRANSFORMADORES/Autotransformador 5000VA.png",
  },
  {
    id: "ferramentas",
    name: "Ferramentas",
    slug: "ferramentas",
    description: "Brocas e ferramentas para eletricistas.",
    image: "/img/Categorias/BROCAS AÇO RAPIDO/BROCA AÇO RAPIDO.png",
  },
];

export const products = [
  // --- ILUMINAÇÃO ---
  // Lâmpadas Bulbo
  {
    id: "lampada-led-bulbo-6.5w",
    name: "Lâmpada LED Bulbo 6,5W A60",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "lampadas",
    price: 8.9,
    unit: "Unidade",
    description:
      "Lâmpada LED Bulbo A60 6,5W. Economia de energia e alta durabilidade.",
    image:
      "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO 6,5W A60 6500K COM CAIXA.jpg",
    variants: [
      {
        id: "6.5w-3000k",
        name: "3000K (Branco Quente)",
        image:
          "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO 6,5W A60 3000K COM CAIXA.JPG",
      },
      {
        id: "6.5w-6500k",
        name: "6500K (Branco Frio)",
        image:
          "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO 6,5W A60 6500K COM CAIXA.jpg",
      },
    ],
    defaultVariant: "6.5w-6500k",
  },
  {
    id: "lampada-led-bulbo-9w",
    name: "Lâmpada LED Bulbo 9W A60",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "lampadas",
    price: 9.9,
    unit: "Unidade",
    description: "Lâmpada LED Bulbo A60 9W. Ideal para ambientes residenciais.",
    image:
      "/img/Categorias/LAMPADA BULBO LED/LAMPADA BULBO A60 9W 6500K COM CAIXA.jpg",
    variants: [
      {
        id: "9w-3000k",
        name: "3000K (Branco Quente)",
        image:
          "/img/Categorias/LAMPADA BULBO LED/LAMPADA BULBO A60 9W 3000K COM CAIXA.jpg",
      },
      {
        id: "9w-6500k",
        name: "6500K (Branco Frio)",
        image:
          "/img/Categorias/LAMPADA BULBO LED/LAMPADA BULBO A60 9W 6500K COM CAIXA.jpg",
      },
    ],
    defaultVariant: "9w-6500k",
  },
  {
    id: "lampada-led-bulbo-12w",
    name: "Lâmpada LED Bulbo 12W A60",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "lampadas",
    price: 12.9,
    unit: "Unidade",
    description: "Lâmpada LED Bulbo A60 12W. Maior luminosidade.",
    image:
      "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO12W A60 6500K COM CAIXA.JPG",
    variants: [
      {
        id: "12w-3000k",
        name: "3000K (Branco Quente)",
        image:
          "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO 12W A60 3000K COM CAIXA.JPG",
      },
      {
        id: "12w-6500k",
        name: "6500K (Branco Frio)",
        image:
          "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO12W A60 6500K COM CAIXA.JPG",
      },
    ],
    defaultVariant: "12w-6500k",
  },
  {
    id: "lampada-led-bulbo-15w",
    name: "Lâmpada LED Bulbo 15W A60",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "lampadas",
    price: 15.9,
    unit: "Unidade",
    description: "Lâmpada LED Bulbo A60 15W. Alta potência.",
    image:
      "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO 15W A60 6500K COM CAIXA.JPG",
    variants: [
      {
        id: "15w-3000k",
        name: "3000K (Branco Quente)",
        image:
          "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO 15W A60 3000K COM CAIXA.JPG",
      },
      {
        id: "15w-6500k",
        name: "6500K (Branco Frio)",
        image:
          "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO 15W A60 6500K COM CAIXA.JPG",
      },
    ],
    defaultVariant: "15w-6500k",
  },
  {
    id: "lampada-led-bulbo-30w",
    name: "Lâmpada LED Bulbo 30W T70",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "lampadas",
    price: 35.9,
    unit: "Unidade",
    description: "Lâmpada LED Bulbo T70 30W. Alta potência para grandes áreas.",
    image:
      "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO 30W T70 6500K SEM CAIXA.JPG",
    defaultVariant: null,
  },
  {
    id: "lampada-led-bulbo-40w",
    name: "Lâmpada LED Bulbo 40W T80",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "lampadas",
    price: 45.9,
    unit: "Unidade",
    description: "Lâmpada LED Bulbo T80 40W. Alta potência.",
    image:
      "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO 40W T80 6500K SEM CAIXA.JPG",
    defaultVariant: null,
  },
  {
    id: "lampada-led-bulbo-50w",
    name: "Lâmpada LED Bulbo 50W T100",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "lampadas",
    price: 55.9,
    unit: "Unidade",
    description: "Lâmpada LED Bulbo T100 50W. Alta potência.",
    image:
      "/img/Categorias/LAMPADA BULBO LED/LÂMPADA LED BULBO 50W T100 6500K SEM CAIXA.JPG",
    defaultVariant: null,
  },
  {
    id: "lampada-high-power-65w",
    name: "Lâmpada High Power LED 65W E27",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "lampadas",
    price: 75.9,
    unit: "Unidade",
    description: "Lâmpada High Power LED 65W E27 6500K Autovolt.",
    image:
      "/img/Categorias/LAMPADA BULBO LED/High Power LED A110 LED E27 65W 6500K AUTOVOLT.png",
    defaultVariant: null,
  },

  // Painéis LED
  {
    id: "painel-led-12w",
    name: "Painel LED 12W",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "paineis",
    price: 22.9,
    unit: "Unidade",
    description:
      "Painel LED Backlight 12W. Disponível nas versões Embutir e Sobrepor.",
    image:
      "/img/Categorias/PAINEL LED PLAFON/PAINEL BACKLIGHT 12W EMBUTIR 3000-4000-6500K.jpg",
    variants: [
      {
        id: "12w-emb",
        name: "Embutir",
        image:
          "/img/Categorias/PAINEL LED PLAFON/PAINEL BACKLIGHT 12W EMBUTIR 3000-4000-6500K.jpg",
      },
      {
        id: "12w-sob",
        name: "Sobrepor",
        image:
          "/img/Categorias/PAINEL LED PLAFON/PAINEL BACKLIGHT 12W SOBREPOR 3000-4000-6500K.jpg",
      },
    ],
    defaultVariant: "12w-emb",
  },
  {
    id: "painel-led-18w",
    name: "Painel LED 18W",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "paineis",
    price: 29.9,
    unit: "Unidade",
    description:
      "Painel LED Backlight 18W. Disponível nas versões Embutir e Sobrepor.",
    image:
      "/img/Categorias/PAINEL LED PLAFON/PAINEL BACKLIGHT 18W EMBUTIR 3000-4000-6500K COM CAIXA.png",
    variants: [
      {
        id: "18w-emb",
        name: "Embutir",
        image:
          "/img/Categorias/PAINEL LED PLAFON/PAINEL BACKLIGHT 18W EMBUTIR 3000-4000-6500K COM CAIXA.png",
      },
      {
        id: "18w-sob",
        name: "Sobrepor",
        image:
          "/img/Categorias/PAINEL LED PLAFON/PAINEL BACKLIGHT 18W SOBREPOR 6500K SEM CAIXA.png",
      },
    ],
    defaultVariant: "18w-emb",
  },
  {
    id: "painel-led-24w",
    name: "Painel LED 24W",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "paineis",
    price: 39.9,
    unit: "Unidade",
    description:
      "Painel LED Backlight 24W. Disponível nas versões Embutir e Sobrepor.",
    image:
      "/img/Categorias/PAINEL LED PLAFON/PAINEL BACKLIGHT 24W EMBUTIR 3000-4000-6500K COM CAIXA.png",
    variants: [
      {
        id: "24w-emb",
        name: "Embutir",
        image:
          "/img/Categorias/PAINEL LED PLAFON/PAINEL BACKLIGHT 24W EMBUTIR 3000-4000-6500K COM CAIXA.png",
      },
      {
        id: "24w-sob",
        name: "Sobrepor",
        image:
          "/img/Categorias/PAINEL LED PLAFON/PAINEL BACKLIGHT 24W SOBREPOR 3000-4000-6500K SEM CAIXA.png",
      },
    ],
    defaultVariant: "24w-emb",
  },

  // Luminárias e Tubulares
  {
    id: "luminaria-galaxy-36w",
    name: "Luminária Galaxy Style Tube 36W",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "luminarias",
    price: 49.9,
    unit: "Unidade",
    description: "Luminária Galaxy Style Tube 36W 6500K.",
    image:
      "/img/Categorias/LUMINARIAS/Luminaria galaxy style tube 36w 6500k com embalagem .png",
    defaultVariant: null,
  },
  {
    id: "luminaria-tartaruga-15w",
    name: "Luminária Tartaruga 15W",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "luminarias",
    price: 29.9,
    unit: "Unidade",
    description: "Luminária Tartaruga 15W G-Light.",
    image: "/img/Categorias/LUMINARIAS/Luminaria tartaruga 15w glight.png",
    defaultVariant: null,
  },
  {
    id: "tubular-t8-9.9w",
    name: "Lâmpada Tubular T8 9,9W 60cm",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "tubulares",
    price: 19.9,
    unit: "Unidade",
    description: "Lâmpada LED Tubular T8 9,9W 60cm.",
    image:
      "/img/Categorias/TUBULAR T8/TUBULAR T8 9,9W 60CM 3000-4000-6500K COM CAIXA.jpg",
    defaultVariant: null,
  },
  {
    id: "tubular-t8-20w",
    name: "Lâmpada Tubular T8 20W 1,20m",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "tubulares",
    price: 24.9,
    unit: "Unidade",
    description: "Lâmpada LED Tubular T8 20W 1,20m.",
    image: "/img/Categorias/TUBULAR T8/TUBULAR T8 20W 6500K 1,20M.jpg",
    defaultVariant: null,
  },
  {
    id: "tubular-t8-40w",
    name: "Lâmpada Tubular T8 40W 2,40m",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "tubulares",
    price: 49.9,
    unit: "Unidade",
    description: "Lâmpada LED Tubular T8 40W 2,40m.",
    image:
      "/img/Categorias/TUBULAR T8/TUBULAR T8 40W 2,40M 3000-4000-6500K.jpg",
    defaultVariant: null,
  },

  // Refletores
  {
    id: "refletor-slim-10w",
    name: "Refletor Slim LED 10W",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "refletores",
    price: 29.9,
    unit: "Unidade",
    description: "Refletor Slim LED 10W 6500K Autovolt Alumínio.",
    image:
      "/img/Categorias/REFLETORES SLIM LED/REFLETOR SLIM LED 10W 120 6500K AUTOVOLT ALUMÍNIO.png",
    defaultVariant: null,
  },
  {
    id: "refletor-slim-20w",
    name: "Refletor Slim LED 20W",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "refletores",
    price: 39.9,
    unit: "Unidade",
    description: "Refletor Slim LED 20W 6500K Autovolt Alumínio.",
    image:
      "/img/Categorias/REFLETORES SLIM LED/REFLETOR SLIM LED 20W 120 6500K AUTOVOLT ALUMÍNIO.png",
    defaultVariant: null,
  },
  {
    id: "refletor-slim-30w",
    name: "Refletor Slim LED 30W",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "refletores",
    price: 49.9,
    unit: "Unidade",
    description: "Refletor Slim LED 30W 6500K Autovolt Alumínio.",
    image:
      "/img/Categorias/REFLETORES SLIM LED/REFLETOR SLIM LED 30W 120 6500K AUTOVOLT ALUMÍNIO.png",
    defaultVariant: null,
  },
  {
    id: "refletor-slim-50w",
    name: "Refletor Slim LED 50W",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "refletores",
    price: 69.9,
    unit: "Unidade",
    description: "Refletor Slim LED 50W 6500K Autovolt Alumínio.",
    image:
      "/img/Categorias/REFLETORES SLIM LED/REFLETOR SLIM LED 50W 120 6500K AUTOVOLT ALUMÍNIO.png",
    defaultVariant: null,
  },
  {
    id: "refletor-slim-100w",
    name: "Refletor Slim LED 100W",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "refletores",
    price: 119.9,
    unit: "Unidade",
    description: "Refletor Slim LED 100W 6500K Autovolt Alumínio.",
    image:
      "/img/Categorias/REFLETORES SLIM LED/REFLETOR SLIM LED 100W 120 6500K AUTOVOLT ALUMÍNIO.png",
    defaultVariant: null,
  },
  {
    id: "refletor-slim-150w",
    name: "Refletor Slim LED 150W",
    category: "iluminacao",
    categoryId: "iluminacao",
    subcategory: "refletores",
    price: 189.9,
    unit: "Unidade",
    description: "Refletor Slim LED 150W 6500K Autovolt Alumínio.",
    image:
      "/img/Categorias/REFLETORES SLIM LED/REFLETOR SLIM LED 150W 120 6500K AUTOVOLT ALUMÍNIO.png",
    defaultVariant: null,
  },

  // --- FIOS E CABOS ---
  {
    id: "fio-sil-flexivel",
    name: "Fio SIL Flexível 450/750V",
    category: "fios-cabos",
    categoryId: "fios-cabos",
    subcategory: "fios",
    price: 1.9,
    unit: "Metro",
    description: "Fio SIL flexível. Alta qualidade para instalações elétricas.",
    image:
      "/img/Categorias/FIOS SIL 1,5MM - 10MM/FIO SIL AZUL USAR PARA TODAS AS BITOLAS.png",
    variants: [
      {
        id: "fio-sil-azul",
        name: "Azul",
        image:
          "/img/Categorias/FIOS SIL 1,5MM - 10MM/FIO SIL AZUL USAR PARA TODAS AS BITOLAS.png",
      },
      {
        id: "fio-sil-preto",
        name: "Preto",
        image:
          "/img/Categorias/FIOS SIL 1,5MM - 10MM/FIO SIL PRETO USAR PARA TODAS AS BITOLAS 1,5MM A 10MM.png",
      },
      {
        id: "fio-sil-vermelho",
        name: "Vermelho",
        image:
          "/img/Categorias/FIOS SIL 1,5MM - 10MM/FIO SIL VERMELHO USAR PARA TODAS AS BITOLAS 1,5MM A 10MM.png",
      },
      {
        id: "fio-sil-verde",
        name: "Verde",
        image:
          "/img/Categorias/FIOS SIL 1,5MM - 10MM/FIO SIL VERDE USAR PARA TODAS AS FOTOS.png",
      },
      {
        id: "fio-sil-amarelo",
        name: "Amarelo",
        image:
          "/img/Categorias/FIOS SIL 1,5MM - 10MM/FIO SIL AMARELO USAR PARA TODAS AS BITOLAS 1,5MM A 10MM.png",
      },
      {
        id: "fio-sil-branco",
        name: "Branco",
        image:
          "/img/Categorias/FIOS SIL 1,5MM - 10MM/FIO SIL BRANCO USAR PARA TODAS AS FOTOS.png",
      },
    ],
    defaultVariant: "fio-sil-azul",
  },
  {
    id: "cabo-pp-2-vias",
    name: "Cabo PP 2 Vias",
    category: "fios-cabos",
    categoryId: "fios-cabos",
    subcategory: "cabos",
    price: 4.9,
    unit: "Metro",
    description: "Cabo PP 2 Vias. Resistente e flexível.",
    image: "/img/Categorias/CABO PP/CABO PP 2 VIAS.png",
    defaultVariant: null,
  },
  {
    id: "cabo-pp-3-vias",
    name: "Cabo PP 3 Vias",
    category: "fios-cabos",
    categoryId: "fios-cabos",
    subcategory: "cabos",
    price: 6.9,
    unit: "Metro",
    description: "Cabo PP 3 Vias. Resistente e flexível.",
    image: "/img/Categorias/CABO PP/Cabo PP 3 VIAS.png",
    defaultVariant: null,
  },
  {
    id: "cabo-paralelo-2x1.5mm",
    name: "Cabo Paralelo 2x1,5mm",
    category: "fios-cabos",
    categoryId: "fios-cabos",
    subcategory: "cabos",
    price: 2.9,
    unit: "Metro",
    description: "Cabo Paralelo 2x1,5mm.",
    image:
      "/img/Categorias/CABO PARALELO 2 VIAS/CABO PARALELO 2x1,5mm USAR PARA TODOS.png",
    defaultVariant: null,
  },
  {
    id: "cabo-paralelo-2x2.5mm",
    name: "Cabo Paralelo 2x2,5mm",
    category: "fios-cabos",
    categoryId: "fios-cabos",
    subcategory: "cabos",
    price: 3.9,
    unit: "Metro",
    description: "Cabo Paralelo 2x2,5mm.",
    image: "/img/Categorias/CABO PARALELO 2 VIAS/Cabo paralelo 2x2,5mm.png",
    defaultVariant: null,
  },

  // --- PROTEÇÃO ---
  {
    id: "disjuntor-din-monofasico-soprano",
    name: "Disjuntor DIN Monofásico Soprano",
    category: "protecao",
    categoryId: "protecao",
    subcategory: "disjuntores",
    price: 12.9,
    unit: "Unidade",
    description: "Disjuntor DIN Monofásico Soprano. Diversas amperagens.",
    image:
      "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x10A SOPRANO.png",
    variants: [
      {
        id: "soprano-mono-10a",
        name: "10A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x10A SOPRANO.png",
      },
      {
        id: "soprano-mono-16a",
        name: "16A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x16A SOPRANO.png",
      },
      {
        id: "soprano-mono-20a",
        name: "20A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x20A SOPRANO.png",
      },
      {
        id: "soprano-mono-25a",
        name: "25A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x25A SOPRANO.png",
      },
      {
        id: "soprano-mono-32a",
        name: "32A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x32A SOPRANO.png",
      },
      {
        id: "soprano-mono-40a",
        name: "40A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x40A SOPRANO.png",
      },
      {
        id: "soprano-mono-50a",
        name: "50A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x50A SOPRANO.png",
      },
      {
        id: "soprano-mono-63a",
        name: "63A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN MONOFASICO 1x63A SOPRANO.png",
      },
    ],
    defaultVariant: "soprano-mono-20a",
  },
  {
    id: "disjuntor-din-bifasico-soprano",
    name: "Disjuntor DIN Bifásico Soprano",
    category: "protecao",
    categoryId: "protecao",
    subcategory: "disjuntores",
    price: 35.9,
    unit: "Unidade",
    description: "Disjuntor DIN Bifásico Soprano.",
    image:
      "/img/Categorias/DISJUNTORES/DISJUNTOR DIN BIFASICO 2x10A SOPRANO.png",
    variants: [
      {
        id: "soprano-bi-10a",
        name: "10A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN BIFASICO 2x10A SOPRANO.png",
      },
      {
        id: "soprano-bi-20a",
        name: "20A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN BIFASICO 2x20A SOPRANO.png",
      },
      {
        id: "soprano-bi-32a",
        name: "32A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN BIFASICO 2x32A SOPRANO.png",
      },
      {
        id: "soprano-bi-40a",
        name: "40A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN BIFASICO 2x40A SOPRANO.png",
      },
      {
        id: "soprano-bi-50a",
        name: "50A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN BIFASICO 2x50A 6KA SOPRANO.png",
      },
      {
        id: "soprano-bi-63a",
        name: "63A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN BIFASICO 2x63A 6KA SOPRANO.png",
      },
    ],
    defaultVariant: "soprano-bi-32a",
  },
  {
    id: "disjuntor-din-trifasico-soprano",
    name: "Disjuntor DIN Trifásico Soprano",
    category: "protecao",
    categoryId: "protecao",
    subcategory: "disjuntores",
    price: 65.9,
    unit: "Unidade",
    description: "Disjuntor DIN Trifásico Soprano.",
    image:
      "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3x10A SOPRANO.png",
    variants: [
      {
        id: "soprano-tri-10a",
        name: "10A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3x10A SOPRANO.png",
      },
      {
        id: "soprano-tri-32a",
        name: "32A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3x32A SOPRANO.png",
      },
      {
        id: "soprano-tri-63a",
        name: "63A",
        image:
          "/img/Categorias/DISJUNTORES/DISJUNTOR DIN TRIFASICO 3x63A SOPRANO.png",
      },
    ],
    defaultVariant: "soprano-tri-32a",
  },
  {
    id: "disjuntor-nema-monofasico-soprano",
    name: "Disjuntor NEMA Monofásico Soprano",
    category: "protecao",
    categoryId: "protecao",
    subcategory: "disjuntores",
    price: 15.9,
    unit: "Unidade",
    description: "Disjuntor NEMA Monofásico Soprano.",
    image: "/img/Categorias/DISJUNTORES/DISJUNTOR NEMA MONO 1x50A SOPRANO.png",
    defaultVariant: null,
  },
  {
    id: "disjuntor-nema-bifasico-soprano",
    name: "Disjuntor NEMA Bifásico Soprano",
    category: "protecao",
    categoryId: "protecao",
    subcategory: "disjuntores",
    price: 39.9,
    unit: "Unidade",
    description: "Disjuntor NEMA Bifásico Soprano.",
    image:
      "/img/Categorias/DISJUNTORES/DISJUNTOR NEMA BIFASICO 2x25A SOPRANO.png",
    defaultVariant: null,
  },

  // --- CHUVEIROS E TORNEIRAS ---
  {
    id: "chuveiro-advanced-eletronica",
    name: "Chuveiro Advanced Eletrônica",
    category: "chuveiros-torneiras",
    categoryId: "chuveiros-torneiras",
    subcategory: "chuveiros",
    price: 189.9,
    unit: "Unidade",
    description: "Chuveiro Lorenzetti Advanced Eletrônica.",
    image: "/img/Categorias/CHUVEIROS LORENZETTI/advanced-eletronica.png",
    defaultVariant: null,
  },
  {
    id: "chuveiro-bella-ducha",
    name: "Chuveiro Bella Ducha 4T",
    category: "chuveiros-torneiras",
    categoryId: "chuveiros-torneiras",
    subcategory: "chuveiros",
    price: 69.9,
    unit: "Unidade",
    description: "Chuveiro Lorenzetti Bella Ducha 4 Temperaturas.",
    image:
      "/img/Categorias/CHUVEIROS LORENZETTI/bella-ducha-4TEMPERATURAS-ultra.png",
    defaultVariant: null,
  },
  {
    id: "chuveiro-duo-shower",
    name: "Chuveiro Duo Shower Quadra",
    category: "chuveiros-torneiras",
    categoryId: "chuveiros-torneiras",
    subcategory: "chuveiros",
    price: 289.9,
    unit: "Unidade",
    description: "Chuveiro Lorenzetti Duo Shower Quadra Multi Eletrônica.",
    image:
      "/img/Categorias/CHUVEIROS LORENZETTI/duo-shower-quadra-MULTI-ELETRONICA.png",
    defaultVariant: null,
  },
  {
    id: "chuveiro-loren-shower",
    name: "Chuveiro Loren Shower",
    category: "chuveiros-torneiras",
    categoryId: "chuveiros-torneiras",
    subcategory: "chuveiros",
    price: 129.9,
    unit: "Unidade",
    description: "Chuveiro Lorenzetti Loren Shower Eletrônica.",
    image: "/img/Categorias/CHUVEIROS LORENZETTI/loren-shower-eletronica.png",
    defaultVariant: null,
  },
  {
    id: "chuveiro-top-jet",
    name: "Chuveiro Top Jet",
    category: "chuveiros-torneiras",
    categoryId: "chuveiros-torneiras",
    subcategory: "chuveiros",
    price: 159.9,
    unit: "Unidade",
    description: "Chuveiro Lorenzetti Top Jet Eletrônica.",
    image: "/img/Categorias/CHUVEIROS LORENZETTI/top-jet-eletronica.png",
    defaultVariant: null,
  },
  {
    id: "torneira-prima-touch",
    name: "Torneira Eletrônica Prima Touch",
    category: "chuveiros-torneiras",
    categoryId: "chuveiros-torneiras",
    subcategory: "torneiras",
    price: 259.9,
    unit: "Unidade",
    description: "Torneira Eletrônica Zagonel Prima Touch.",
    image:
      "/img/Categorias/TORNEIRA ELETRONICA ZAGONEL/PRIMA TOUCH ZAGONEL.png",
    defaultVariant: null,
  },
  {
    id: "torneira-luna",
    name: "Torneira Eletrônica Luna",
    category: "chuveiros-torneiras",
    categoryId: "chuveiros-torneiras",
    subcategory: "torneiras",
    price: 199.9,
    unit: "Unidade",
    description: "Torneira Eletrônica Zagonel Luna.",
    image:
      "/img/Categorias/TORNEIRA ELETRONICA ZAGONEL/TORNEIRA ELETRONICA ZAGONEL LUNA.png",
    defaultVariant: null,
  },
  {
    id: "aquecedor-versatil",
    name: "Aquecedor Elétrico Versátil",
    category: "chuveiros-torneiras",
    categoryId: "chuveiros-torneiras",
    subcategory: "aquecedores",
    price: 179.9,
    unit: "Unidade",
    description: "Aquecedor Elétrico Lorenzetti Versátil 5500W 127V Branco.",
    image:
      "/img/Categorias/AQUECEDORES LORENZETTI/Aquecedor elétrico versatil 5500W 127V branco lorenzetti.png",
    defaultVariant: null,
  },

  // --- TRANSFORMADORES ---
  {
    id: "autotransformador-300va",
    name: "Autotransformador 300VA",
    category: "transformadores",
    categoryId: "transformadores",
    subcategory: "autotransformadores",
    price: 89.9,
    unit: "Unidade",
    description: "Autotransformador Bivolt 300VA.",
    image: "/img/Categorias/AUTOTRANSFORMADORES/Autotransformador 300VA.png",
    defaultVariant: null,
  },
  {
    id: "autotransformador-500va",
    name: "Autotransformador 500VA",
    category: "transformadores",
    categoryId: "transformadores",
    subcategory: "autotransformadores",
    price: 109.9,
    unit: "Unidade",
    description: "Autotransformador Bivolt 500VA.",
    image: "/img/Categorias/AUTOTRANSFORMADORES/Autotransformador 500VA.png",
    defaultVariant: null,
  },
  {
    id: "autotransformador-1500va",
    name: "Autotransformador 1500VA",
    category: "transformadores",
    categoryId: "transformadores",
    subcategory: "autotransformadores",
    price: 189.9,
    unit: "Unidade",
    description: "Autotransformador Bivolt 1500VA.",
    image: "/img/Categorias/AUTOTRANSFORMADORES/Autotransformador 1500VA.png",
    defaultVariant: null,
  },
  {
    id: "autotransformador-3000va",
    name: "Autotransformador 3000VA",
    category: "transformadores",
    categoryId: "transformadores",
    subcategory: "autotransformadores",
    price: 299.9,
    unit: "Unidade",
    description: "Autotransformador Bivolt 3000VA.",
    image: "/img/Categorias/AUTOTRANSFORMADORES/Autotransformador 3000VA.png",
    defaultVariant: null,
  },
  {
    id: "autotransformador-5000va",
    name: "Autotransformador 5000VA",
    category: "transformadores",
    categoryId: "transformadores",
    subcategory: "autotransformadores",
    price: 459.9,
    unit: "Unidade",
    description: "Autotransformador Bivolt 5000VA.",
    image: "/img/Categorias/AUTOTRANSFORMADORES/Autotransformador 5000VA.png",
    defaultVariant: null,
  },

  // --- TOMADAS E INTERRUPTORES ---
  {
    id: "interruptor-margirius-b3",
    name: "Conjunto Interruptor Simples + Tomada 10A",
    category: "tomadas",
    categoryId: "tomadas",
    subcategory: "interruptores",
    price: 19.9,
    unit: "Conjunto",
    description:
      "Margirius Linha B3 - Interruptor Simples + Tomada 10A com Placa e Suporte.",
    image:
      "/img/Categorias/INTERRUPTORES E TOMADAS/MARGIRIUS LINHA B3 INTERRUPTOR SIMPLES TOMADA 10a PLACA + SUPORTE.png",
    defaultVariant: null,
  },
  {
    id: "plugue-macho-2p-10a",
    name: "Plugue Macho 2 Pinos 10A",
    category: "tomadas",
    categoryId: "tomadas",
    subcategory: "plugues",
    price: 4.9,
    unit: "Unidade",
    description: "Plugue Macho 2 Pinos 90 Graus 10A.",
    image:
      "/img/Categorias/PLUGUES MACHO E FEMEA/PLUGUE MACHO 2 PINOS 90 GRAUS 10a.png",
    defaultVariant: null,
  },
  {
    id: "plugue-macho-3p-10a",
    name: "Plugue Macho 3 Pinos 10A",
    category: "tomadas",
    categoryId: "tomadas",
    subcategory: "plugues",
    price: 5.9,
    unit: "Unidade",
    description: "Plugue Macho 3 Pinos 90 Graus 10A.",
    image:
      "/img/Categorias/PLUGUES MACHO E FEMEA/PLUGUE MACHO 3 PINOS 90 GRAUS 10a.png",
    defaultVariant: null,
  },
  {
    id: "plugue-femea-3p-10a",
    name: "Plugue Fêmea 3 Pinos 10A",
    category: "tomadas",
    categoryId: "tomadas",
    subcategory: "plugues",
    price: 6.9,
    unit: "Unidade",
    description: "Plugue Fêmea Margirius 10A 3 Polos.",
    image:
      "/img/Categorias/PLUGUES MACHO E FEMEA/Pino femea margirius 10a 3 polo.png",
    defaultVariant: null,
  },
  {
    id: "plugue-macho-3p-20a",
    name: "Plugue Macho 3 Pinos 20A",
    category: "tomadas",
    categoryId: "tomadas",
    subcategory: "plugues",
    price: 7.9,
    unit: "Unidade",
    description: "Plugue Macho 3 Polos 20A Margirius.",
    image:
      "/img/Categorias/PLUGUES MACHO E FEMEA/Plugue pino macho 3 POLOS 20a Margirius.jpg",
    defaultVariant: null,
  },

  // --- FERRAMENTAS ---
  {
    id: "broca-aco-rapido",
    name: "Broca Aço Rápido",
    category: "ferramentas",
    categoryId: "ferramentas",
    subcategory: "brocas",
    price: 12.9,
    unit: "Unidade",
    description: "Broca de Aço Rápido de alta performance.",
    image: "/img/Categorias/BROCAS AÇO RAPIDO/BROCA AÇO RAPIDO.png",
    defaultVariant: null,
  },

];
