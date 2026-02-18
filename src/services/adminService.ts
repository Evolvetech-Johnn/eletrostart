import apiClient from "./apiClient";

export interface DashboardData {
  stats: {
    total: number;
    new: number;
    today: number;
    thisWeek: number;
  };
  orders: {
    total: number;
    pending: number;
  };
  users: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Integração Discord removida

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  tags?: Tag[];
  notes?: string;
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
  };
  source?: string;
  auditLogs?: AuditLog[];
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email?: string;
  };
  targetType?: string;
  targetId?: string;
  messageId?: string;
}

export interface GetMessagesParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  tag?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetMessagesResponse {
  messages: Message[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateMessageMetaParams {
  notes?: string;
  priority?: string;
  assignedToId?: string;
  tags?: string[];
}

// Integração Discord removida

export const adminService = {
  getDashboard: async (): Promise<DashboardData> => {
    const response = (await apiClient.get(
      "/admin/dashboard",
    )) as ApiResponse<DashboardData>;
    return response.data;
  },

  getAuditLogs: async (params: {
    page?: number;
    limit?: number;
    userId?: string;
    targetType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    logs: AuditLog[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.userId) query.set("userId", params.userId);
    if (params.targetType) query.set("targetType", params.targetType);
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);

    const response = await apiClient.get<
      any,
      ApiResponse<{
        data: AuditLog[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>
    >(`/admin/audit/logs?${query.toString()}`);

    const payload = response.data as any;

    return {
      logs: (payload.data || []) as AuditLog[],
      pagination: payload.pagination || {
        total: payload.data?.length || 0,
        page: params.page || 1,
        limit: params.limit || payload.data?.length || 0,
        totalPages: 1,
      },
    };
  },

  getDashboardAnalytics: async (
    days: number = 30,
  ): Promise<{
    salesByDay: { date: string; count: number }[];
    revenueByDay: { date: string; value: number }[];
    messagesByStatus: { status: string; count: number }[];
    lowStockProducts: {
      id: string;
      name: string;
      stock: number;
      sku?: string;
    }[];
    topSellingProducts: {
      productId: string;
      name?: string;
      quantity: number;
      revenue: number;
    }[];
    ticketMedio: number;
    pendingOrders: number;
  }> => {
    const response = await apiClient.get<any, ApiResponse<any>>(
      `/admin/dashboard/analytics?days=${days}`,
    );
    return response.data;
  },

  // Integração Discord removida

  getMessages: async (
    params: GetMessagesParams,
  ): Promise<GetMessagesResponse> => {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await apiClient.get<any, ApiResponse<GetMessagesResponse>>(
      `/admin/messages?${queryString}`,
    );
    return response.data;
  },

  getMessage: async (id: string): Promise<Message> => {
    const response = await apiClient.get<any, ApiResponse<Message>>(
      `/admin/messages/${id}`,
    );
    return response.data;
  },

  getTags: async (): Promise<Tag[]> => {
    const response = await apiClient.get<any, ApiResponse<Tag[]>>(
      "/admin/tags",
    );
    return response.data;
  },

  createTag: async (data: { name: string; color?: string }): Promise<Tag> => {
    const response = await apiClient.post<any, ApiResponse<Tag>>(
      "/admin/tags",
      data,
    );
    return response.data;
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const response = await apiClient.get<any, ApiResponse<AdminUser[]>>(
      "/admin/users",
    );
    return response.data;
  },
  createUser: async (data: {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "MANAGER" | "EDITOR";
    active?: boolean;
  }): Promise<AdminUser> => {
    const response = await apiClient.post<any, ApiResponse<AdminUser>>(
      "/admin/users",
      data,
    );
    return response.data;
  },
  updateUser: async (
    id: string,
    data: Partial<{
      name: string;
      email: string;
      password: string;
      role: "ADMIN" | "MANAGER" | "EDITOR";
      active: boolean;
    }>,
  ): Promise<AdminUser> => {
    const response = await apiClient.put<any, ApiResponse<AdminUser>>(
      `/admin/users/${id}`,
      data,
    );
    return response.data;
  },
  updateUserRole: async (
    id: string,
    role: "ADMIN" | "MANAGER" | "EDITOR",
  ): Promise<AdminUser> => {
    const response = await apiClient.patch<any, ApiResponse<AdminUser>>(
      `/admin/users/${id}/role`,
      { role },
    );
    return response.data;
  },
  updateUserStatus: async (id: string, active: boolean): Promise<AdminUser> => {
    const response = await apiClient.patch<any, ApiResponse<AdminUser>>(
      `/admin/users/${id}/status`,
      { active },
    );
    return response.data;
  },
  resetPassword: async (payload: {
    email: string;
    newPassword: string;
    token: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.post<
      any,
      ApiResponse<{ message: string }>
    >("/admin/users/reset-password", payload);
    return response.data;
  },

  updateMessageStatus: async (id: string, status: string): Promise<Message> => {
    const response = await apiClient.patch<any, ApiResponse<Message>>(
      `/admin/messages/${id}`,
      { status },
    );
    return response.data;
  },

  updateMessageMeta: async (
    id: string,
    data: UpdateMessageMetaParams,
  ): Promise<Message> => {
    const response = await apiClient.patch<any, ApiResponse<Message>>(
      `/admin/messages/${id}/meta`,
      data,
    );
    return response.data;
  },

  deleteMessage: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/messages/${id}`);
  },

  bulkAction: async (
    ids: string[],
    action: string,
    value?: any,
  ): Promise<void> => {
    await apiClient.patch("/admin/messages/bulk", { ids, action, value });
  },

  exportMessages: async (params: GetMessagesParams): Promise<string> => {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await apiClient.get(
      `/admin/messages/export?${queryString}`,
      {
        responseType: "blob",
      },
    );
    return window.URL.createObjectURL(new Blob([response as any]));
  },

  // Integração Discord removida
};
