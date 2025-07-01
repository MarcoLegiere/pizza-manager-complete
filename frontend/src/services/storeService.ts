import { API_BASE_URL } from '../config/api';

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

class StoreService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async getStores(): Promise<Store[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stores`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao buscar estabelecimentos');
      }
    } catch (error) {
      console.error('Erro ao buscar estabelecimentos:', error);
      throw error;
    }
  }

  async getStore(id: string): Promise<Store> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stores/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao buscar estabelecimento');
      }
    } catch (error) {
      console.error('Erro ao buscar estabelecimento:', error);
      throw error;
    }
  }

  async updateStore(id: string, storeData: Partial<Store>): Promise<Store> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stores/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(storeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao atualizar estabelecimento');
      }
    } catch (error) {
      console.error('Erro ao atualizar estabelecimento:', error);
      throw error;
    }
  }

  async createStore(storeData: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<Store> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stores`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(storeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao criar estabelecimento');
      }
    } catch (error) {
      console.error('Erro ao criar estabelecimento:', error);
      throw error;
    }
  }
}

export const storeService = new StoreService();

