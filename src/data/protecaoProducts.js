// Produtos de Proteção (Disjuntores)
// Estrutura com variantes quando aplicável

export const protecaoProducts = [
// DISJUNTORES MONOFÁSICOS
  {
    id: 'disjuntor-mono-6ka',
    name: 'Disjuntor Monofásico DIN 6kA',
    category: 'protecao',
    subcategory: 'disjuntores',
    type: 'monofasico',
    price: 12.50,
    unit: 'Unidade',
    description: 'Disjuntor termomagnético monofásico DIN com capacidade de interrupção de 6kA. Proteção contra sobrecarga e curto-circuito.',
    images: ['/img/protecao/disjuntores/monofasico-6ka.png'],
    features: [
      'Padrão DIN',
      'Capacidade de interrupção 6kA',
      'Proteção contra sobrecarga e curto-circuito',
      'Fácil instalação em painéis'
    ],
    amperagens: ['10A', '16A', '20A', '25A', '32A', '40A', '50A', '63A']
  },
  {
    id: 'disjuntor-mono-soprano',
    name: 'Disjuntor Monofásico Soprano',
    category: 'protecao',
    subcategory: 'disjuntores',
    type: 'monofasico',
    brand: 'Soprano',
    price: 10.90,
    unit: 'Unidade',
    description: 'Disjuntor termomagnético monofásico marca Soprano. Alta qualidade e durabilidade.',
    images: ['/img/protecao/disjuntores/disjuntor-monofasico-soprano.png'],
    features: [
      'Marca Soprano - qualidade garantida',
      'Proteção termomagnética',
      'Desliga automaticamente em caso de sobrecarga',
      'Norma NBR IEC 60898'
    ],
    amperagens: ['10A', '16A', '20A', '25A', '32A', '40A']
  },

  // DISJUNTORES BIFÁSICOS
  {
    id: 'disjuntor-bi-6ka',
    name: 'Disjuntor Bifásico DIN 6kA',
    category: 'protecao',
    subcategory: 'disjuntores',
    type: 'bifasico',
    price: 24.90,
    unit: 'Unidade',
    description: 'Disjuntor termomagnético bifásico DIN com capacidade de interrupção de 6kA. Proteção para circuitos 220V.',
    images: ['/img/protecao/disjuntores/bifasico-6ka.png'],
    features: [
      'Padrão DIN - 2 módulos',
      'Capacidade de interrupção 6kA',
      'Para circuitos 220V bifásicos',
      'Proteção simultânea dos dois polos'
    ],
    amperagens: ['10A', '16A', '20A', '25A', '32A', '40A', '50A', '63A']
  },
  {
    id: 'disjuntor-bi-soprano',
    name: 'Disjuntor Bifásico Soprano',
    category: 'protecao',
    subcategory: 'disjuntores',
    type: 'bifasico',
    brand: 'Soprano',
    price: 22.90,
    unit: 'Unidade',
    description: 'Disjuntor termomagnético bifásico marca Soprano. Ideal para chuveiros e ar-condicionado.',
    images: ['/img/protecao/disjuntores/disjuntor-bifasico.png'],
    features: [
      'Marca Soprano',
      'Proteção para circuitos 220V',
      'Ideal para cargas de alta potência',
      'Norma NBR IEC 60898'
    ],
    amperagens: ['16A', '20A', '25A', '32A', '40A', '50A']
  },

  // DISJUNTORES TRIFÁSICOS
  {
    id: 'disjuntor-tri-soprano',
    name: 'Disjuntor Trifásico Soprano',
    category: 'protecao',
    subcategory: 'disjuntores',
    type: 'trifasico',
    brand: 'Soprano',
    price: 35.90,
    unit: 'Unidade',
    description: 'Disjuntor termomagnético trifásico marca Soprano. Para instalações industriais e grandes cargas trifásicas.',
    images: ['/img/protecao/disjuntores/disjuntor-trifasco-soprano.png'],
    features: [
      'Marca Soprano',
      'Proteção para circuitos trifásicos 380V',
      'Ideal para motores e cargas industriais',
      'Alta capacidade de interrupção'
    ],
    amperagens: ['16A', '20A', '25A', '32A', '40A', '50A', '63A', '80A', '100A']
  }
];

// Subcategorias de Proteção
export const protecaoSubcategories = [
  { id: 'disjuntores', name: 'Disjuntores', icon: 'ShieldCheck' },
  { id: 'dr', name: 'Dispositivos DR', icon: 'ShieldAlert' },
  { id: 'dps', name: 'Dispositivos DPS', icon: 'Zap' },
  { id: 'quadros', name: 'Quadros de Distribuição', icon: 'Box' }
];
