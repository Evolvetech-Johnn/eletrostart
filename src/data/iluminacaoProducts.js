// Produtos de Iluminação - Lâmpadas
// Estrutura com variantes de cor (temperatura de cor)

export const iluminacaoProducts = [
  // LÂMPADAS BULBO LED
  {
    id: 'bulbo-6.5w',
    name: 'Lâmpada LED Bulbo 6,5W A60',
    category: 'iluminacao',
    subcategory: 'lampadas',
    type: 'bulbo',
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
    type: 'bulbo',
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
    type: 'bulbo',
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
    type: 'bulbo',
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
    id: 'bulbo-30w',
    name: 'Lâmpada LED Bulbo 30W T70',
    category: 'iluminacao',
    subcategory: 'lampadas',
    type: 'bulbo',
    price: 29.90,
    unit: 'Unidade',
    description: 'Lâmpada LED Bulbo T70 30W. Alta potência para uso comercial.',
    variants: [
      { id: '30w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/LAMPADA BULBO LED-20260112T181831Z-3-001/LAMPADA BULBO LED/LÂMPADA LED BULBO 30W T70 6500K SEM CAIXA.JPG' }
    ],
    defaultVariant: '30w-6500k'
  },
  {
    id: 'bulbo-40w',
    name: 'Lâmpada LED Bulbo 40W T80',
    category: 'iluminacao',
    subcategory: 'lampadas',
    type: 'bulbo',
    price: 39.90,
    unit: 'Unidade',
    description: 'Lâmpada LED Bulbo T80 40W. Alta potência para uso comercial/industrial.',
    variants: [
      { id: '40w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/LAMPADA BULBO LED-20260112T181831Z-3-001/LAMPADA BULBO LED/LÂMPADA LED BULBO 40W T80 6500K SEM CAIXA.JPG' }
    ],
    defaultVariant: '40w-6500k'
  },
  {
    id: 'bulbo-50w',
    name: 'Lâmpada LED Bulbo 50W T100',
    category: 'iluminacao',
    subcategory: 'lampadas',
    type: 'bulbo',
    price: 49.90,
    unit: 'Unidade',
    description: 'Lâmpada LED Bulbo T100 50W. Máxima potência para galpões e indústrias.',
    variants: [
      { id: '50w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/LAMPADA BULBO LED-20260112T181831Z-3-001/LAMPADA BULBO LED/LÂMPADA LED BULBO 50W T100 6500K SEM CAIXA.JPG' }
    ],
    defaultVariant: '50w-6500k'
  },
  {
    id: 'bulbo-65w',
    name: 'Lâmpada LED High Power 65W A110',
    category: 'iluminacao',
    subcategory: 'lampadas',
    type: 'bulbo',
    price: 69.90,
    unit: 'Unidade',
    description: 'Lâmpada LED High Power A110 65W E27. Altíssima potência para uso industrial.',
    variants: [
      { id: '65w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/LAMPADA BULBO LED-20260112T181831Z-3-001/LAMPADA BULBO LED/High Power LED A110 LED E27 65W 6500K AUTOVOLT.png' }
    ],
    defaultVariant: '65w-6500k'
  },

  // PAINÉIS LED PLAFON
  {
    id: 'painel-12w-embutir',
    name: 'Painel LED Backlight 12W Embutir',
    category: 'iluminacao',
    subcategory: 'paineis',
    type: 'painel',
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
    id: 'painel-12w-sobrepor',
    name: 'Painel LED Backlight 12W Sobrepor',
    category: 'iluminacao',
    subcategory: 'paineis',
    type: 'painel',
    price: 29.90,
    unit: 'Unidade',
    description: 'Painel LED Backlight 12W para sobrepor. Instalação fácil e prática.',
    variants: [
      { id: '12w-sob-3000k', name: '3000K (Branco Quente)', image: '/img/iluminacao/Lampadas/PAINEL LED PLAFON-20260112T181832Z-3-001/PAINEL LED PLAFON/PAINEL BACKLIGHT 12W SOBREPOR 3000-4000-6500K.jpg' },
      { id: '12w-sob-4000k', name: '4000K (Branco Neutro)', image: '/img/iluminacao/Lampadas/PAINEL LED PLAFON-20260112T181832Z-3-001/PAINEL LED PLAFON/PAINEL BACKLIGHT 12W SOBREPOR 3000-4000-6500K.jpg' },
      { id: '12w-sob-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/PAINEL LED PLAFON-20260112T181832Z-3-001/PAINEL LED PLAFON/PAINEL BACKLIGHT 12W SOBREPOR 3000-4000-6500K.jpg' }
    ],
    defaultVariant: '12w-sob-6500k'
  },
  {
    id: 'painel-18w-embutir',
    name: 'Painel LED Backlight 18W Embutir',
    category: 'iluminacao',
    subcategory: 'paineis',
    type: 'painel',
    price: 35.90,
    unit: 'Unidade',
    description: 'Painel LED Backlight 18W para embutir. Iluminação ampla e eficiente.',
    variants: [
      { id: '18w-emb-3000k', name: '3000K (Branco Quente)', image: '/img/iluminacao/Lampadas/PAINEL LED PLAFON-20260112T181832Z-3-001/PAINEL LED PLAFON/PAINEL BACKLIGHT 18W EMBUTIR 3000-4000-6500K COM CAIXA.png' },
      { id: '18w-emb-4000k', name: '4000K (Branco Neutro)', image: '/img/iluminacao/Lampadas/PAINEL LED PLAFON-20260112T181832Z-3-001/PAINEL LED PLAFON/PAINEL BACKLIGHT 18W EMBUTIR 3000-4000-6500K COM CAIXA.png' },
      { id: '18w-emb-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/PAINEL LED PLAFON-20260112T181832Z-3-001/PAINEL LED PLAFON/PAINEL BACKLIGHT 18W EMBUTIR 3000-4000-6500K COM CAIXA.png' }
    ],
    defaultVariant: '18w-emb-6500k'
  },
  {
    id: 'painel-18w-sobrepor',
    name: 'Painel LED Backlight 18W Sobrepor',
    category: 'iluminacao',
    subcategory: 'paineis',
    type: 'painel',
    price: 39.90,
    unit: 'Unidade',
    description: 'Painel LED Backlight 18W para sobrepor. Instalação versátil.',
    variants: [
      { id: '18w-sob-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/PAINEL LED PLAFON-20260112T181832Z-3-001/PAINEL LED PLAFON/PAINEL BACKLIGHT 18W SOBREPOR 6500K SEM CAIXA.png' }
    ],
    defaultVariant: '18w-sob-6500k'
  },
  {
    id: 'painel-24w-embutir',
    name: 'Painel LED Backlight 24W Embutir',
    category: 'iluminacao',
    subcategory: 'paineis',
    type: 'painel',
    price: 45.90,
    unit: 'Unidade',
    description: 'Painel LED Backlight 24W para embutir. Alta luminosidade.',
    variants: [
      { id: '24w-emb-3000k', name: '3000K (Branco Quente)', image: '/img/iluminacao/Lampadas/PAINEL LED PLAFON-20260112T181832Z-3-001/PAINEL LED PLAFON/PAINEL BACKLIGHT 24W EMBUTIR 3000-4000-6500K COM CAIXA.png' },
      { id: '24w-emb-4000k', name: '4000K (Branco Neutro)', image: '/img/iluminacao/Lampadas/PAINEL LED PLAFON-20260112T181832Z-3-001/PAINEL LED PLAFON/PAINEL BACKLIGHT 24W EMBUTIR 3000-4000-6500K COM CAIXA.png' },
      { id: '24w-emb-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/PAINEL LED PLAFON-20260112T181832Z-3-001/PAINEL LED PLAFON/PAINEL BACKLIGHT 24W EMBUTIR 3000-4000-6500K COM CAIXA.png' }
    ],
    defaultVariant: '24w-emb-6500k'
  },
  {
    id: 'painel-24w-sobrepor',
    name: 'Painel LED Backlight 24W Sobrepor',
    category: 'iluminacao',
    subcategory: 'paineis',
    type: 'painel',
    price: 49.90,
    unit: 'Unidade',
    description: 'Painel LED Backlight 24W para sobrepor. Máxima potência.',
    variants: [
      { id: '24w-sob-3000k', name: '3000K (Branco Quente)', image: '/img/iluminacao/Lampadas/PAINEL LED PLAFON-20260112T181832Z-3-001/PAINEL LED PLAFON/PAINEL BACKLIGHT 24W SOBREPOR 3000-4000-6500K SEM CAIXA.png' },
      { id: '24w-sob-4000k', name: '4000K (Branco Neutro)', image: '/img/iluminacao/Lampadas/PAINEL LED PLAFON-20260112T181832Z-3-001/PAINEL LED PLAFON/PAINEL BACKLIGHT 24W SOBREPOR 3000-4000-6500K SEM CAIXA.png' },
      { id: '24w-sob-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/PAINEL LED PLAFON-20260112T181832Z-3-001/PAINEL LED PLAFON/PAINEL BACKLIGHT 24W SOBREPOR 3000-4000-6500K SEM CAIXA.png' }
    ],
    defaultVariant: '24w-sob-6500k'
  },

  // REFLETORES SLIM LED
  {
    id: 'refletor-10w',
    name: 'Refletor Slim LED 10W',
    category: 'iluminacao',
    subcategory: 'refletores',
    type: 'refletor',
    price: 25.90,
    unit: 'Unidade',
    description: 'Refletor Slim LED 10W 120° 6500K Autovolt. Alumínio resistente.',
    variants: [
      { id: '10w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/REFLETORES SLIM LED-20260112T181835Z-3-001/REFLETORES SLIM LED/REFLETOR SLIM LED 10W 120 6500K AUTOVOLT ALUMÍNIO.png' }
    ],
    defaultVariant: '10w-6500k'
  },
  {
    id: 'refletor-20w',
    name: 'Refletor Slim LED 20W',
    category: 'iluminacao',
    subcategory: 'refletores',
    type: 'refletor',
    price: 35.90,
    unit: 'Unidade',
    description: 'Refletor Slim LED 20W 120° 6500K Autovolt. Ideal para áreas externas.',
    variants: [
      { id: '20w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/REFLETORES SLIM LED-20260112T181835Z-3-001/REFLETORES SLIM LED/REFLETOR SLIM LED 20W 120 6500K AUTOVOLT ALUMÍNIO.png' }
    ],
    defaultVariant: '20w-6500k'
  },
  {
    id: 'refletor-30w',
    name: 'Refletor Slim LED 30W',
    category: 'iluminacao',
    subcategory: 'refletores',
    type: 'refletor',
    price: 45.90,
    unit: 'Unidade',
    description: 'Refletor Slim LED 30W 120° 6500K Autovolt. Alta luminosidade.',
    variants: [
      { id: '30w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/REFLETORES SLIM LED-20260112T181835Z-3-001/REFLETORES SLIM LED/REFLETOR SLIM LED 30W 120 6500K AUTOVOLT ALUMÍNIO.png' }
    ],
    defaultVariant: '30w-6500k'
  },
  {
    id: 'refletor-50w',
    name: 'Refletor Slim LED 50W',
    category: 'iluminacao',
    subcategory: 'refletores',
    type: 'refletor',
    price: 65.90,
    unit: 'Unidade',
    description: 'Refletor Slim LED 50W 120° 6500K Autovolt. Para quadras e estacionamentos.',
    variants: [
      { id: '50w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/REFLETORES SLIM LED-20260112T181835Z-3-001/REFLETORES SLIM LED/REFLETOR SLIM LED 50W 120 6500K AUTOVOLT ALUMÍNIO.png' }
    ],
    defaultVariant: '50w-6500k'
  },
  {
    id: 'refletor-100w',
    name: 'Refletor Slim LED 100W',
    category: 'iluminacao',
    subcategory: 'refletores',
    type: 'refletor',
    price: 120.00,
    unit: 'Unidade',
    description: 'Refletor Slim LED 100W 120° 6500K Autovolt. Alta potência industrial.',
    variants: [
      { id: '100w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/REFLETORES SLIM LED-20260112T181835Z-3-001/REFLETORES SLIM LED/REFLETOR SLIM LED 100W 120 6500K AUTOVOLT ALUMÍNIO.png' }
    ],
    defaultVariant: '100w-6500k'
  },
  {
    id: 'refletor-150w',
    name: 'Refletor Slim LED 150W',
    category: 'iluminacao',
    subcategory: 'refletores',
    type: 'refletor',
    price: 180.00,
    unit: 'Unidade',
    description: 'Refletor Slim LED 150W 120° 6500K Autovolt. Máxima potência.',
    variants: [
      { id: '150w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/REFLETORES SLIM LED-20260112T181835Z-3-001/REFLETORES SLIM LED/REFLETOR SLIM LED 150W 120 6500K AUTOVOLT ALUMÍNIO.png' }
    ],
    defaultVariant: '150w-6500k'
  },

  // TUBULARES T8
  {
    id: 'tubular-9.9w',
    name: 'Lâmpada Tubular T8 9,9W 60cm',
    category: 'iluminacao',
    subcategory: 'tubulares',
    type: 'tubular',
    price: 15.90,
    unit: 'Unidade',
    description: 'Lâmpada Tubular LED T8 9,9W 60cm. Substitui fluorescentes convencionais.',
    variants: [
      { id: '9.9w-3000k', name: '3000K (Branco Quente)', image: '/img/iluminacao/Lampadas/TUBULARES T8-20260112T181838Z-3-001/TUBULARES T8/TUBULAR T8 9,9W 60CM 3000-4000-6500K COM CAIXA.jpg' },
      { id: '9.9w-4000k', name: '4000K (Branco Neutro)', image: '/img/iluminacao/Lampadas/TUBULARES T8-20260112T181838Z-3-001/TUBULARES T8/TUBULAR T8 9,9W 60CM 3000-4000-6500K COM CAIXA.jpg' },
      { id: '9.9w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/TUBULARES T8-20260112T181838Z-3-001/TUBULARES T8/TUBULAR T8 9,9W 60CM 3000-4000-6500K COM CAIXA.jpg' }
    ],
    defaultVariant: '9.9w-6500k'
  },
  {
    id: 'tubular-20w',
    name: 'Lâmpada Tubular T8 20W 1,20m',
    category: 'iluminacao',
    subcategory: 'tubulares',
    type: 'tubular',
    price: 22.90,
    unit: 'Unidade',
    description: 'Lâmpada Tubular LED T8 20W 1,20m. Alta luminosidade.',
    variants: [
      { id: '20w-3000k', name: '3000K (Branco Quente)', image: '/img/iluminacao/Lampadas/TUBULARES T8-20260112T181838Z-3-001/TUBULARES T8/TUBULAR T8 20W 3000-4000-6500K 1,20M.jpg' },
      { id: '20w-4000k', name: '4000K (Branco Neutro)', image: '/img/iluminacao/Lampadas/TUBULARES T8-20260112T181838Z-3-001/TUBULARES T8/TUBULAR T8 20W 3000-4000-6500K 1,20M.jpg' },
      { id: '20w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/TUBULARES T8-20260112T181838Z-3-001/TUBULARES T8/TUBULAR T8 20W 6500K 1,20M.jpg' }
    ],
    defaultVariant: '20w-6500k'
  },
  {
    id: 'tubular-40w',
    name: 'Lâmpada Tubular T8 40W 2,40m',
    category: 'iluminacao',
    subcategory: 'tubulares',
    type: 'tubular',
    price: 45.90,
    unit: 'Unidade',
    description: 'Lâmpada Tubular LED T8 40W 2,40m. Para grandes ambientes.',
    variants: [
      { id: '40w-3000k', name: '3000K (Branco Quente)', image: '/img/iluminacao/Lampadas/TUBULARES T8-20260112T181838Z-3-001/TUBULARES T8/TUBULAR T8 40W 2,40M 3000-4000-6500K.jpg' },
      { id: '40w-4000k', name: '4000K (Branco Neutro)', image: '/img/iluminacao/Lampadas/TUBULARES T8-20260112T181838Z-3-001/TUBULARES T8/TUBULAR T8 40W 2,40M 3000-4000-6500K.jpg' },
      { id: '40w-6500k', name: '6500K (Branco Frio)', image: '/img/iluminacao/Lampadas/TUBULARES T8-20260112T181838Z-3-001/TUBULARES T8/TUBULAR T8 40W 2,40M 3000-4000-6500K.jpg' }
    ],
    defaultVariant: '40w-6500k'
  }
];

// Subcategorias de Iluminação
export const iluminacaoSubcategories = [
  { id: 'lampadas', name: 'Lâmpadas Bulbo', icon: 'Lightbulb' },
  { id: 'paineis', name: 'Painéis LED', icon: 'Square' },
  { id: 'refletores', name: 'Refletores', icon: 'Sun' },
  { id: 'tubulares', name: 'Tubulares T8', icon: 'Minus' }
];
