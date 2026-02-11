import apiClient from "./apiClient";
import { ApiResponse } from "./adminService";

export interface ProductVariant {
  id: string;
  name: string;
  image?: string;
  price?: number;
  stock?: number;
  sku?: string;
  [key: string]: any;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku?: string;
  code?: string;
  unit?: string;
  categoryId?: string;
  category?: Category;
  image?: string;
  active: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[]; // JSON
  features?: any; // JSON
  specifications?: any; // JSON
  images?: string[];
  subcategory?: string;
  defaultVariant?: string;
  slug?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  image?: string;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  featured?: boolean;
  active?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  all?: boolean;
}

export interface CreateProductParams {
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku?: string;
  code?: string;
  unit?: string;
  categoryId?: string;
  subcategory?: string;
  image?: string;
  active?: boolean;
  featured?: boolean;
  variants?: any;
  features?: any;
  specifications?: any;
  images?: string[];
}

export interface UpdateProductParams extends Partial<CreateProductParams> {}

export interface ProductStats {
  total: number;
  active: number;
  lowStock: number;
  outOfStock: number;
  categories: number;
}

export interface SyncCategoriesResponse {
  success: boolean;
  message: string;
  stats: {
    categoriesProcessed: number;
    productsProcessed: number;
  };
}

export const productService = {
  // Public
  getProducts: async (params: GetProductsParams = {}): Promise<Product[]> => {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await apiClient.get<any, ApiResponse<Product[]>>(
      `/ecommerce/products?${queryString}`,
    );
    // Handle both wrapped and unwrapped responses if necessary, but apiClient interceptor usually returns data
    // Based on api.js, backend returns array directly or { success, data }
    // adminService interface suggests data is Product[].
    // Let's assume response.data is Product[] based on adminService.
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get<any, ApiResponse<Product>>(
      `/ecommerce/products/${id}`,
    );
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<any, ApiResponse<Category[]>>(
      "/ecommerce/categories",
    );
    return response.data;
  },

  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await apiClient.get<any, ApiResponse<Category>>(
      `/ecommerce/categories/${slug}`,
    );
    return response.data;
  },

  getProductStats: async (): Promise<ProductStats> => {
    const response = await apiClient.get<any, ApiResponse<ProductStats>>(
      "/ecommerce/products/stats/overview",
    );
    return response.data;
  },

  // Admin
  createProduct: async (data: CreateProductParams): Promise<Product> => {
    const response = await apiClient.post<any, ApiResponse<Product>>(
      "/ecommerce/products",
      data,
    );
    return response.data;
  },

  updateProduct: async (
    id: string,
    data: UpdateProductParams,
  ): Promise<Product> => {
    const response = await apiClient.put<any, ApiResponse<Product>>(
      `/ecommerce/products/${id}`,
      data,
    );
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/ecommerce/products/${id}`);
  },

  // Admin Bulk
  bulkUpdateProducts: async (
    ids: string[],
    data: Partial<Product>,
  ): Promise<void> => {
    await apiClient.patch("/ecommerce/products/bulk/update", { ids, data });
  },

  bulkDeleteProducts: async (ids: string[]): Promise<void> => {
    await apiClient.delete("/ecommerce/products/bulk/delete", {
      data: { ids },
    });
  },

  // Admin Categories
  createCategory: async (data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.post<any, ApiResponse<Category>>(
      "/ecommerce/categories",
      data,
    );
    return response.data;
  },

  updateCategory: async (
    id: string,
    data: Partial<Category>,
  ): Promise<Category> => {
    const response = await apiClient.put<any, ApiResponse<Category>>(
      `/ecommerce/categories/${id}`,
      data,
    );
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/ecommerce/categories/${id}`);
  },

  syncCategories: async (): Promise<SyncCategoriesResponse> => {
    const response = await apiClient.post<any, SyncCategoriesResponse>(
      "/admin/categories/sync",
    );
    return response;
  },
};
