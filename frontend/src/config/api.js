// Configuração da API
export const API_BASE_URL = 'https://3001-ikh77cekd3biuirdfrbuj-9a32bb50.manusvm.computer/api';

// Função para fazer requisições HTTP
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Adicionar token de autenticação se existir
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
};

// Funções específicas da API
export const api = {
  // Autenticação
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  // Dashboard
  getDashboardStats: () => apiRequest('/dashboard/stats'),
  getRecentOrders: () => apiRequest('/dashboard/recent-orders'),

  // Clientes
  getCustomers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/customers${queryString ? `?${queryString}` : ''}`);
  },
  
  getCustomerByPhone: (phone) => apiRequest(`/customers/phone/${phone}`),
  
  createCustomer: (customerData) => apiRequest('/customers', {
    method: 'POST',
    body: JSON.stringify(customerData),
  }),

  // Produtos
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
  },

  // Categorias
  getCategories: () => apiRequest('/categories'),

  // Pedidos
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/orders${queryString ? `?${queryString}` : ''}`);
  },
  
  createOrder: (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  
  updateOrderStatus: (orderId, status) => apiRequest(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),

  // Relatórios
  getSalesReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports/sales${queryString ? `?${queryString}` : ''}`);
  },
  
  getTopProducts: (limit = 5) => apiRequest(`/reports/products?limit=${limit}`),
};

export default api;

