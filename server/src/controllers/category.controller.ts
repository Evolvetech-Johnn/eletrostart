import { Request, Response } from "express";
import * as categoryService from "../services/category.service";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.listCategories();
    res.json({ success: true, data: categories });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar categorias",
      error: error.message,
    });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug as string);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Categoria não encontrada" });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao buscar categoria" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image } = req.body;
    const category = await categoryService.createCategory({
      name,
      description,
      image,
    });
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ success: false, message: "Categoria já existe" });
    }
    console.error("Error creating category:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao criar categoria" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;
    const category = await categoryService.updateCategory(id as string, {
      name,
      description,
      image,
    });
    res.json({ success: true, data: category });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar categoria" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id as string);
    res.json({ success: true, message: "Categoria excluída" });
  } catch (error: any) {
    if (error.message.includes("produtos vinculados")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res
      .status(500)
      .json({ success: false, message: "Erro ao excluir categoria" });
  }
};
