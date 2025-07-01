
import React, { createContext, useContext, useState } from 'react';
import { Order, Customer, Tenant } from '@/types';

interface OrderContextType {
  orders: Order[];
  customers: Customer[];
  tenants: Tenant[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  updateTenant: (updatedTenant: Tenant) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within a OrderProvider');
  }
  return context;
};

const initialTenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Pizzaria do João',
    slug: 'pizzaria-do-joao',
    phone: '(11) 99999-9999',
    address: 'Rua das Pizzas, 123 - Centro',
    isActive: true,
    settings: {
      workingHours: {
        monday: { open: '18:00', close: '23:00', isOpen: true },
        tuesday: { open: '18:00', close: '23:00', isOpen: true },
        wednesday: { open: '18:00', close: '23:00', isOpen: true },
        thursday: { open: '18:00', close: '23:00', isOpen: true },
        friday: { open: '18:00', close: '24:00', isOpen: true },
        saturday: { open: '18:00', close: '24:00', isOpen: true },
        sunday: { open: '18:00', close: '23:00', isOpen: true },
      },
      deliveryAreas: [],
      paymentMethods: ['Dinheiro', 'PIX'],
      minimumOrder: 25.00,
      isOpen: true,
    },
    createdAt: new Date().toISOString(),
    usersCount: 5,
    monthlyRevenue: 12000,
  },
  {
    id: 'tenant-2',
    name: 'Hamburgueria do Zé',
    slug: 'hamburgueria-do-ze',
    phone: '(11) 98888-7777',
    address: 'Avenida dos Burgers, 456 - Vila Nova',
    isActive: true,
    settings: {
      workingHours: {
        monday: { open: '18:00', close: '23:00', isOpen: true },
        tuesday: { open: '18:00', close: '23:00', isOpen: true },
        wednesday: { open: '18:00', close: '23:00', isOpen: true },
        thursday: { open: '18:00', close: '23:00', isOpen: true },
        friday: { open: '18:00', close: '24:00', isOpen: true },
        saturday: { open: '18:00', close: '24:00', isOpen: true },
        sunday: { open: '18:00', close: '23:00', isOpen: true },
      },
      deliveryAreas: [],
      paymentMethods: ['Dinheiro', 'Cartão', 'PIX'],
      minimumOrder: 30.00,
      isOpen: true,
    },
    createdAt: new Date().toISOString(),
    usersCount: 3,
    monthlyRevenue: 8000,
  },
];

const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      tenantId: 'tenant-1',
      customerId: '1',
      items: [
        { productId: '1', productName: 'Pizza Margherita', quantity: 1, unitPrice: 35.90, total: 35.90 },
        { productId: '4', productName: 'Coca-Cola 2L', quantity: 1, unitPrice: 8.90, total: 8.90 }
      ],
      total: 44.80,
      status: 'pending',
      paymentMethod: 'Dinheiro',
      deliveryAddress: 'Rua das Flores, 123 - Centro',
      createdAt: new Date().toISOString(),
      deliveryFee: 5.00,
      source: 'manual',
    },
    {
      id: '2',
      tenantId: 'tenant-2',
      customerId: '2',
      items: [
        { productId: '2', productName: 'Burger Simples', quantity: 2, unitPrice: 20.00, total: 40.00 },
        { productId: '5', productName: 'Guaraná 2L', quantity: 1, unitPrice: 8.90, total: 8.90 }
      ],
      total: 48.90,
      status: 'preparing',
      paymentMethod: 'Cartão',
      deliveryAddress: 'Avenida Principal, 456 - Jardim',
      createdAt: new Date().toISOString(),
      deliveryFee: 7.00,
      source: 'online',
    },
  ]);
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      tenantId: 'tenant-1',
      name: 'João Silva',
      phone: '(11) 99999-9999',
      email: 'joao@example.com',
      addresses: [{ id: '1', street: 'Rua das Flores, 123', neighborhood: 'Centro', city: 'São Paulo', zipCode: '01000-000', isDefault: true }],
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      tenantId: 'tenant-2',
      name: 'Maria Oliveira',
      phone: '(11) 98888-7777',
      email: 'maria@example.com',
      addresses: [{ id: '2', street: 'Avenida Principal, 456', neighborhood: 'Jardim', city: 'São Paulo', zipCode: '02000-000', isDefault: true }],
      createdAt: new Date().toISOString(),
    },
  ]);
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);

  const addOrder = (order: Order) => {
    setOrders([...orders, order]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const addCustomer = (customer: Customer) => {
    setCustomers([...customers, customer]);
  };

  const updateCustomer = (customer: Customer) => {
    setCustomers(customers.map(c => 
      c.id === customer.id ? customer : c
    ));
  };

  const updateTenant = (updatedTenant: Tenant) => {
    setTenants(tenants.map(tenant => 
      tenant.id === updatedTenant.id ? updatedTenant : tenant
    ));
  };

  return (
    <OrderContext.Provider value={{
      orders,
      customers,
      tenants,
      addOrder,
      updateOrderStatus,
      addCustomer,
      updateCustomer,
      updateTenant,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderProvider;
