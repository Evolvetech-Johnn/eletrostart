import { Cable, Lightbulb, ShieldCheck, Zap, Battery, Package, Droplets, Factory, Plug } from 'lucide-react';

// Import product data from specialized modules
import { iluminacaoProducts } from './iluminacaoProducts';
import { chuveirosProducts } from './chuveirosProducts';
import { fiosCabosProducts } from './fiosCabosProducts';
import { protecaoProducts as protecaoProductsData } from './protecaoProducts';
import { tomadasInterruptoresProducts } from './tomadasInterruptoresProducts';

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
  // Todos os produtos legados foram removidos pois não possuem imagens reais
  // Os produtos com imagens reais estão nos arquivos especializados:
  // - iluminacaoProducts.js
  // - chuveirosProducts.js
  // - fiosCabosProducts.js
  // - protecaoProducts.js
  // - tomadasInterruptoresProducts.js
];

// Helper para obter a imagem principal do produto com fallback
export const getProductImage = (product) => {
  const mainImage = product.images?.[0] || product.image;
  return mainImage;
};

// Imagem placeholder para quando a imagem do produto não carregar
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect fill="%23f3f4f6" width="300" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESem imagem%3C/text%3E%3C/svg%3E';

// Consolidate all products from different modules
export const allProducts = [
  ...products,
  ...iluminacaoProducts,
  ...chuveirosProducts,
  ...fiosCabosProducts,
  ...protecaoProductsData,
  ...tomadasInterruptoresProducts
];

// Export specialized product collections for category pages
export { iluminacaoProducts } from './iluminacaoProducts';
export { chuveirosProducts } from './chuveirosProducts';
export { fiosCabosProducts } from './fiosCabosProducts';
export { protecaoProducts } from './protecaoProducts';
export { tomadasInterruptoresProducts } from './tomadasInterruptoresProducts';

