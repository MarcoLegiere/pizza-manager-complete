
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Tenant } from '@/types';
import { useForm } from 'react-hook-form';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<User> & { password?: string }) => void;
  user?: User | null;
  tenants: Tenant[];
  mode: 'create' | 'edit';
}

interface UserFormData {
  name: string;
  email: string;
  role: 'admin' | 'attendant';
  tenantId: string;
  isActive: boolean;
  password: string;
  changePassword: boolean;
}

export default function UserModal({ isOpen, onClose, onSave, user, tenants, mode }: UserModalProps) {
  const [changePassword, setChangePassword] = useState(false);
  
  const { register, handleSubmit, watch, reset, setValue } = useForm<UserFormData>({
    defaultValues: {
      name: '',
      email: '',
      role: 'attendant',
      tenantId: '',
      isActive: true,
      password: '',
      changePassword: false,
    }
  });

  const watchedRole = watch('role');
  const watchedIsActive = watch('isActive');

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (user && mode === 'edit') {
        reset({
          name: user.name || '',
          email: user.email || '',
          role: user.role === 'super_admin' ? 'admin' : user.role || 'attendant',
          tenantId: user.tenantId || '',
          isActive: user.isActive ?? true,
          password: '',
          changePassword: false,
        });
        setChangePassword(false);
      } else {
        reset({
          name: '',
          email: '',
          role: 'attendant',
          tenantId: '',
          isActive: true,
          password: '',
          changePassword: false,
        });
        setChangePassword(false);
      }
    }
  }, [isOpen, user, mode, reset]);

  const onSubmit = (data: UserFormData) => {
    const userData: Partial<User> & { password?: string } = {
      name: data.name,
      email: data.email,
      role: data.role,
      tenantId: data.tenantId,
      isActive: data.isActive,
      id: user?.id || `user-${Date.now()}`,
      createdAt: user?.createdAt || new Date().toISOString(),
    };

    // Adicionar senha apenas se necessário
    if (mode === 'create' || (mode === 'edit' && changePassword)) {
      userData.password = data.password;
    }

    onSave(userData);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    setChangePassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                {...register('name', { required: true })}
                placeholder="Digite o nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { required: true })}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <Select
                value={watchedRole}
                onValueChange={(value) => setValue('role', value as 'admin' | 'attendant')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="attendant">Atendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenantId">Pizzaria</Label>
              <Select
                value={watch('tenantId')}
                onValueChange={(value) => setValue('tenantId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a pizzaria" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Campo de senha */}
          <div className="space-y-3">
            {mode === 'edit' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="changePassword"
                  checked={changePassword}
                  onCheckedChange={(checked) => setChangePassword(checked as boolean)}
                />
                <Label htmlFor="changePassword">Alterar senha</Label>
              </div>
            )}

            {(mode === 'create' || changePassword) && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  {mode === 'create' ? 'Senha' : 'Nova Senha'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password', { 
                    required: mode === 'create' || changePassword 
                  })}
                  placeholder="Digite a senha"
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={watchedIsActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">Usuário ativo</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
