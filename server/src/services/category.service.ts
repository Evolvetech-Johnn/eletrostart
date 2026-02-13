import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const listCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });
};

export const getCategoryBySlug = async (slug: string) => {
  return await prisma.category.findFirst({
    where: { slug },
    include: {
      _count: { select: { products: true } },
    },
  });
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
