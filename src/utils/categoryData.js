
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
  Thermometer,
  Disc,
} from "lucide-react";

// Mapeamento de Slugs (gerados a partir das pastas) para Ícones
export const categoryIcons = {
  "aquecedores-lorenzetti": Thermometer,
  autotransformadores: Zap,
  "brocas-aco-rapido": Wrench, // Ou Drill se tiver
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

export const getCategoryIcon = (categorySlug) => {
  return categoryIcons[categorySlug] || categoryIcons["default"];
};

// Metadata for Subcategories or Display Names (Optional if DB handles names)
// Since we are using folders as source of truth, the names in DB are the folder names.
// This file might still be useful for hardcoded subcategories if we want them,
// but for now, let's keep it minimal or consistent with the folders.
export const CATEGORY_METADATA = {
  // We can keep these empty or populated if we want specific subcategories
  // But strictly speaking, the folders are the categories.
  // If we want subcategories, they should probably be subfolders or handled in DB.
  // For now, leaving empty to avoid confusion/mismatch.
};
