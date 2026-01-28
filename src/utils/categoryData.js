import {
  Cable,
  Lightbulb,
  ShieldCheck,
  Zap,
  Package,
  Droplets,
  Factory,
  Plug,
  Wrench,
  Hammer,
  Battery,
  Layers,
} from "lucide-react";

export const categoryIcons = {
  iluminacao: Lightbulb,
  "industrial-protecao": Factory,
  protecao: ShieldCheck,
  tomadas: Zap,
  solar: Battery,
  ferramentas: Wrench,
  "chuveiros-torneiras": Droplets,
  chuveiros: Droplets,
  "fios-cabos": Cable,
  diversos: Layers,
  default: Package,
};

export const getCategoryIcon = (categoryId) => {
  return categoryIcons[categoryId] || categoryIcons["default"];
};

export const CATEGORY_METADATA = {
  iluminacao: {
    name: "Iluminação",
    subcategories: [
      { id: "fitas-mangueiras", name: "Fitas e Mangueiras LED" },
      { id: "luminarias", name: "Luminárias" },
      { id: "luminarias-emergencia", name: "Luminárias de emergência" },
      { id: "lustres-pendentes", name: "Lustres e Pendentes" },
      { id: "lampadas-bulbo", name: "Lâmpadas Bulbo" },
      { id: "lampadas-decorativas", name: "Lâmpadas Decorativas" },
      { id: "lampadas-tubulares", name: "Lâmpadas Tubulares" },
      { id: "paineis-led", name: "Painéis LED" },
      { id: "plafon-plafonier", name: "Plaflon e Plafonier" },
      { id: "refletores-led", name: "Refletores LED" },
      { id: "spot", name: "Spot" },
    ],
  },
  "chuveiros-torneiras": {
    name: "Chuveiros e Torneiras",
    subcategories: [
      { id: "aquecedores", name: "Aquecedores" },
      { id: "chuveiros", name: "Chuveiros" },
      { id: "resistencias", name: "Resistências" },
      { id: "torneiras-eletricas", name: "Torneiras Elétricas" },
    ],
  },
  "fios-cabos": {
    name: "Fios e Cabos",
    subcategories: [
      { id: "fios-flexiveis", name: "Fios Flexíveis" },
      { id: "cabos-pp", name: "Cabos PP" },
      { id: "cabos-energia", name: "Cabos de Energia" },
      { id: "cabos-paralelos", name: "Cabos Paralelos" },
    ],
  },
  "industrial-protecao": {
    name: "Industrial e Proteção",
    subcategories: [
      { id: "acessorios", name: "Acessórios" },
      { id: "auto-transformador", name: "Auto Transformador" },
      { id: "barramento-pente", name: "Barramento Pente" },
      { id: "disjuntores-caixa-moldada", name: "Disjuntores Caixa Moldada" },
      { id: "disjuntores-din", name: "Disjuntores Din" },
      { id: "disjuntores-nema", name: "Disjuntores Nema" },
      { id: "interruptores-diferencial", name: "Interruptores Diferencial" },
      { id: "quadros-comando", name: "Quadros de Comando" },
      { id: "quadros-medicoes", name: "Quadros e Medições" },
      { id: "terminal", name: "Terminal" },
    ],
  },
  tomadas: {
    name: "Interruptores e Tomadas",
    subcategories: [
      { id: "tomadas", name: "Tomadas" },
      { id: "interruptores", name: "Interruptores" },
      { id: "interruptores-tomadas", name: "Interruptores e Tomadas" },
      { id: "conjuntos", name: "Conjuntos Montados" },
      { id: "plugues", name: "Plugues e Adaptadores" },
    ],
  },
  ferramentas: {
    name: "Ferramentas",
    subcategories: [
      { id: "alicates", name: "Alicates" },
      { id: "chaves", name: "Chaves de Fenda/Philips" },
      { id: "multimetros", name: "Multímetros" },
      { id: "furadeiras", name: "Furadeiras e Parafusadeiras" },
      { id: "brocas", name: "Brocas" },
    ],
  },
  diversos: {
    name: "Diversos",
    subcategories: [{ id: "outros", name: "Outros" }],
  },
};
