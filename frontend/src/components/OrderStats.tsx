
import { Card, CardContent } from '@/components/ui/card';
import { useTenantData } from '@/hooks/useTenantData';
import { useOrderStats } from '@/hooks/useOrderStats';

export default function OrderStats() {
  const { orders } = useTenantData();
  const stats = useOrderStats(orders);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.preparingOrders}</div>
            <div className="text-sm text-gray-600">Em Preparo</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.outForDeliveryOrders}</div>
            <div className="text-sm text-gray-600">Saindo</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.deliveredTodayOrders}</div>
            <div className="text-sm text-gray-600">Entregues Hoje</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
