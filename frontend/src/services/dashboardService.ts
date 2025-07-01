import { API_BASE_URL } from '../config/api';

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  activeOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  outForDeliveryOrders: number;
  deliveredTodayOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  averageTicket: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

class DashboardService {
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

  async getStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
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
        throw new Error(result.error || 'Erro ao buscar estatísticas');
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      
      // Retornar dados padrão em caso de erro
      return {
        todayOrders: 0,
        todayRevenue: 0,
        activeOrders: 0,
        pendingOrders: 0,
        preparingOrders: 0,
        outForDeliveryOrders: 0,
        deliveredTodayOrders: 0,
        monthlyRevenue: 0,
        monthlyOrders: 0,
        averageTicket: 0,
      };
    }
  }

  async getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/recent-orders?limit=${limit}`, {
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
        throw new Error(result.error || 'Erro ao buscar pedidos recentes');
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos recentes:', error);
      return [];
    }
  }

  async getChartData(period: 'week' | 'month' | 'year' = 'week') {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/chart-data?period=${period}`, {
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
        throw new Error(result.error || 'Erro ao buscar dados do gráfico');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
      return [];
    }
  }
}

export const dashboardService = new DashboardService();

