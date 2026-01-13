// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Token storage
const TOKEN_KEY = 'eletrostart_admin_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// Fetch wrapper com autenticação
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  // Se token expirou, limpar e redirecionar
  if (response.status === 401) {
    removeToken();
    window.location.href = '/admin/login';
    throw new Error('Sessão expirada');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro na requisição');
  }

  return data;
};

// API Service
export const api = {
  // Auth
  login: async (email, password) => {
    const data = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.success && data.data.token) {
      setToken(data.data.token);
    }
    return data;
  },

  logout: () => {
    removeToken();
    window.location.href = '/admin/login';
  },

  getMe: () => fetchWithAuth('/auth/me'),

  // Messages (public)
  sendContactMessage: (formData) => {
    return fetchWithAuth('/messages', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  },

  // Admin
  getDashboard: () => fetchWithAuth('/admin/dashboard'),

  getMessages: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/admin/messages?${queryString}`);
  },

  getMessage: (id) => fetchWithAuth(`/admin/messages/${id}`),

  updateMessageStatus: (id, status) => {
    return fetchWithAuth(`/admin/messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  deleteMessage: (id) => {
    return fetchWithAuth(`/admin/messages/${id}`, {
      method: 'DELETE'
    });
  }
};

export default api;
