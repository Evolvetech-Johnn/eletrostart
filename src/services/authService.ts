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
  token: string;
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

  logout: () => {
    // Client-side cleanup is handled by removing token,
    // but if there's a server-side logout endpoint, call it here.
    // For now, assuming just token removal which is done in AuthContext/apiClient helper.
  },
};
