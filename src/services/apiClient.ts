import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

// Constants
const TOKEN_KEY = "eletrostart_admin_token";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "https://eletrostartbackend-api.onrender.com/api";

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to get token
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) =>
  localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    if (error.response) {
      // 401: Unauthorized
      if (error.response.status === 401) {
        removeToken();
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/admin/login";
        }
        return Promise.reject(
          new Error("Sessão expirada. Faça login novamente."),
        );
      }

      // 500: Server Error
      if (error.response.status >= 500) {
        console.error("Server Error:", error.response.data);
        return Promise.reject(
          new Error("Erro interno do servidor. Tente novamente mais tarde."),
        );
      }

      // Other errors
      const data = error.response.data as any;
      return Promise.reject(new Error(data.message || "Erro na requisição"));
    } else if (error.request) {
      // Network error
      return Promise.reject(
        new Error(
          "Erro de conexão. Verifique sua internet ou se o servidor está online.",
        ),
      );
    } else {
      return Promise.reject(error);
    }
  },
);

export default apiClient;
