import React from 'react';
import { Cable, Lightbulb, ShieldCheck, Zap, Battery, Package, Droplets, Factory, Plug } from 'lucide-react';

export const categoryIcons = {
  'iluminacao': <Lightbulb size={24} />,
  'protecao': <ShieldCheck size={24} />,
  'tomadas': <Zap size={24} />,
  'solar': <Battery size={24} />,
  'ferramentas': <Package size={24} />,
  'chuveiros-torneiras': <Droplets size={24} />,
  'fios-cabos': <Plug size={24} />,
  'industrial': <Factory size={24} />,
  'default': <Package size={24} />
};

export const getCategoryIcon = (categoryId) => {
  return categoryIcons[categoryId] || categoryIcons['default'];
};

export const CATEGORY_METADATA = {
  'iluminacao': {
    subcategories: [
      { id: 'lampadas', name: 'Lâmpadas Bulbo LED' },
      { id: 'paineis', name: 'Painéis LED Plafon' },
      { id: 'refletores', name: 'Refletores Slim LED' },
      { id: 'tubulares', name: 'Tubulares T8' }
    ]
  },
  'protecao': {
    subcategories: [
      { id: 'disjuntores', name: 'Disjuntores' },
      { id: 'dps', name: 'DPS' },
      { id: 'dr', name: 'Interruptores DR' },
      { id: 'quadros', name: 'Quadros de Distribuição' }
    ]
  },
  'tomadas': {
    subcategories: [
      { id: 'tomadas', name: 'Tomadas' },
      { id: 'interruptores', name: 'Interruptores' },
      { id: 'conjuntos', name: 'Conjuntos Montados' },
      { id: 'plugues', name: 'Plugues e Adaptadores' }
    ]
  },
  'fios-cabos': {
    subcategories: [
      { id: 'fios-flexiveis', name: 'Fios Flexíveis' },
      { id: 'cabos-pp', name: 'Cabos PP' },
      { id: 'cabos-energia', name: 'Cabos de Energia' }
    ]
  },
  'chuveiros-torneiras': {
    subcategories: [
      { id: 'chuveiros', name: 'Chuveiros Eletrônicos' },
      { id: 'torneiras', name: 'Torneiras Elétricas' },
      { id: 'resistencias', name: 'Resistências' }
    ]
  },
  'ferramentas': {
    subcategories: [
      { id: 'alicates', name: 'Alicates' },
      { id: 'chaves', name: 'Chaves de Fenda/Philips' },
      { id: 'multimetros', name: 'Multímetros' }
    ]
  },
  'solar': {
    subcategories: [
      { id: 'paineis-solar', name: 'Painéis Solares' },
      { id: 'inversores', name: 'Inversores' },
      { id: 'conectores', name: 'Conectores e Cabos' }
    ]
  },
  'industrial': {
    subcategories: [
      { id: 'contatores', name: 'Contatores' },
      { id: 'reles', name: 'Relés' },
      { id: 'botoeiras', name: 'Botoeiras e Sinaleiros' }
    ]
  }
};
