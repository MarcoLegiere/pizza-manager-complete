
import { useState, useEffect } from 'react';
import { Order } from '@/types';

interface OrderStats {
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

export const useOrderStats = (orders: Order[]): OrderStats => {
  const [stats, setStats] = useState<OrderStats>({
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
  });

  useEffect(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayOrders = orders.filter(order => 
      new Date(order.createdAt) >= startOfToday
    );

    const monthlyOrders = orders.filter(order => 
      new Date(order.createdAt) >= startOfMonth
    );

    const activeOrders = orders.filter(order => 
      ['pending', 'preparing', 'out_for_delivery'].includes(order.status)
    );

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.total, 0);

    const deliveredTodayOrders = todayOrders.filter(order => 
      order.status === 'delivered'
    );

    setStats({
      todayOrders: todayOrders.length,
      todayRevenue,
      activeOrders: activeOrders.length,
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      preparingOrders: orders.filter(order => order.status === 'preparing').length,
      outForDeliveryOrders: orders.filter(order => order.status === 'out_for_delivery').length,
      deliveredTodayOrders: deliveredTodayOrders.length,
      monthlyRevenue,
      monthlyOrders: monthlyOrders.length,
      averageTicket: monthlyOrders.length > 0 ? monthlyRevenue / monthlyOrders.length : 0,
    });
  }, [orders]);

  return stats;
};
