import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Plus, Pizza, Users, BarChart, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { dashboardService, DashboardStats, RecentOrder } from '@/services/dashboardService';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [statsData, ordersData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentOrders(4)
      ]);
      
      setStats(statsData);
      setRecentOrders(ordersData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
    
    toast({
      title: "Dados atualizados",
      description: "Dashboard atualizado com sucesso!",
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Em preparo';
      case 'out_for_delivery': return 'Saiu para entrega';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-6 h-6 animate-spin text-orange-600" />
              <span className="text-lg text-gray-600">Carregando dashboard...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho com botão de atualizar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Visão geral do seu negócio</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pedidos Hoje</CardTitle>
              <CardDescription>Total de pedidos recebidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats?.todayOrders || 0}
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                Ativos: {stats?.activeOrders || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Faturamento Hoje</CardTitle>
              <CardDescription>Vendas do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                R$ {stats?.todayRevenue?.toFixed(2) || '0,00'}
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 mr-1 text-blue-500" />
                Mensal: R$ {stats?.monthlyRevenue?.toFixed(2) || '0,00'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pedidos Ativos</CardTitle>
              <CardDescription>Em preparo ou entrega</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {stats?.activeOrders || 0}
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <div className="flex space-x-4">
                  <span>Prep: {stats?.preparingOrders || 0}</span>
                  <span>Entrega: {stats?.outForDeliveryOrders || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Ticket Médio</CardTitle>
              <CardDescription>Valor médio dos pedidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                R$ {stats?.averageTicket?.toFixed(2) || '0,00'}
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <span>Pedidos mensais: {stats?.monthlyOrders || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção inferior */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pedidos Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recentes</CardTitle>
              <CardDescription>Últimos pedidos recebidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Pedido #{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">R$ {order.total.toFixed(2)}</p>
                        <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Pizza className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum pedido recente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Acessos mais utilizados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => navigate('/new-order')} 
                  className="h-16 flex flex-col items-center justify-center space-y-1 bg-orange-600 hover:bg-orange-700"
                >
                  <Plus size={20} />
                  <span className="text-sm">Novo Pedido</span>
                </Button>
                <Button 
                  onClick={() => navigate('/menu')} 
                  variant="outline" 
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                >
                  <Pizza size={20} />
                  <span className="text-sm">Cardápio</span>
                </Button>
                <Button 
                  onClick={() => navigate('/customers')} 
                  variant="outline" 
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                >
                  <Users size={20} />
                  <span className="text-sm">Clientes</span>
                </Button>
                <Button 
                  onClick={() => navigate('/reports')} 
                  variant="outline" 
                  className="h-16 flex flex-col items-center justify-center space-y-1"
                >
                  <BarChart size={20} />
                  <span className="text-sm">Relatórios</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

