/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, User } from "../services/authService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
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

  // Verificar autenticação ao carregar — funciona com cookie httpOnly e Bearer header
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // authService.getMe vai tentar fazer GET /api/auth/me
        // O cookie httpOnly é enviado automaticamente pelo navegador (withCredentials: true)
        const userData = await authService.getMe();
        setUser(userData);
        setIsAuthenticated(true);
      } catch {
        // Token expirado, inválido ou ausente — silenciosamente desloga
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
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: "Erro desconhecido" };
    } catch (error: any) {
      return { success: false, error: error.message || "Erro ao fazer login" };
    }
  };

  const logout = async () => {
    try {
      // Limpa o cookie httpOnly no servidor
      await authService.logout();
    } catch {
      // Ignorar erro de rede no logout — o cliente vai limpar o estado de qualquer forma
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
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
