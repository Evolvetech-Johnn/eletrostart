import { Cable, Lightbulb, ShieldCheck, Zap, Battery, Package, Droplets, Factory, Plug } from 'lucide-react';

// Imagens das categorias para os cards
export const categoryImages = {
  iluminacao: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&q=80&w=400',
  protecao: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400',
  tomadas: '/img/categories/tomadas-interruptores.png',
  solar: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=400',
  ferramentas: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&q=80&w=400',
  'chuveiros-torneiras': '/img/categories/chuveiros-torneiras.png',
  'fios-cabos': '/img/categories/fios-cabos.png',
  industrial: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=400'
};

export const categories = [
  
  {
    id: 'iluminacao',
    name: 'Iluminação',
    icon: Lightbulb,
    image: categoryImages.iluminacao,
    description: 'Lâmpadas LED, luminárias, refletores e fitas de LED.',
    subcategories: [
      { id: 'lampadas', name: 'Lâmpadas Bulbo LED' },
      { id: 'paineis', name: 'Painéis LED Plafon' },
      { id: 'refletores', name: 'Refletores Slim LED' },
      { id: 'tubulares', name: 'Tubulares T8' }
    ]
  },
  {
    id: 'protecao',
    name: 'Disjuntores e Proteção',
    icon: ShieldCheck,
    image: categoryImages.protecao,
    description: 'Disjuntores, DRs, DPS e quadros de distribuição.'
  },
  {
    id: 'tomadas',
    name: 'Tomadas e Interruptores',
    icon: Zap,
    image: categoryImages.tomadas,
    description: 'Linhas completas de tomadas, interruptores e placas.'
  },
  {
    id: 'solar',
    name: 'Energia Solar',
    icon: Battery,
    image: categoryImages.solar,
    description: 'Painéis solares, inversores, estruturas e conectores.'
  },
  {
    id: 'ferramentas',
    name: 'Ferramentas',
    icon: Package,
    image: categoryImages.ferramentas,
    description: 'Alicates, chaves, multímetros e ferramentas para eletricistas.'
  },
  {
    id: 'chuveiros-torneiras',
    name: 'Chuveiros e Torneiras',
    icon: Droplets,
    image: categoryImages['chuveiros-torneiras'],
    description: 'Chuveiros elétricos, torneiras e duchas para residências e comércios.'
  },
  {
    id: 'fios-cabos',
    name: 'Fios e Cabos',
    icon: Plug,
    image: categoryImages['fios-cabos'],
    description: 'Fios e cabos para instalações elétricas diversas.'
  },
  {
    id: 'industrial',
    name: 'Industrial',
    icon: Factory,
    image: categoryImages.industrial,
    description: 'Materiais elétricos para uso industrial e fabril.'
  }
];

export const products = [
  // Cabos
  {
    id: 1,
    name: 'Cabo Flexível 2.5mm² 750V',
    category: 'cabos',
    price: 189.90,
    unit: 'Rolo 100m',
    images: ['/img/cabos/1-main.jpg'],
    description: 'Cabo flexível de alta qualidade, ideal para instalações residenciais e comerciais. Antichama.'
  },
  {
    id: 2,
    name: 'Cabo Flexível 4.0mm² 750V',
    category: 'cabos',
    price: 299.90,
    unit: 'Rolo 100m',
    images: ['/img/cabos/2-main.jpg'],
    description: 'Indicado para circuitos de força, como chuveiros e torneiras elétricas.'
  },
  {
    id: 3,
    name: 'Cabo PP 2x2.5mm² 500V',
    category: 'cabos',
    price: 5.90,
    unit: 'Metro',
    images: ['/img/cabos/3-main.jpg'],
    description: 'Cabo com dupla isolação, ideal para extensões e ligações de aparelhos móveis.'
  },

  // Iluminação - produtos detalhados agora em iluminacaoProducts.js

  // Disjuntores e Proteção
  {
    id: 7,
    name: 'Disjuntor Monopolar DIN 20A',
    category: 'protecao',
    price: 12.50,
    unit: 'Unidade',
    images: ['/img/protecao/7-main.jpg'],
    description: 'Proteção contra curto-circuito e sobrecarga. Padrão DIN.'
  },
  {
    id: 8,
    name: 'Dispositivo DR Bipolar 40A 30mA',
    category: 'protecao',
    price: 110.00,
    unit: 'Unidade',
    images: ['/img/protecao/8-main.jpg'],
    description: 'Proteção contra choques elétricos. Obrigatório pela norma NBR 5410.'
  },

  // Tomadas e Interruptores
  {
    id: 9,
    name: 'Conjunto Tomada 2P+T 10A',
    category: 'tomadas',
    price: 14.90,
    unit: 'Conjunto',
    images: ['/img/tomadas/9-main.jpg'],
    description: 'Design clean, acabamento branco brilho. Fácil instalação.'
  },
  {
    id: 10,
    name: 'Interruptor Simples + Tomada 10A',
    category: 'tomadas',
    price: 19.90,
    unit: 'Conjunto',
    images: ['/img/tomadas/10-main.jpg'],
    description: 'Praticidade e funcionalidade em um único ponto.'
  },

  // Energia Solar
  {
    id: 11,
    name: 'Painel Solar Fotovoltaico 550W',
    category: 'solar',
    price: 850.00,
    unit: 'Unidade',
    images: ['/img/solar/11-main.jpg'],
    description: 'Alta eficiência monocristalino. Garantia de performance linear de 25 anos.'
  },
  {
    id: 12,
    name: 'Inversor Solar On-Grid 3kW',
    category: 'solar',
    price: 3200.00,
    unit: 'Unidade',
    images: ['/img/solar/12-main.jpg'],
    description: 'Inversor monofásico 220V, wi-fi integrado para monitoramento.'
  }
];

// Helper para obter a imagem principal do produto com fallback
export const getProductImage = (product) => {
  const mainImage = product.images?.[0] || product.image;
  return mainImage;
};

// Imagem placeholder para quando a imagem do produto não carregar
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect fill="%23f3f4f6" width="300" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESem imagem%3C/text%3E%3C/svg%3E';

