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
  Thermometer,
  LucideIcon,
} from "lucide-react";

// Mapeamento de Slugs (gerados a partir das pastas) para Ícones
export const categoryIcons: Record<string, LucideIcon> = {
  "aquecedores-lorenzetti": Thermometer,
  autotransformadores: Zap,
  "brocas-aco-rapido": Wrench,
  "cabo-paralelo-2-vias": Cable,
  "cabo-pp": Cable,
  "chuveiros-lorenzetti": Droplets,
  disjuntores: ShieldCheck,
  "eletrodutos-componentes": Factory,
  "fios-sil-15mm-10mm": Cable,
  "interruptores-e-tomadas": Zap,
  "lampada-bulbo-led": Lightbulb,
  luminarias: Lightbulb,
  "painel-led-plafon": Lightbulb,
  "plugues-macho-e-femea": Plug,
  "refletores-slim-led": Lightbulb,
  "torneira-eletronica-zagonel": Droplets,
  "tubular-t8": Lightbulb,
  default: Package,
};

export const getCategoryIcon = (categorySlug: string): LucideIcon => {
  return categoryIcons[categorySlug] || categoryIcons["default"];
};

export const CATEGORY_METADATA: Record<string, { subcategories: string[] }> = {};

export const MAIN_CATEGORIES = [
  "Iluminação",
  "Fios e Cabos",
  "Chuveiros e Torneiras",
  "Industrial e Proteção",
  "Ferramentas",
  "Interruptores e Tomadas",
] as const;

export type MainCategoryName = (typeof MAIN_CATEGORIES)[number];

export const CATEGORY_KEYWORDS: Record<MainCategoryName, string[]> = {
  "Interruptores e Tomadas": ["interrupt", "tomada", "plug"],
  "Ferramentas": ["ferrament", "broca", "chave", "alicate", "serra"],
  "Chuveiros e Torneiras": ["chuve", "torneira", "aquec"],
  "Fios e Cabos": ["fio", "cabo", "pp", "paralelo"],
  "Iluminação": ["lamp", "lumin", "led", "refletor", "tubular", "plafon", "painel"],
  "Industrial e Proteção": ["disjunt", "eletroduto", "industrial", "prote", "autotransformador", "quadros", "dps"],
};

export const classifyMainCategory = (
  name?: string,
  slug?: string,
): MainCategoryName => {
  const n = (name || "").toLowerCase();
  const s = (slug || "").toLowerCase();
  for (const main of MAIN_CATEGORIES) {
    const keywords = CATEGORY_KEYWORDS[main];
    if (keywords.some((k) => n.includes(k) || s.includes(k))) {
      return main;
    }
  }
  return "Industrial e Proteção";
};
