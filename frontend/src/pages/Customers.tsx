
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import CustomerModal from '@/components/CustomerModal';
import { useTenantData } from '@/hooks/useTenantData';

export default function Customers() {
  const { customers, orders, updateCustomer, addCustomer } = useTenantData();

  const handleCustomerSaved = (customer: any) => {
    const existingCustomerIndex = customers.findIndex(c => c.id === customer.id);
    
    if (existingCustomerIndex >= 0) {
      updateCustomer(customer);
    } else {
      addCustomer(customer);
    }
  };

  const getCustomerOrdersCount = (customerId: string) => {
    return orders.filter(order => order.customerId === customerId).length;
  };

  const getCustomerThisMonthOrders = (customerId: string) => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    return orders.filter(order => 
      order.customerId === customerId && 
      new Date(order.createdAt) >= thisMonth
    ).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Clientes</h2>
          <CustomerModal 
            onCustomerSaved={handleCustomerSaved}
            trigger={<Button>+ Novo Cliente</Button>}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
                <div className="text-sm text-gray-600">Total de Clientes</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{orders.length}</div>
                <div className="text-sm text-gray-600">Pedidos Este Mês</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {customers.filter(c => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(c.createdAt) >= weekAgo;
                  }).length}
                </div>
                <div className="text-sm text-gray-600">Novos Esta Semana</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <CardDescription>
                      Cliente desde: {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Ativo</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Informações de Contato</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Telefone:</strong> {customer.phone}</p>
                      {customer.email && (
                        <p><strong>Email:</strong> {customer.email}</p>
                      )}
                      <p><strong>Pedidos:</strong> {getCustomerOrdersCount(customer.id)} total</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Endereços</h4>
                    <div className="space-y-2">
                      {customer.addresses.map((address) => (
                        <div key={address.id} className="text-sm bg-gray-50 p-2 rounded">
                          <p>{address.street}</p>
                          <p>{address.neighborhood}, {address.city}</p>
                          <p>CEP: {address.zipCode}</p>
                          {address.isDefault && (
                            <Badge variant="outline" className="text-xs mt-1">Padrão</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm">Ver Pedidos ({getCustomerThisMonthOrders(customer.id)})</Button>
                  <CustomerModal 
                    customer={customer}
                    onCustomerSaved={handleCustomerSaved}
                    trigger={<Button variant="outline" size="sm">Editar</Button>}
                  />
                  <Button variant="outline" size="sm">Histórico</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
