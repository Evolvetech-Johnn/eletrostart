import apiClient from "./apiClient";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  orderId?: string;
  read: boolean;
  priority: "low" | "medium" | "high";
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export const notificationService = {
  getNotifications: async (params: { read?: boolean; limit?: number } = {}) => {
    const response = await apiClient.get<any, { success: boolean; data: Notification[] }>(
      "/ecommerce/notifications",
      { params }
    );
    return response.data;
  },

  markAsRead: async (id: string) => {
    await apiClient.patch(`/ecommerce/notifications/${id}/read`);
  }
};
