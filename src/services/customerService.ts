import apiClient from "./apiClient";

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  document: string | null;
  active: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResponse {
  success: boolean;
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CustomerDetailResponse {
  success: boolean;
  data: {
    customer: Customer;
    orders: any[]; // Array of simplified orders
  };
}

export const customerService = {
  getCustomers: async (params: { page?: number; limit?: number; search?: string; active?: string }) => {
    const { data } = await apiClient.get<CustomerListResponse>("/admin/customers", { params });
    return data;
  },
  
  getCustomerById: async (id: string) => {
    const { data } = await apiClient.get<CustomerDetailResponse>(`/admin/customers/${id}`);
    return data;
  },

  createCustomer: async (customer: Partial<Customer>) => {
    const { data } = await apiClient.post<{ success: boolean; data: Customer }>("/admin/customers", customer);
    return data;
  },

  updateCustomer: async (id: string, customer: Partial<Customer>) => {
    const { data } = await apiClient.put<{ success: boolean; data: Customer }>(`/admin/customers/${id}`, customer);
    return data;
  },

  toggleActive: async (id: string, active: boolean) => {
    const { data } = await apiClient.patch<{ success: boolean; data: Customer }>(`/admin/customers/${id}/toggle-active`, { active });
    return data;
  }
};
