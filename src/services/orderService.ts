import apiClient from "./apiClient";
import { ApiResponse } from "./adminService";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderStatusHistoryEntry {
  id: string;
  status: string;
  notes?: string;
  createdAt: string;
  changedBy?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerDoc?: string;
  addressZip: string;
  addressStreet: string;
  addressNumber: string;
  addressComp?: string;
  addressCity: string;
  addressState: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  trackingCode?: string | null;
  notes?: string;
  items: OrderItem[];
  statusHistory?: OrderStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderParams {
  customer: {
    name: string;
    email: string;
    phone?: string;
    doc?: string;
  };
  address: {
    zip: string;
    street: string;
    number: string;
    comp?: string;
    city: string;
    state: string;
  };
  items: {
    productId: string;
    quantity: number;
  }[];
  paymentMethod: string;
  notes?: string;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const orderService = {
  // Public
  createOrder: async (data: CreateOrderParams): Promise<Order> => {
    const response = await apiClient.post<any, ApiResponse<Order>>(
      "/ecommerce/orders",
      data,
    );
    return response.data;
  },

  // Admin
  getOrders: async (params: GetOrdersParams = {}): Promise<Order[]> => {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await apiClient.get<any, ApiResponse<Order[]>>(
      `/ecommerce/orders?${queryString}`,
    );
    return response.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.get<any, ApiResponse<Order>>(
      `/ecommerce/orders/${id}`,
    );
    return response.data;
  },

  updateOrderStatus: async (
    id: string,
    status: string,
    trackingCode?: string,
  ): Promise<Order> => {
    const body: any = { status };
    if (trackingCode !== undefined) {
      body.trackingCode = trackingCode;
    }
    const response = await apiClient.patch<any, ApiResponse<Order>>(
      `/ecommerce/orders/${id}/status`,
      body,
    );
    return response.data;
  },
};
