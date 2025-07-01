import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import { storeService, Store } from '@/services/storeService';

export default function StoreSettings() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    active: true,
  });

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      const stores = await storeService.getStores();
      
      if (stores.length > 0) {
        const currentStore = stores[0]; // Pega o primeiro estabelecimento
        setStore(currentStore);
        setFormData({
          name: currentStore.name,
          phone: currentStore.phone,
          address: currentStore.address,
          email: currentStore.email,
          active: currentStore.active,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do estabelecimento:', error);
      toast.error('Erro ao carregar dados do estabelecimento');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!store) return;

    try {
      setSaving(true);
      
      const updatedStore = await storeService.updateStore(store.id, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        active: formData.active,
      });

      setStore(updatedStore);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Carregando configurações...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nenhum estabelecimento encontrado</h2>
            <p className="text-gray-600">Não foi possível carregar as informações do estabelecimento.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações da Loja</h1>
            <p className="text-gray-600">Gerencie as informações do seu estabelecimento</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Estabelecimento</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Jukinhas Bar"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@jukinhasbar.com"
                />
              </div>
              <div>
                <Label htmlFor="address">Endereço Completo</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua da Alegria, 789 - Centro"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status do Estabelecimento */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Estabelecimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Estabelecimento Ativo</Label>
                <Badge variant={formData.active ? "default" : "secondary"}>
                  {formData.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>ID do Estabelecimento</Label>
                  <Input value={store.id} disabled />
                </div>
                <div>
                  <Label>Data de Criação</Label>
                  <Input 
                    value={new Date(store.createdAt).toLocaleDateString('pt-BR')} 
                    disabled 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

