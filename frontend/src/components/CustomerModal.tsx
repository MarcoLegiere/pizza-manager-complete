
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Customer } from '@/types';

interface CustomerModalProps {
  customer?: Customer;
  onCustomerSaved: (customer: Customer) => void;
  trigger: React.ReactNode;
}

export default function CustomerModal({ customer, onCustomerSaved, trigger }: CustomerModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    street: '',
    neighborhood: '',
    city: '',
    zipCode: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        street: customer.addresses[0]?.street || '',
        neighborhood: customer.addresses[0]?.neighborhood || '',
        city: customer.addresses[0]?.city || '',
        zipCode: customer.addresses[0]?.zipCode || '',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        street: '',
        neighborhood: '',
        city: '',
        zipCode: '',
      });
    }
  }, [customer, isModalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      alert('Nome e telefone são obrigatórios');
      return;
    }

    const newCustomer: Customer = {
      id: customer?.id || Date.now().toString(),
      tenantId: 'tenant-1',
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      addresses: [
        {
          id: customer?.addresses[0]?.id || Date.now().toString(),
          street: formData.street,
          neighborhood: formData.neighborhood,
          city: formData.city,
          zipCode: formData.zipCode,
          isDefault: true,
        },
      ],
      createdAt: customer?.createdAt || new Date().toISOString(),
    };

    onCustomerSaved(newCustomer);
    setIsModalOpen(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      street: '',
      neighborhood: '',
      city: '',
      zipCode: '',
    });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{customer ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogDescription>
            {customer ? 'Edite as informações do cliente' : 'Adicione um novo cliente'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do cliente"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>
          
          <div>
            <Label htmlFor="street">Endereço</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="Rua, número"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                placeholder="Bairro"
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Cidade"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="zipCode">CEP</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              placeholder="00000-000"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {customer ? 'Salvar' : 'Criar Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
