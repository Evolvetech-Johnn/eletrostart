import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken, removeToken, setToken } from "../services/apiClient";
import { authService, User } from "../services/authService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar token ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getMe();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        removeToken();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login(email, password);
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: "Erro desconhecido" };
    } catch (error: any) {
      return { success: false, error: error.message || "Erro ao fazer login" };
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setIsAuthenticated(false);
    // Optional: Redirect to login handled by protected route or usage
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
