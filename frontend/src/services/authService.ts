import { API_BASE_URL } from '../config/api';

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      tenantId?: string;
    };
  };
  error?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'attendant';
  tenantId?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

class AuthService {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private getHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro no login');
      }

      if (result.success && result.data.token) {
        // Salvar token e dados do usuário
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        // Atualizar último login
        const userWithLogin = {
          ...result.data.user,
          lastLogin: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(userWithLogin));
      }

      return result;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Chamar endpoint de logout se necessário
      const token = this.getAuthToken();
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getHeaders(),
        });
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Limpar dados locais
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        // Token inválido, limpar dados
        this.logout();
        return null;
      }

      const result = await response.json();
      
      if (result.success) {
        // Atualizar dados do usuário no localStorage
        localStorage.setItem('user', JSON.stringify(result.data));
        return result.data;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      this.logout();
      return null;
    }
  }

  getStoredUser(): User | null {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Erro ao recuperar usuário do localStorage:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  hasRole(requiredRoles: string[]): boolean {
    const user = this.getStoredUser();
    return user ? requiredRoles.includes(user.role) : false;
  }

  isSuperAdmin(): boolean {
    return this.hasRole(['super_admin']);
  }

  isAdmin(): boolean {
    return this.hasRole(['super_admin', 'admin']);
  }

  canAccessTenant(tenantId: string): boolean {
    const user = this.getStoredUser();
    if (!user) return false;
    
    // Super admin pode acessar qualquer tenant
    if (user.role === 'super_admin') return true;
    
    // Outros usuários só podem acessar seu próprio tenant
    return user.tenantId === tenantId;
  }
}

export const authService = new AuthService();

