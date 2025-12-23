import { Cable, Lightbulb, ShieldCheck, Zap, Battery, Package } from 'lucide-react';

export const categories = [
  {
    id: 'cabos',
    name: 'Cabos e Fios',
    icon: Cable,
    description: 'Cabos flexíveis, rígidos, PP, coaxiais e de rede para todas as aplicações.'
  },
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
  }
];

export const products = [
  // Cabos e Fios
  {
    id: 1,
    name: 'Cabo Flexível 2.5mm² 750V',
    category: 'cabos',
    price: 189.90,
    unit: 'Rolo 100m',
    image: 'https://via.placeholder.com/300?text=Cabo+2.5mm',
    description: 'Cabo flexível de alta qualidade, ideal para instalações residenciais e comerciais. Antichama.'
  },
  {
    id: 2,
    name: 'Cabo Flexível 4.0mm² 750V',
    category: 'cabos',
    price: 299.90,
    unit: 'Rolo 100m',
    image: 'https://via.placeholder.com/300?text=Cabo+4.0mm',
    description: 'Indicado para circuitos de força, como chuveiros e torneiras elétricas.'
  },
  {
    id: 3,
    name: 'Cabo PP 2x2.5mm² 500V',
    category: 'cabos',
    price: 5.90,
    unit: 'Metro',
    image: 'https://via.placeholder.com/300?text=Cabo+PP',
    description: 'Cabo com dupla isolação, ideal para extensões e ligações de aparelhos móveis.'
  },

  // Iluminação
  {
    id: 4,
    name: 'Lâmpada LED Bulbo 9W',
    category: 'iluminacao',
    price: 9.90,
    unit: 'Unidade',
    image: 'https://via.placeholder.com/300?text=Lampada+LED',
    description: 'Economia de até 85% de energia. Luz branca fria (6500K).'
  },
  {
    id: 5,
    name: 'Refletor LED 50W IP65',
    category: 'iluminacao',
    price: 45.00,
    unit: 'Unidade',
    image: 'https://via.placeholder.com/300?text=Refletor+LED',
    description: 'Resistente à água e poeira. Ideal para áreas externas e jardins.'
  },
  {
    id: 6,
    name: 'Painel LED Embutir 18W Quadrado',
    category: 'iluminacao',
    price: 25.90,
    unit: 'Unidade',
    image: 'https://via.placeholder.com/300?text=Painel+LED',
    description: 'Design moderno e discreto. Luz uniforme e agradável.'
  },

  // Disjuntores
  {
    id: 7,
    name: 'Disjuntor Monopolar DIN 20A',
    category: 'protecao',
    price: 12.50,
    unit: 'Unidade',
    image: 'https://via.placeholder.com/300?text=Disjuntor',
    description: 'Proteção contra curto-circuito e sobrecarga. Padrão DIN.'
  },
  {
    id: 8,
    name: 'Dispositivo DR Bipolar 40A 30mA',
    category: 'protecao',
    price: 110.00,
    unit: 'Unidade',
    image: 'https://via.placeholder.com/300?text=DR',
    description: 'Proteção contra choques elétricos. Obrigatório pela norma NBR 5410.'
  },

  // Tomadas
  {
    id: 9,
    name: 'Conjunto Tomada 2P+T 10A',
    category: 'tomadas',
    price: 14.90,
    unit: 'Conjunto',
    image: 'https://via.placeholder.com/300?text=Tomada',
    description: 'Design clean, acabamento branco brilho. Fácil instalação.'
  },
  {
    id: 10,
    name: 'Interruptor Simples + Tomada 10A',
    category: 'tomadas',
    price: 19.90,
    unit: 'Conjunto',
    image: 'https://via.placeholder.com/300?text=Interruptor',
    description: 'Praticidade e funcionalidade em um único ponto.'
  },

  // Solar
  {
    id: 11,
    name: 'Painel Solar Fotovoltaico 550W',
    category: 'solar',
    price: 850.00,
    unit: 'Unidade',
    image: 'https://via.placeholder.com/300?text=Painel+Solar',
    description: 'Alta eficiência monocristalino. Garantia de performance linear de 25 anos.'
  },
  {
    id: 12,
    name: 'Inversor Solar On-Grid 3kW',
    category: 'solar',
    price: 3200.00,
    unit: 'Unidade',
    image: 'https://via.placeholder.com/300?text=Inversor',
    description: 'Inversor monofásico 220V, wi-fi integrado para monitoramento.'
  }
];
