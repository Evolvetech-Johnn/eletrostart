// Configuração da API
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Token storage
const TOKEN_KEY = "eletrostart_admin_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// Fetch wrapper com autenticação
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Se token expirou, limpar e redirecionar
    if (response.status === 401) {
      removeToken();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/admin/login";
      }
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    // Tratamento de erros do servidor (500)
    if (response.status >= 500) {
      const errorText = await response.text();
      console.error("Server Error:", errorText);
      throw new Error("Erro interno do servidor. Tente novamente mais tarde.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro na requisição");
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error(
        "Erro de conexão. Verifique sua internet ou se o servidor está online."
      );
    }
    throw error;
  }
};

// API Service
export const api = {
  // System
  checkHealth: () => fetch(`${API_BASE_URL}/health`).then((r) => r.json()),

  // Auth
  login: async (email, password) => {
    const data = await fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.success && data.data.token) {
      setToken(data.data.token);
    }
    return data;
  },

  logout: () => {
    removeToken();
    window.location.href = "/admin/login";
  },

  getMe: () => fetchWithAuth("/auth/me"),

  // Users (Admin)
  getUsers: () => fetchWithAuth("/admin/users"),

  // Messages (Public)
  sendContactMessage: (formData) => {
    return fetchWithAuth("/messages", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  },

  // Admin Messages
  getDashboard: () => fetchWithAuth("/admin/dashboard"),

  getMessages: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/admin/messages?${queryString}`);
  },

  getMessage: (id) => fetchWithAuth(`/admin/messages/${id}`),

  updateMessageStatus: (id, status) => {
    return fetchWithAuth(`/admin/messages/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  updateMessageMeta: (id, data) => {
    return fetchWithAuth(`/admin/messages/${id}/meta`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  bulkAction: (ids, action) => {
    return fetchWithAuth("/admin/messages/bulk", {
      method: "PATCH",
      body: JSON.stringify({ ids, action }),
    });
  },

  deleteMessage: (id) => {
    return fetchWithAuth(`/admin/messages/${id}`, {
      method: "DELETE",
    });
  },

  syncMessages: () => {
    return fetchWithAuth("/admin/messages/sync", {
      method: "POST",
    });
  },

  exportMessages: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/admin/messages/export?${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao exportar CSV");
    }

    const blob = await response.blob();
    return window.URL.createObjectURL(blob);
  },

  // Tags
  getTags: () => fetchWithAuth("/admin/tags"),

  createTag: (data) => {
    return fetchWithAuth("/admin/tags", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deleteTag: (id) => {
    return fetchWithAuth(`/admin/tags/${id}`, {
      method: "DELETE",
    });
  },

  // Integrations
  testDiscord: () =>
    fetchWithAuth("/admin/integrations/discord/test", { method: "POST" }),
  getDiscordLogs: () => fetchWithAuth("/admin/integrations/discord/logs"),

  // --- Store (Products/Orders) ---
  
  // Public
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/store/products?${queryString}`); // Note: Using fetchWithAuth for convenience, but it handles public too if token missing? 
    // Wait, fetchWithAuth adds token if present. The backend public routes don't require it, so it's fine.
    // Actually, `fetchWithAuth` prepends `API_BASE_URL`.
  },
  
  getProduct: (id) => fetchWithAuth(`/store/products/${id}`),
  getCategories: () => fetchWithAuth(`/store/categories`),
  createOrder: (data) => fetchWithAuth("/store/orders", { method: "POST", body: JSON.stringify(data) }),
  
  // Admin Products
  createProduct: (data) => fetchWithAuth("/store/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id, data) => fetchWithAuth(`/store/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id) => fetchWithAuth(`/store/products/${id}`, { method: "DELETE" }),
  
  // Admin Categories
  createCategory: (data) => fetchWithAuth("/store/categories", { method: "POST", body: JSON.stringify(data) }),
  deleteCategory: (id) => fetchWithAuth(`/store/categories/${id}`, { method: "DELETE" }),
  
  // Admin Orders
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/store/orders?${queryString}`);
  },
  getOrder: (id) => fetchWithAuth(`/store/orders/${id}`),
  updateOrderStatus: (id, data) => fetchWithAuth(`/store/orders/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
};

export default api;
