// Produtos de Chuveiros e Torneiras
// Estrutura com variantes quando aplicável

export const chuveirosProducts = [
  // CHUVEIROS LORENZETTI
  {
    id: 'chuveiro-advanced',
    name: 'Chuveiro Advanced Eletrônica Lorenzetti',
    category: 'chuveiros-torneiras',
    subcategory: 'chuveiros',
    brand: 'Lorenzetti',
    price: 189.90,
    unit: 'Unidade',
    description: 'Chuveiro eletrônico Advanced com controle de temperatura. Segurança e conforto para o banho.',
    images: ['/img/chuveiros-e-torneiras/lorenzetti/advanced-eletronica.png'],
    features: [
      'Controle eletrônico de temperatura',
      'Sistema de segurança integrado',
      'Economia de energia',
      'Fácil instalação'
    ]
  },
  {
    id: 'chuveiro-bella-ducha',
    name: 'Chuveiro Bella Ducha 4 Temperaturas Ultra Lorenzetti',
    category: 'chuveiros-torneiras',
    subcategory: 'chuveiros',
    brand: 'Lorenzetti',
    price: 159.90,
    unit: 'Unidade',
    description: 'Chuveiro Bella Ducha com 4 opções de temperatura. Conforto total no banho.',
    images: ['/img/chuveiros-e-torneiras/lorenzetti/bella-ducha-4temperaturas-ultra.png'],
    features: [
      '4 temperaturas (desligado, morno, quente, super quente)',
      'Ultra economia de energia',
      'Tecnologia Ultra Banho',
      'Design moderno'
    ]
  },
  {
    id: 'chuveiro-duo-shower',
    name: 'Duo Shower Quadra Multi Eletrônica Lorenzetti',
    category: 'chuveiros-torneiras',
    subcategory: 'chuveiros',
    brand: 'Lorenzetti',
    price: 249.90,
    unit: 'Unidade',
    description: 'Duo Shower Quadra com tecnologia eletrônica multi temperatura. Potência e eficiência.',
    images: ['/img/chuveiros-e-torneiras/lorenzetti/duo-shower-quadra-multi-eletronica.png'],
    features: [
      'Sistema multi temperatura',
      'Controle eletrônico preciso',
      'Jato potente e envolvente',
      'Design quadrado moderno'
    ]
  },
  {
    id: 'chuveiro-loren-shower',
    name: 'Loren Shower Eletrônica Lorenzetti',
    category: 'chuveiros-torneiras',
    subcategory: 'chuveiros',
    brand: 'Lorenzetti',
    price: 199.90,
    unit: 'Unidade',
    description: 'Chuveiro Loren Shower com controle eletrônico de temperatura. Sofisticação e praticidade.',
    images: ['/img/chuveiros-e-torneiras/lorenzetti/loren-shower-eletronica.png'],
    features: [
      'Controle eletrônico de temperatura',
      'Design elegante',
      'Economia de energia',
      'Instalação simples'
    ]
  },
  {
    id: 'chuveiro-top-jet',
    name: 'Top Jet Eletrônica Lorenzetti',
    category: 'chuveiros-torneiras',
    subcategory: 'chuveiros',
    brand: 'Lorenzetti',
    price: 179.90,
    unit: 'Unidade',
    description: 'Chuveiro Top Jet com tecnologia eletrônica. Jato forte e temperatura controlada.',
    images: ['/img/chuveiros-e-torneiras/lorenzetti/top-jet-eletronica.png'],
    features: [
      'Jato forte e uniforme',
      'Controle eletrônico',
      'Alta durabilidade',
      'Design compacto'
    ]
  },

  // TORNEIRAS ZAGONEL
  {
    id: 'torneira-prima-touch',
    name: 'Torneira Prima Touch Zagonel',
    category: 'chuveiros-torneiras',
    subcategory: 'torneiras',
    brand: 'Zagonel',
    price: 299.90,
    unit: 'Unidade',
    description: 'Torneira eletrônica Prima Touch com acionamento por toque. Moderna e higiênica.',
    images: ['/img/chuveiros-e-torneiras/zagonel/prima-touch-zagonel.png'],
    features: [
      'Acionamento por toque',
      'Sistema de aquecimento instantâneo',
      'Economia de água',
      'Design moderno e elegante'
    ]
  },
  {
    id: 'torneira-luna',
    name: 'Torneira Eletrônica Luna Zagonel',
    category: 'chuveiros-torneiras',
    subcategory: 'torneiras',
    brand: 'Zagonel',
    price: 279.90,
    unit: 'Unidade',
    description: 'Torneira eletrônica Luna com aquecimento rápido. Praticidade e economia.',
    images: ['/img/chuveiros-e-torneiras/zagonel/torneira-eletronica-zagonel-luna.png'],
    features: [
      'Aquecimento instantâneo',
      'Controle de temperatura',
      'Economia de energia e água',
      'Instalação fácil'
    ]
  }
];

// Subcategorias de Chuveiros e Torneiras
export const chuveirosSubcategories = [
  { id: 'chuveiros', name: 'Chuveiros Elétricos', icon: 'Droplets' },
  { id: 'torneiras', name: 'Torneiras Elétricas', icon: 'Waves' }
];
