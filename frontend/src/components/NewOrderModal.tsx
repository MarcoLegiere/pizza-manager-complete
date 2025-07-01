import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Printer } from 'lucide-react';
import { Order, Customer } from '@/types';
import CustomerSearch from './CustomerSearch';
import { useOrders } from '@/contexts/OrderContext';

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

interface NewOrderModalProps {
  onOrderCreated: (order: Order) => void;
  ordersCount: number;
}

export default function NewOrderModal({ onOrderCreated, ordersCount }: NewOrderModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('pix');
  const [changeAmount, setChangeAmount] = useState<string>('');
  
  const { customers } = useOrders();

  const handleCustomerSelected = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    if (customer) {
      setCustomerInfo({
        name: customer.name,
        phone: customer.phone,
        address: customer.addresses[0] ? 
          `${customer.addresses[0].street}, ${customer.addresses[0].neighborhood}, ${customer.addresses[0].city}` : 
          '',
      });
    } else {
      setCustomerInfo({
        name: '',
        phone: '',
        address: '',
      });
    }
  };

  const menuItems = [
    { id: '1', name: 'Pizza Margherita', price: 35.90 },
    { id: '2', name: 'Pizza Pepperoni', price: 42.90 },
    { id: '3', name: 'Pizza Calabresa', price: 38.90 },
    { id: '4', name: 'Coca-Cola 2L', price: 8.90 },
    { id: '5', name: 'Guaraná 2L', price: 8.90 },
  ];

  const addItem = (item: typeof menuItems[0]) => {
    const existingItem = orderItems.find(orderItem => orderItem.productId === item.id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(orderItem =>
        orderItem.productId === item.id
          ? { ...orderItem, quantity: orderItem.quantity + 1 }
          : orderItem
      ));
    } else {
      setOrderItems([...orderItems, {
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: 1
      }]);
    }
  };

  const removeItem = (productId: string) => {
    const existingItem = orderItems.find(item => item.productId === productId);
    
    if (existingItem && existingItem.quantity > 1) {
      setOrderItems(orderItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setOrderItems(orderItems.filter(item => item.productId !== productId));
    }
  };

  const getTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'debit': return 'Cartão de Débito';
      case 'credit': return 'Cartão de Crédito';
      case 'pix': return 'PIX';
      case 'cash': return 'Dinheiro';
      default: return method;
    }
  };

  const printOrder = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pedido #${order.id}</title>
        <style>
          @media print {
            body { margin: 0; padding: 10px; font-family: 'Courier New', monospace; font-size: 12px; width: 58mm; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .item-line { display: flex; justify-content: space-between; margin: 2px 0; }
            .total-line { border-top: 1px dashed #000; padding-top: 5px; margin-top: 10px; font-weight: bold; }
            .footer { text-align: center; margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px; }
          }
          body { margin: 0; padding: 10px; font-family: 'Courier New', monospace; font-size: 12px; width: 58mm; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .item-line { display: flex; justify-content: space-between; margin: 2px 0; }
          .total-line { border-top: 1px dashed #000; padding-top: 5px; margin-top: 10px; font-weight: bold; }
          .footer { text-align: center; margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>PIZZARIA DO JOÃO</h2>
          <p>Tel: (11) 99999-9999</p>
          <p>CUPOM NAO FISCAL</p>
          <p>Pedido #${order.id}</p>
          <p>${new Date(order.createdAt).toLocaleString('pt-BR')}</p>
        </div>
        
        <div>
          <p><strong>Cliente:</strong> ${customerInfo.name}</p>
          <p><strong>Telefone:</strong> ${customerInfo.phone}</p>
          <p><strong>Endereço:</strong> ${customerInfo.address}</p>
        </div>
        
        <div style="margin: 10px 0;">
          ${order.items.map(item => `
            <div class="item-line">
              <span>${item.quantity}x ${item.productName}</span>
              <span>R$ ${item.total.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="total-line">
          <div class="item-line">
            <span>Subtotal:</span>
            <span>R$ ${(order.total - order.deliveryFee).toFixed(2)}</span>
          </div>
          <div class="item-line">
            <span>Taxa de Entrega:</span>
            <span>R$ ${order.deliveryFee.toFixed(2)}</span>
          </div>
          <div class="item-line">
            <span><strong>TOTAL:</strong></span>
            <span><strong>R$ ${order.total.toFixed(2)}</strong></span>
          </div>
        </div>
        
        <div>
          <p><strong>Pagamento:</strong> ${getPaymentMethodLabel(order.paymentMethod)}</p>
          ${paymentMethod === 'cash' && changeAmount ? `<p><strong>Troco para:</strong> R$ ${changeAmount}</p>` : ''}
          ${paymentMethod === 'cash' && changeAmount ? `<p><strong>Troco:</strong> R$ ${(parseFloat(changeAmount) - order.total).toFixed(2)}</p>` : ''}
        </div>
        
        <div class="footer">
          <p>Obrigado pela preferencia!</p>
          <p>Tempo estimado: 30-45 min</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSubmitOrder = () => {
    if (orderItems.length === 0) {
      alert('Adicione pelo menos um item ao pedido');
      return;
    }
    
    if (!customerInfo.name || !customerInfo.phone) {
      alert('Preencha as informações do cliente');
      return;
    }

    if (paymentMethod === 'cash' && !changeAmount) {
      alert('Informe o valor para troco');
      return;
    }

    if (paymentMethod === 'cash' && parseFloat(changeAmount) <= getTotal() + 5.00) {
      alert('O valor para troco deve ser maior que o total do pedido');
      return;
    }

    const newOrder: Order = {
      id: (ordersCount + 1).toString(),
      tenantId: 'tenant-1',
      customerId: selectedCustomer?.id || 'new-customer',
      items: orderItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
      })),
      total: getTotal() + 5.00,
      status: 'pending',
      paymentMethod: getPaymentMethodLabel(paymentMethod),
      deliveryAddress: customerInfo.address,
      deliveryFee: 5.00,
      source: 'manual',
      createdAt: new Date().toISOString(),
    };

    console.log('Novo pedido:', {
      customer: customerInfo,
      items: orderItems,
      total: getTotal()
    });

    onOrderCreated(newOrder);
    printOrder(newOrder);
    setIsModalOpen(false);
    setOrderItems([]);
    setCustomerInfo({ name: '', phone: '', address: '' });
    setSelectedCustomer(null);
    setPaymentMethod('pix');
    setChangeAmount('');
    alert('Pedido criado com sucesso!');
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button>+ Novo Pedido</Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Pedido</DialogTitle>
          <DialogDescription>
            Criar um novo pedido para entrega
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Informações do Cliente</h3>
            
            <CustomerSearch 
              customers={customers}
              onCustomerSelected={handleCustomerSelected}
            />
            
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Endereço</label>
              <textarea
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Endereço completo para entrega"
                rows={3}
              />
            </div>

            <div>
              <h3 className="font-semibold mb-3">Forma de Pagamento</h3>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pix" id="modal-pix" />
                  <Label htmlFor="modal-pix">PIX</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="debit" id="modal-debit" />
                  <Label htmlFor="modal-debit">Cartão de Débito</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit" id="modal-credit" />
                  <Label htmlFor="modal-credit">Cartão de Crédito</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="modal-cash" />
                  <Label htmlFor="modal-cash">Dinheiro</Label>
                </div>
              </RadioGroup>
              
              {paymentMethod === 'cash' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1">Troco para quanto?</label>
                  <input
                    type="number"
                    step="0.01"
                    value={changeAmount}
                    onChange={(e) => setChangeAmount(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Ex: 50.00"
                  />
                  {changeAmount && (
                    <p className="text-sm text-gray-600 mt-1">
                      Troco: R$ {(parseFloat(changeAmount) - (getTotal() + 5.00)).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Cardápio</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {menuItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">R$ {item.price.toFixed(2)}</p>
                  </div>
                  <Button
                    onClick={() => addItem(item)}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold">Itens do Pedido</h3>
            {orderItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Adicione itens do cardápio para começar o pedido
              </p>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">R$ {item.price.toFixed(2)} cada</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => removeItem(item.productId)}
                        size="sm"
                        variant="outline"
                      >
                        <Minus size={16} />
                      </Button>
                      <Badge variant="secondary" className="px-3 py-1">
                        {item.quantity}
                      </Badge>
                      <Button
                        onClick={() => addItem({ id: item.productId, name: item.productName, price: item.price })}
                        size="sm"
                        variant="outline"
                      >
                        <Plus size={16} />
                      </Button>
                      <p className="font-medium min-w-20 text-right">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total (+ R$ 5,00 entrega):</span>
                    <span className="text-green-600">R$ {(getTotal() + 5.00).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitOrder}
            disabled={orderItems.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Finalizar e Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
