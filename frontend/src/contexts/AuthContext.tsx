import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  canAccessTenant: (tenantId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Verificar se há um usuário armazenado localmente
      const storedUser = authService.getStoredUser();
      
      if (storedUser && authService.isAuthenticated()) {
        // Validar token com o backend
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Token inválido, limpar dados
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.data.user) {
        setUser(response.data.user);
      } else {
        throw new Error(response.error || 'Erro no login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, limpar o estado local
      setUser(null);
    }
  };

  const hasRole = (roles: string[]): boolean => {
    return authService.hasRole(roles);
  };

  const isSuperAdmin = (): boolean => {
    return authService.isSuperAdmin();
  };

  const isAdmin = (): boolean => {
    return authService.isAdmin();
  };

  const canAccessTenant = (tenantId: string): boolean => {
    return authService.canAccessTenant(tenantId);
  };

  const isAuthenticated = (): boolean => {
    return authService.isAuthenticated() && user !== null;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading,
      isAuthenticated: isAuthenticated(),
      hasRole,
      isSuperAdmin,
      isAdmin,
      canAccessTenant
    }}>
      {children}
    </AuthContext.Provider>
  );
};

