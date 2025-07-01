
import { useMemo } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { useTenant } from '@/components/ProtectedRoute';

export const useTenantData = () => {
  const { tenantId } = useTenant();
  const { orders: allOrders, customers: allCustomers, tenants, updateCustomer, ...rest } = useOrders();

  const filteredData = useMemo(() => {
    // Super admin (tenantId null) vê todos os dados
    if (!tenantId) {
      return {
        orders: allOrders,
        customers: allCustomers,
        currentTenant: null,
      };
    }

    // Usuários normais veem apenas dados do seu tenant
    return {
      orders: allOrders.filter(order => order.tenantId === tenantId),
      customers: allCustomers.filter(customer => customer.tenantId === tenantId),
      currentTenant: tenants.find(tenant => tenant.id === tenantId) || null,
    };
  }, [allOrders, allCustomers, tenants, tenantId]);

  return {
    ...filteredData,
    ...rest,
    updateCustomer,
    tenantId,
  };
};
