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
