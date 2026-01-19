// Produtos de Fios e Cabos
// Estrutura com variantes de cor

export const fiosCabosProducts = [
  // FIO SIL 1.5MM A 10MM
  {
    id: 'fio-sil-multibitola',
    name: 'Fio SIL - Flexível 450/750V',
    category: 'fios-cabos',
    subcategory: 'fios-flexiveis',
    price: 4.90,
    unit: 'Metro',
    description: 'Fio SIL flexível 450/750V. Disponível em várias bitolas de 1,5mm² a 10mm². Ideal para instalações residenciais e comerciais.',
    features: [
      'Antichama e anti-propagante',
      'Flexível e maleável',
      'Alta durabilidade',
      'Norma NBR NM 247-3'
    ],
    variants: [
      {
        id: 'fio-sil-azul',
        name: 'Azul - Neutro',
        color: 'Azul',
        image: '/img/fios-cabos/fio-sil/fio-sil-azul-usar-para-todas-as-bitolas.png',
        description: 'Fio SIL flexível cor azul. Padrão para condutor neutro.'
      },
      {
        id: 'fio-sil-preto',
        name: 'Preto - Fase/Retorno',
        color: 'Preto',
        image: '/img/fios-cabos/fio-sil/fio-sil-preto-usar-para-todas-as-bitolas-1,5mm-a-10mm.png',
        description: 'Fio SIL flexível cor preta. Usado para fase ou retorno.'
      },
      {
        id: 'fio-sil-vermelho',
        name: 'Vermelho - Fase',
        color: 'Vermelho',
        image: '/img/fios-cabos/fio-sil/fio-sil-vermelho-usar-para-todas-as-bitolas-1,5mm-a-10mm.png',
        description: 'Fio SIL flexível cor vermelha. Padrão para condutor fase.'
      }
    ],
    defaultVariant: 'fio-sil-azul',
    bitolas: [
      { size: '1.5mm²', price: 4.90, amperage: '15A' },
      { size: '2.5mm²', price: 6.90, amperage: '21A' },
      { size: '4.0mm²', price: 9.90, amperage: '28A' },
      { size: '6.0mm²', price: 14.90, amperage: '36A' },
      { size: '10.0mm²', price: 24.90, amperage: '50A' }
    ]
  }
];

// Subcategorias de Fios e Cabos
export const fiosCabosSubcategories = [
  { id: 'fios-flexiveis', name: 'Fios Flexíveis', icon: 'Cable' },
  { id: 'cabos-pp', name: 'Cabos PP', icon: 'Cable' },
  { id: 'cabos-energia', name: 'Cabos de Energia', icon: 'Zap' }
];
