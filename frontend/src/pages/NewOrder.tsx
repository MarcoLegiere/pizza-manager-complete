import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Printer, ShoppingCart, User, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CustomerSearch from '@/components/CustomerSearch';
import { Customer, Order } from '@/types';
import { useTenantData } from '@/hooks/useTenantData';

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export default function NewOrder() {
  const navigate = useNavigate();
  const { customers, addOrder, orders, tenantId, currentTenant } = useTenantData();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('pix');
  const [changeAmount, setChangeAmount] = useState<string>('');

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
    { id: '1', name: 'Pizza Margherita', price: 35.90, category: 'Pizza' },
    { id: '2', name: 'Pizza Pepperoni', price: 42.90, category: 'Pizza' },
    { id: '3', name: 'Pizza Calabresa', price: 38.90, category: 'Pizza' },
    { id: '4', name: 'Coca-Cola 2L', price: 8.90, category: 'Bebida' },
    { id: '5', name: 'Guaraná 2L', price: 8.90, category: 'Bebida' },
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

    const storeName = currentTenant?.name || 'ESTABELECIMENTO';
    const storePhone = currentTenant?.phone || '(11) 99999-9999';

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
          <h2>${storeName.toUpperCase()}</h2>
          <p>Tel: ${storePhone}</p>
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
      id: (orders.length + 1).toString(),
      tenantId: tenantId || 'tenant-1', // Usar o tenantId do usuário logado
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

    addOrder(newOrder);
    printOrder(newOrder);
    
    alert('Pedido criado com sucesso!');
    navigate('/orders');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Novo Pedido</h1>
              <p className="text-gray-600">Crie um novo pedido para entrega</p>
            </div>
            <Button 
              onClick={handleSubmitOrder}
              disabled={orderItems.length === 0}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
            >
              <Printer className="w-5 h-5 mr-2" />
              Finalizar e Imprimir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Customer & Payment */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Cliente
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Busque ou cadastre um cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <CustomerSearch 
                  customers={customers}
                  onCustomerSelected={handleCustomerSelected}
                />
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer-name" className="text-sm font-semibold text-gray-700">Nome *</Label>
                    <Input
                      id="customer-name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      placeholder="Nome completo do cliente"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-phone" className="text-sm font-semibold text-gray-700">Telefone *</Label>
                    <Input
                      id="customer-phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-address" className="text-sm font-semibold text-gray-700">Endereço de Entrega *</Label>
                    <textarea
                      id="customer-address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Rua, número, bairro, cidade..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pagamento
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Como o cliente irá pagar
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex-1 cursor-pointer font-medium">PIX</Label>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Instantâneo</Badge>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="debit" id="debit" />
                    <Label htmlFor="debit" className="flex-1 cursor-pointer font-medium">Cartão de Débito</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label htmlFor="credit" className="flex-1 cursor-pointer font-medium">Cartão de Crédito</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer font-medium">Dinheiro</Label>
                  </div>
                </RadioGroup>
                
                {paymentMethod === 'cash' && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Label htmlFor="change-amount" className="text-sm font-semibold text-gray-700">Troco para quanto?</Label>
                    <Input
                      id="change-amount"
                      type="number"
                      step="0.01"
                      value={changeAmount}
                      onChange={(e) => setChangeAmount(e.target.value)}
                      placeholder="50.00"
                      className="mt-2"
                    />
                    {changeAmount && (
                      <p className="text-sm text-green-600 mt-2 font-medium">
                        Troco: R$ {(parseFloat(changeAmount) - (getTotal() + 5.00)).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Menu */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cardápio
              </CardTitle>
              <CardDescription className="text-orange-100">
                Selecione os itens para o pedido
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="group p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-200 hover:border-orange-300">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        </div>
                        <p className="text-lg font-bold text-orange-600">R$ {item.price.toFixed(2)}</p>
                      </div>
                      <Button
                        onClick={() => addItem(item)}
                        size="sm"
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Order Summary */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
              <CardTitle>Resumo do Pedido</CardTitle>
              <CardDescription className="text-green-100">
                {orderItems.length === 0 ? 'Nenhum item' : `${orderItems.length} item(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {orderItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Seu pedido está vazio</p>
                  <p className="text-gray-400 text-sm">Adicione itens do cardápio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                        <p className="text-sm text-gray-600">R$ {item.price.toFixed(2)} cada</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          onClick={() => removeItem(item.productId)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Badge variant="secondary" className="px-3 py-1 font-bold">
                          {item.quantity}
                        </Badge>
                        <Button
                          onClick={() => addItem({ id: item.productId, name: item.productName, price: item.price, category: 'Pizza' })}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <div className="min-w-20 text-right">
                          <p className="font-bold text-lg text-green-600">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4 mt-6 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span>R$ {getTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Taxa de Entrega:</span>
                      <span>R$ 5,00</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold text-green-600 border-t pt-2">
                      <span>Total:</span>
                      <span>R$ {(getTotal() + 5.00).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
