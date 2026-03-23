import apiClient from "./apiClient";
import { ApiResponse } from "./adminService";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<any, ApiResponse<LoginResponse>>(
      "/auth/login",
      { email, password },
    );
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<any, ApiResponse<{ user: User }>>(
      "/auth/me",
    );
    return response.data.user;
  },

  /**
   * Logout — chama o endpoint do servidor para limpar o Cookie httpOnly
   */
  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },
};
