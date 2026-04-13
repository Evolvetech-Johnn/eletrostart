import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";

type FallbackProduct = {
  id: string;
  name: string;
  category?: string;
  categoryId?: string;
  subcategory?: string;
  price?: number;
  unit?: string;
  description?: string;
  image?: string;
  defaultVariant?: string | null;
};

let fallbackProductsCache: FallbackProduct[] | null = null;

const loadFallbackProducts = (): FallbackProduct[] => {
  if (fallbackProductsCache) return fallbackProductsCache;
  try {
    const catalogPath = path.resolve(process.cwd(), "..", "generated-products.json");
    const raw = fs.readFileSync(catalogPath, "utf-8");
    const parsed = JSON.parse(raw);
    fallbackProductsCache = Array.isArray(parsed) ? (parsed as FallbackProduct[]) : [];
  } catch {
    fallbackProductsCache = [];
  }
  return fallbackProductsCache;
};

const slugToName = (slug: string) => {
  return slug
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
};

const buildFallbackCategories = () => {
  const products = loadFallbackProducts();
  const counts = new Map<string, number>();

  for (const p of products) {
    const slug = (p.categoryId || p.category || "").trim();
    if (!slug) continue;
    counts.set(slug, (counts.get(slug) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([slug, productsCount]) => ({
      id: slug,
      name: slugToName(slug),
      slug,
      description: null,
      image: null,
      active: true,
      _count: { products: productsCount },
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

const isFallbackEnabled = () => process.env.NODE_ENV !== "production";

export const listCategories = async () => {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });
  } catch {
    if (!isFallbackEnabled()) throw new Error("Database unavailable");
    return buildFallbackCategories();
  }
};

export const getCategoryBySlug = async (slug: string) => {
  try {
    return await prisma.category.findFirst({
      where: { slug },
      include: {
        _count: { select: { products: true } },
      },
    });
  } catch {
    if (!isFallbackEnabled()) throw new Error("Database unavailable");
    return buildFallbackCategories().find((c) => c.slug === slug) ?? null;
  }
};

export const createCategory = async (data: {
  name: string;
  description?: string;
  image?: string;
}) => {
  const slug = data.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");

  return await prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      image: data.image,
    },
  });
};

export const updateCategory = async (
  id: string,
  data: { name?: string; description?: string; image?: string }
) => {
  const updateData: Prisma.CategoryUpdateInput = {};
  
  if (data.name) {
    updateData.name = data.name;
    updateData.slug = data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  }
  if (data.description !== undefined) updateData.description = data.description;
  if (data.image !== undefined) updateData.image = data.image;

  return await prisma.category.update({
    where: { id },
    data: updateData,
  });
};

export const deleteCategory = async (id: string) => {
  // Check if category has products
  const productsCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productsCount > 0) {
    throw new Error(
      `Categoria possui ${productsCount} produtos vinculados. Remova ou reclassifique os produtos primeiro.`
    );
  }

  return await prisma.category.delete({ where: { id } });
};
