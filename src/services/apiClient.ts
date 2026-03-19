import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3001/api" : "");

if (!API_BASE_URL && !import.meta.env.DEV) {
  console.error(
    "VITE_API_URL/VITE_BACKEND_URL não configurado. Defina a variável no ambiente de produção.",
  );
}

// ─── Legacy localStorage helpers (mantido para compatibilidade transitória) ──────
// O token JWT agora reside no httpOnly Cookie emitido pelo servidor.
// Estas funções serão gradualmamente removidas conforme o fluxo de auth for atualizado.
const TOKEN_KEY = "eletrostart_admin_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// ─── Helper: ler cookie por nome ─────────────────────────────────────────────────
const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : undefined;
};

// ─── Axios instance ───────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  withCredentials: true,    // Envia cookies httpOnly automaticamente
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor ─────────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Bearer token de localStorage (fallback transitório)
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. CSRF token — ler do cookie csrf_token e injetar no header X-CSRF-Token
    //    O servidor emite o cookie csrf_token com httpOnly:false para que o JS possa ler.
    //    Para métodos mutantes (não GET/HEAD/OPTIONS), enviamos o token no header.
    const safeMethods = new Set(["get", "head", "options"]);
    const method = (config.method || "get").toLowerCase();
    if (!safeMethods.has(method)) {
      const csrfToken = getCookie("csrf_token");
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response interceptor ────────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    if (error.response) {
      // 401: Sessão expirada
      if (error.response.status === 401) {
        console.warn("🔐 Sessão Expirada ou Token em falta.", error.response.data);
        removeToken();
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/admin/login";
        }
        return Promise.reject(new Error("Sessão expirada. Faça login novamente."));
      }

      // 403: Forbidden (inclui CSRF failures)
      if (error.response.status === 403) {
        console.error("🚫 Acesso Negado (403):", error.response.data);
      }

      // 500: Server Error
      if (error.response.status >= 500) {
        console.error("Server Error:", error.response.data);
        return Promise.reject(
          new Error("Erro interno do servidor. Tente novamente mais tarde."),
        );
      }

      const data = error.response.data as any;
      return Promise.reject(new Error(data.message || "Erro na requisição"));
    } else if (error.request) {
      return Promise.reject(
        new Error("Erro de conexão. Verifique sua internet ou se o servidor está online."),
      );
    } else {
      return Promise.reject(error);
    }
  },
);

export default apiClient;
