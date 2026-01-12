import { Cable, Lightbulb, ShieldCheck, Zap, Battery, Package, Droplets, Factory, Plug } from 'lucide-react';

export const categories = [
  
  {
    id: 'iluminacao',
    name: 'Iluminação',
    icon: Lightbulb,
    description: 'Lâmpadas LED, luminárias, refletores e fitas de LED.'
  },
  {
    id: 'protecao',
    name: 'Disjuntores e Proteção',
    icon: ShieldCheck,
    description: 'Disjuntores, DRs, DPS e quadros de distribuição.'
  },
  {
    id: 'tomadas',
    name: 'Tomadas e Interruptores',
    icon: Zap,
    description: 'Linhas completas de tomadas, interruptores e placas.'
  },
  {
    id: 'solar',
    name: 'Energia Solar',
    icon: Battery,
    description: 'Painéis solares, inversores, estruturas e conectores.'
  },
  {
    id: 'ferramentas',
    name: 'Ferramentas',
    icon: Package,
    description: 'Alicates, chaves, multímetros e ferramentas para eletricistas.'
  },
  {
    id: 'chuveiros-torneiras',
    name: 'Chuveiros e Torneiras',
    icon: Droplets,
    description: 'Chuveiros elétricos, torneiras e duchas para residências e comércios.'
  },
  {
    id: 'fios-cabos',
    name: 'Fios e Cabos',
    icon: Plug,
    description: 'Fios e cabos para instalações elétricas diversas.'
  },
  {
    id: 'industrial',
    name: 'Industrial',
    icon: Factory,
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

  // Iluminação
  {
    id: 4,
    name: 'Lâmpada LED Bulbo 9W',
    category: 'iluminacao',
    price: 9.90,
    unit: 'Unidade',
    images: ['/img/iluminacao/4-main.jpg'],
    description: 'Economia de até 85% de energia. Luz branca fria (6500K).'
  },
  {
    id: 5,
    name: 'Refletor LED 50W IP65',
    category: 'iluminacao',
    price: 45.00,
    unit: 'Unidade',
    images: ['/img/iluminacao/5-main.jpg'],
    description: 'Resistente à água e poeira. Ideal para áreas externas e jardins.'
  },
  {
    id: 6,
    name: 'Painel LED Embutir 18W Quadrado',
    category: 'iluminacao',
    price: 25.90,
    unit: 'Unidade',
    images: ['/img/iluminacao/6-main.jpg'],
    description: 'Design moderno e discreto. Luz uniforme e agradável.'
  },

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

