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

export interface SyncResponse {
  success: boolean;
  message: string;
  stats: {
    processed: number;
    imported: number;
  };
}

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
    name: string;
  };
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

export interface DiscordLog {
  id: string;
  status: "SUCCESS" | "ERROR";
  details: string;
  createdAt: string;
}

export interface SyncMessagesResponse {
  message: string;
  imported: number;
}

export const adminService = {
  getDashboard: async (): Promise<DashboardData> => {
    const response = (await apiClient.get(
      "/admin/dashboard",
    )) as ApiResponse<DashboardData>;
    return response.data;
  },

  syncMessages: async (): Promise<SyncMessagesResponse> => {
    const response = (await apiClient.post(
      "/admin/messages/sync",
    )) as ApiResponse<SyncMessagesResponse>;
    return response.data;
  },

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

  getDiscordLogs: async (): Promise<DiscordLog[]> => {
    const response = await apiClient.get<any, ApiResponse<DiscordLog[]>>(
      "/admin/discord/logs",
    );
    return response.data;
  },

  testDiscord: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<
      any,
      ApiResponse<{ message: string }>
    >("/admin/discord/test");
    return response.data;
  },
};
