
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tenant } from '@/types';
import { useForm } from 'react-hook-form';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenant: Partial<Tenant>) => void;
  tenant?: Tenant | null;
  mode: 'create' | 'edit';
}

interface TenantFormData {
  name: string;
  slug: string;
  phone: string;
  zipCode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  isActive: boolean;
  minimumOrder: number;
}

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export default function TenantModal({ isOpen, onClose, onSave, tenant, mode }: TenantModalProps) {
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<TenantFormData>({
    defaultValues: {
      name: '',
      slug: '',
      phone: '',
      zipCode: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      isActive: true,
      minimumOrder: 25.00,
    }
  });

  const watchedIsActive = watch('isActive');
  const watchedZipCode = watch('zipCode');
  const watchedName = watch('name');

  // Auto-generate slug from name
  useEffect(() => {
    if (watchedName && mode === 'create') {
      const slug = watchedName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [watchedName, setValue, mode]);

  // Format zipCode
  const formatZipCode = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  // Search address by zipCode
  const searchAddressByZipCode = async (zipCode: string) => {
    const cleanZipCode = zipCode.replace(/\D/g, '');
    
    if (cleanZipCode.length !== 8) {
      return;
    }

    setIsLoadingCEP(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanZipCode}/json/`);
      const data: ViaCEPResponse = await response.json();
      
      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique se o CEP está correto.",
          variant: "destructive",
        });
        return;
      }

      setValue('street', data.logradouro);
      setValue('neighborhood', data.bairro);
      setValue('city', data.localidade);
      setValue('state', data.uf);
      
      toast({
        title: "Endereço encontrado!",
        description: "Os campos de endereço foram preenchidos automaticamente.",
      });
    } catch (error) {
      toast({
        title: "Erro ao buscar CEP",
        description: "Não foi possível buscar o endereço. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCEP(false);
    }
  };

  // Watch zipCode changes
  useEffect(() => {
    if (watchedZipCode && watchedZipCode.replace(/\D/g, '').length === 8) {
      searchAddressByZipCode(watchedZipCode);
    }
  }, [watchedZipCode]);

  // Reset form when tenant changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (tenant && mode === 'edit') {
        const addressParts = tenant.address?.split(',') || [];
        const streetPart = addressParts[0]?.trim() || '';
        const streetMatch = streetPart.match(/^(.+?),?\s*(\d+.*)$/);
        
        reset({
          name: tenant.name || '',
          slug: tenant.slug || '',
          phone: tenant.phone || '',
          zipCode: '', // CEP não está armazenado no modelo atual
          street: streetMatch ? streetMatch[1].trim() : streetPart,
          number: streetMatch ? streetMatch[2].trim() : '',
          neighborhood: addressParts[1]?.trim() || '',
          city: addressParts[2]?.trim() || '',
          state: addressParts[3]?.trim() || '',
          isActive: tenant.isActive ?? true,
          minimumOrder: tenant.settings?.minimumOrder || 25.00,
        });
      } else {
        reset({
          name: '',
          slug: '',
          phone: '',
          zipCode: '',
          street: '',
          number: '',
          neighborhood: '',
          city: '',
          state: '',
          isActive: true,
          minimumOrder: 25.00,
        });
      }
    }
  }, [isOpen, tenant, mode, reset]);

  const onSubmit = (data: TenantFormData) => {
    // Build full address
    const addressParts = [
      data.street && data.number ? `${data.street}, ${data.number}` : data.street,
      data.neighborhood,
      data.city,
      data.state
    ].filter(Boolean);
    
    const fullAddress = addressParts.join(' - ');

    const tenantData: Partial<Tenant> = {
      ...data,
      address: fullAddress,
      id: tenant?.id || `tenant-${Date.now()}`,
      createdAt: tenant?.createdAt || new Date().toISOString(),
      usersCount: tenant?.usersCount || 0,
      monthlyRevenue: tenant?.monthlyRevenue || 0,
      settings: {
        workingHours: tenant?.settings?.workingHours || {
          monday: { open: '18:00', close: '23:00', isOpen: true },
          tuesday: { open: '18:00', close: '23:00', isOpen: true },
          wednesday: { open: '18:00', close: '23:00', isOpen: true },
          thursday: { open: '18:00', close: '23:00', isOpen: true },
          friday: { open: '18:00', close: '24:00', isOpen: true },
          saturday: { open: '18:00', close: '24:00', isOpen: true },
          sunday: { open: '18:00', close: '23:00', isOpen: true },
        },
        deliveryAreas: tenant?.settings?.deliveryAreas || [],
        paymentMethods: tenant?.settings?.paymentMethods || ['Dinheiro', 'PIX'],
        minimumOrder: data.minimumOrder,
        isOpen: tenant?.settings?.isOpen ?? true,
      },
    };

    onSave(tenantData);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatZipCode(e.target.value);
    setValue('zipCode', formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    let formatted = value;
    
    if (value.length <= 10) {
      formatted = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      formatted = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    if (value.length <= 11) {
      setValue('phone', formatted);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Estabelecimento' : 'Editar Estabelecimento'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Preencha as informações para criar um novo estabelecimento.' 
              : 'Edite as informações do estabelecimento.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Estabelecimento *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Nome é obrigatório' })}
                placeholder="Ex: Pizzaria Bella Vista"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Identificador (Slug) *</Label>
              <Input
                id="slug"
                {...register('slug', { required: 'Slug é obrigatório' })}
                placeholder="Ex: bella-vista"
              />
              {errors.slug && (
                <p className="text-sm text-red-500">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                {...register('phone', { required: 'Telefone é obrigatório' })}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumOrder">Pedido Mínimo (R$) *</Label>
              <Input
                id="minimumOrder"
                type="number"
                step="0.01"
                {...register('minimumOrder', { required: 'Pedido mínimo é obrigatório' })}
                placeholder="25.00"
              />
              {errors.minimumOrder && (
                <p className="text-sm text-red-500">{errors.minimumOrder.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <Label className="text-base font-semibold">Endereço</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP *</Label>
                <div className="relative">
                  <Input
                    id="zipCode"
                    {...register('zipCode', { required: 'CEP é obrigatório' })}
                    onChange={handleZipCodeChange}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                  {isLoadingCEP && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
                {errors.zipCode && (
                  <p className="text-sm text-red-500">{errors.zipCode.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="street">Logradouro *</Label>
                <Input
                  id="street"
                  {...register('street', { required: 'Logradouro é obrigatório' })}
                  placeholder="Rua das Flores"
                />
                {errors.street && (
                  <p className="text-sm text-red-500">{errors.street.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Número *</Label>
                <Input
                  id="number"
                  {...register('number', { required: 'Número é obrigatório' })}
                  placeholder="123"
                />
                {errors.number && (
                  <p className="text-sm text-red-500">{errors.number.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro *</Label>
                <Input
                  id="neighborhood"
                  {...register('neighborhood', { required: 'Bairro é obrigatório' })}
                  placeholder="Centro"
                />
                {errors.neighborhood && (
                  <p className="text-sm text-red-500">{errors.neighborhood.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  {...register('city', { required: 'Cidade é obrigatória' })}
                  placeholder="São Paulo"
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  {...register('state', { required: 'Estado é obrigatório' })}
                  placeholder="SP"
                  maxLength={2}
                />
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={watchedIsActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">Estabelecimento ativo</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Criar Estabelecimento' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
