export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'attendant';
  tenantId?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  phone: string;
  address: string;
  isActive: boolean;
  settings: TenantSettings;
  createdAt: string;
  usersCount?: number;
  monthlyRevenue?: number;
}

export interface TenantSettings {
  workingHours: {
    [key: string]: { open: string; close: string; isOpen: boolean };
  };
  deliveryAreas: DeliveryArea[];
  paymentMethods: string[];
  minimumOrder: number;
  isOpen: boolean;
}

export interface DeliveryArea {
  id: string;
  name: string;
  fee: number;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  options?: ProductOption[];
}

export interface ProductOption {
  id: string;
  name: string;
  type: 'size' | 'border' | 'additional';
  options: { name: string; price: number }[];
}

export interface Order {
  id: string;
  tenantId: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentMethod: string;
  deliveryAddress: string;
  createdAt: string;
  deliveryFee: number;
  source: 'manual' | 'online';
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  options?: { [key: string]: string };
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  addresses: CustomerAddress[];
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  street: string;
  neighborhood: string;
  city: string;
  zipCode: string;
  isDefault: boolean;
}
