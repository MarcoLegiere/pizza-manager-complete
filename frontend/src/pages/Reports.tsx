
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import { useOrders } from '@/contexts/OrderContext';
import { useOrderStats } from '@/hooks/useOrderStats';

export default function Reports() {
  const { orders } = useOrders();
  const stats = useOrderStats(orders);

  // Calculate top products
  const productSales = orders.reduce((acc, order) => {
    order.items.forEach(item => {
      if (!acc[item.productName]) {
        acc[item.productName] = { quantity: 0, revenue: 0 };
      }
      acc[item.productName].quantity += item.quantity;
      acc[item.productName].revenue += item.total;
    });
    return acc;
  }, {} as Record<string, { quantity: number; revenue: number }>);

  const topProducts = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Calculate daily sales for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const dailySales = last7Days.map(date => {
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === date.toDateString();
    });
    const revenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
    return {
      day: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
      revenue,
      percentage: stats.monthlyRevenue > 0 ? (revenue / stats.monthlyRevenue) * 100 : 0
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  R$ {stats.monthlyRevenue.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Faturamento Mensal</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.monthlyOrders}</div>
                <div className="text-sm text-gray-600">Pedidos no Mês</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  R$ {stats.averageTicket.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Ticket Médio</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.todayOrders}</div>
                <div className="text-sm text-gray-600">Pedidos Hoje</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Período</CardTitle>
              <CardDescription>Últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailySales.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{day.day}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(day.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">R$ {day.revenue.toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
              <CardDescription>Top 5 do período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">{index + 1}º</Badge>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.quantity} vendas</p>
                      </div>
                    </div>
                    <p className="font-medium text-green-600">R$ {product.revenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
