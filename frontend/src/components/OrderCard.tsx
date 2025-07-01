
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => void;
}

export default function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Em Preparo';
      case 'out_for_delivery': return 'Saiu para Entrega';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              Pedido #{order.id.padStart(4, '0')}
            </CardTitle>
            <CardDescription>
              {new Date(order.createdAt).toLocaleString('pt-BR')}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {getStatusText(order.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Itens do Pedido</h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.productName}</span>
                  <span>R$ {item.total.toFixed(2)}</span>
                </div>
              ))}
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm border-t pt-2">
                  <span>Taxa de entrega</span>
                  <span>R$ {order.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total</span>
                <span>R$ {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Informações de Entrega</h4>
            <div className="text-sm space-y-1">
              <p><strong>Endereço:</strong> {order.deliveryAddress}</p>
              <p><strong>Pagamento:</strong> {order.paymentMethod}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Ações</h4>
            <div className="space-y-2">
              {order.status === 'pending' && (
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => onUpdateStatus(order.id, 'preparing')}
                >
                  Iniciar Preparo
                </Button>
              )}
              {order.status === 'preparing' && (
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => onUpdateStatus(order.id, 'out_for_delivery')}
                >
                  Enviar para Entrega
                </Button>
              )}
              {order.status === 'out_for_delivery' && (
                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => onUpdateStatus(order.id, 'delivered')}
                >
                  Marcar como Entregue
                </Button>
              )}
              <Button variant="outline" className="w-full" size="sm">
                Ver Detalhes
              </Button>
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  size="sm"
                  onClick={() => onUpdateStatus(order.id, 'cancelled')}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
