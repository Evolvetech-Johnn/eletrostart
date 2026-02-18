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

export type CategoryMinPriceConfig = Record<string, number>;

export interface LowStockProduct {
  id: string;
  name: string;
  sku?: string | null;
  stock: number;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  price: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  orderId?: string | null;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string | null;
  createdBy?: { id: string; name: string; email: string } | null;
  product?: { id: string; name: string; sku?: string | null };
  order?: { id: string; status: string };
  createdAt: string;
}

export interface StockMovementsResponse {
  data: StockMovement[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
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

  getMinPriceConfig: async (): Promise<CategoryMinPriceConfig> => {
    const response = await apiClient.get<
      any,
      ApiResponse<CategoryMinPriceConfig>
    >("/ecommerce/products/min-price-config");
    return response.data;
  },

  getLowStockProducts: async (
    threshold: number,
  ): Promise<LowStockProduct[]> => {
    const response = await apiClient.get<any, ApiResponse<LowStockProduct[]>>(
      `/ecommerce/products/stock/low?threshold=${threshold}`,
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

  adjustProductStock: async (
    id: string,
    payload: { newStock: number; reason?: string },
  ): Promise<Product> => {
    const response = await apiClient.post<any, ApiResponse<Product>>(
      `/ecommerce/products/${id}/stock/adjust`,
      payload,
    );
    return response.data;
  },

  getStockMovements: async (params: {
    productId?: string;
    type?: string;
    origin?: string;
    from?: string;
    to?: string;
    userId?: string;
    delta?: string;
    emptySku?: string;
    page?: number;
    limit?: number;
  }): Promise<StockMovementsResponse> => {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await apiClient.get<
      any,
      ApiResponse<{
        data: StockMovement[];
        pagination: StockMovementsResponse["pagination"];
      }>
    >(`/ecommerce/stock-movements?${queryString}`);

    const payload = response.data as any;

    return {
      data: (payload.data || []) as StockMovement[],
      pagination:
        payload.pagination || {
          total: payload.data?.length || 0,
          page: params.page || 1,
          limit: params.limit || payload.data?.length || 0,
          totalPages: 1,
        },
    };
  },

  exportStockMovements: async (params: {
    productId?: string;
    type?: string;
    origin?: string;
    from?: string;
    to?: string;
    userId?: string;
    delta?: string;
    dateFormat?: string;
    emptySku?: string;
    dateTz?: string;
  }): Promise<string> => {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await apiClient.get<any, any>(
      `/ecommerce/stock-movements/export?${queryString}`,
      { responseType: "blob" },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    return url;
  },

  exportStockMovementsXlsx: async (params: {
    productId?: string;
    type?: string;
    origin?: string;
    from?: string;
    to?: string;
    userId?: string;
    delta?: string;
    dateFormat?: string;
    emptySku?: string;
    dateTz?: string;
  }): Promise<string> => {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await apiClient.get<any, any>(
      `/ecommerce/stock-movements/export.xlsx?${queryString}`,
      { responseType: "blob" },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    return url;
  },

  getStockEmptySkuCount: async (params: {
    productId?: string;
    type?: string;
    origin?: string;
    from?: string;
    to?: string;
    userId?: string;
    delta?: string;
  }): Promise<number> => {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await apiClient.get<any, { success: boolean; count: number }>(
      `/ecommerce/stock-movements/empty-sku-count?${queryString}`,
    );
    return (response as any).count || 0;
  },

  getProductStockMovements: async (
    id: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<{ data: StockMovement[]; pagination: any }> => {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await apiClient.get<any, ApiResponse<StockMovement[]>>(
      `/ecommerce/products/${id}/stock-movements?${queryString}`,
    );
    return {
      data: (response as any).data,
      pagination: (response as any).pagination,
    };
  },

  // Admin Bulk
  bulkUpdateProducts: async (
    ids: string[],
    data: Partial<Product>,
  ): Promise<void> => {
    // Payload must match controller expectation: { ids, updates }
    await apiClient.patch("/ecommerce/products/bulk/update", {
      ids,
      updates: data,
    });
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

  importProducts: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<any, any>(
      "/ecommerce/products/import",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data || response;
  },

  exportProducts: async (): Promise<void> => {
    // Direct window location for file download or use fetch with blob
    // Using fetch allows adding auth headers if apiClient handles them automatically (it does)
    const response = await apiClient.get<any, any>(
      "/ecommerce/products/export",
      { responseType: "blob" },
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `produtos-export-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  },

  syncSheet: async (sheetUrl: string): Promise<any> => {
    const response = await apiClient.post<any, any>(
      "/ecommerce/products/sync/sheets",
      { sheetUrl },
    );
    return response.data || response;
  },
};
