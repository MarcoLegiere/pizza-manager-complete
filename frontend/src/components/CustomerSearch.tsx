
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Customer } from '@/types';

interface CustomerSearchProps {
  onCustomerSelected: (customer: Customer | null) => void;
  customers: Customer[];
}

export default function CustomerSearch({ onCustomerSelected, customers }: CustomerSearchProps) {
  const [phone, setPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const searchCustomer = () => {
    if (!phone.trim()) {
      setSelectedCustomer(null);
      onCustomerSelected(null);
      return;
    }

    const customer = customers.find(c => 
      c.phone.replace(/\D/g, '') === phone.replace(/\D/g, '')
    );

    setSelectedCustomer(customer || null);
    onCustomerSelected(customer || null);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCustomer();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [phone]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const clearSearch = () => {
    setPhone('');
    setSelectedCustomer(null);
    onCustomerSelected(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="customer-phone">Buscar Cliente por Telefone</Label>
        <div className="flex gap-2">
          <Input
            id="customer-phone"
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(11) 99999-9999"
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={clearSearch}
            disabled={!phone}
          >
            Limpar
          </Button>
        </div>
      </div>

      {selectedCustomer && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="font-medium text-green-800">Cliente encontrado:</p>
          <p className="text-sm text-green-700">{selectedCustomer.name}</p>
          <p className="text-sm text-green-700">{selectedCustomer.phone}</p>
          {selectedCustomer.addresses[0] && (
            <p className="text-sm text-green-700">
              {selectedCustomer.addresses[0].street}, {selectedCustomer.addresses[0].neighborhood}
            </p>
          )}
        </div>
      )}

      {phone && !selectedCustomer && phone.length > 8 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            Cliente não encontrado. Preencha as informações manualmente.
          </p>
        </div>
      )}
    </div>
  );
}
