// Produtos de Interruptores, Tomadas e Plugues
// Estrutura com variantes quando aplicável

export const tomadasInterruptoresProducts = [
  // LINHA MARGIRIUS
  {
    id: 'conjunto-margirius-b3',
    name: 'Conjunto Interruptor Simples + Tomada 10A Margirius Linha B3',
    category: 'tomadas',
    subcategory: 'conjuntos',
    brand: 'Margirius',
    line: 'B3',
    price: 24.90,
    unit: 'Conjunto',
    description: 'Conjunto completo Margirius Linha B3 com interruptor simples e tomada 10A. Inclui placa e suporte.',
    images: ['/img/interruptores-e-tomadas/margirius/margirius-linha-b3-interruptor-simples-tomada-10a-placa-+-suporte.png'],
    features: [
      'Linha B3 - design moderno',
      'Inclui placa e suporte',
      'Interruptor simples + tomada 2P+T 10A',
      'Acabamento branco fosco',
      'Fácil instalação'
    ],
    specifications: {
      voltage: '250V',
      current: '10A',
      color: 'Branco',
      material: 'ABS'
    }
  },





  // PLUGUES MACHO
  {
    id: 'plugue-10a-3polos',
    name: 'Plugue Pino Macho 3 Polos 10A Margirius',
    category: 'tomadas',
    subcategory: 'plugues',
    brand: 'Margirius',
    price: 8.90,
    unit: 'Unidade',
    description: 'Plugue pino macho 3 polos (2P+T) 10A cor preta. Marca Margirius.',
    images: ['/img/interruptores-e-tomadas/plugues/plugue-pino-macho-3-polos-10a-preto-margirius.jpg'],
    features: [
      'Marca Margirius',
      '3 polos (2P+T)',
      'Corrente nominal 10A',
      'Cor preta',
      'Alta durabilidade'
    ],
    specifications: {
      voltage: '250V',
      current: '10A',
      poles: '3 (2P+T)',
      color: 'Preto'
    }
  },
  {
    id: 'plugue-20a-3polos',
    name: 'Plugue Pino Macho 3 Polos 20A Margirius',
    category: 'tomadas',
    subcategory: 'plugues',
    brand: 'Margirius',
    price: 12.90,
    unit: 'Unidade',
    description: 'Plugue pino macho 3 polos (2P+T) 20A. Marca Margirius. Para cargas de maior potência.',
    images: ['/img/interruptores-e-tomadas/plugues/plugue-pino-macho-3-polos-20a-margirius.jpg'],
    features: [
      'Marca Margirius',
      '3 polos (2P+T)',
      'Corrente nominal 20A',
      'Para cargas de alta potência',
      'Alta resistência'
    ],
    specifications: {
      voltage: '250V',
      current: '20A',
      poles: '3 (2P+T)',
      color: 'Preto'
    }
  }
];

// Subcategorias de Tomadas e Interruptores
export const tomadasSubcategories = [
  { id: 'tomadas', name: 'Tomadas', icon: 'Plug' },
  { id: 'interruptores', name: 'Interruptores', icon: 'ToggleLeft' },
  { id: 'conjuntos', name: 'Conjuntos', icon: 'Grid2x2' },
  { id: 'plugues', name: 'Plugues', icon: 'Cable' }
];
