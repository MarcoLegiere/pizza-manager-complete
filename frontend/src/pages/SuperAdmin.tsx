import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tenant, User } from '@/types';
import Navbar from '@/components/Navbar';
import UserModal from '@/components/UserModal';
import TenantModal from '@/components/TenantModal';
import { Users, Building2, DollarSign, Activity, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SuperAdmin() {
  const { addUser, updateUser, removeUser } = useAuth();

  const [tenants, setTenants] = useState<Tenant[]>([
    {
      id: 'tenant-1',
      name: 'Pizzaria Bella Vista',
      slug: 'bella-vista',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123 - Centro',
      isActive: true,
      usersCount: 2,
      monthlyRevenue: 8500.00,
      settings: {
        workingHours: {
          monday: { open: '18:00', close: '23:00', isOpen: true },
          tuesday: { open: '18:00', close: '23:00', isOpen: true },
          wednesday: { open: '18:00', close: '23:00', isOpen: true },
          thursday: { open: '18:00', close: '23:00', isOpen: true },
          friday: { open: '18:00', close: '24:00', isOpen: true },
          saturday: { open: '18:00', close: '24:00', isOpen: true },
          sunday: { open: '18:00', close: '23:00', isOpen: true },
        },
        deliveryAreas: [
          { id: '1', name: 'Centro', fee: 3.00 },
          { id: '2', name: 'Bairro Norte', fee: 5.00 },
        ],
        paymentMethods: ['Dinheiro', 'PIX', 'Cartão de Débito', 'Cartão de Crédito'],
        minimumOrder: 25.00,
        isOpen: true,
      },
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'tenant-2',
      name: 'Pizza Express',
      slug: 'pizza-express',
      phone: '(11) 88888-8888',
      address: 'Av. Principal, 456 - Vila Nova',
      isActive: false,
      usersCount: 2,
      monthlyRevenue: 3950.00,
      settings: {
        workingHours: {
          monday: { open: '19:00', close: '23:00', isOpen: true },
          tuesday: { open: '19:00', close: '23:00', isOpen: true },
          wednesday: { open: '19:00', close: '23:00', isOpen: true },
          thursday: { open: '19:00', close: '23:00', isOpen: true },
          friday: { open: '19:00', close: '24:00', isOpen: true },
          saturday: { open: '19:00', close: '24:00', isOpen: true },
          sunday: { open: '19:00', close: '23:00', isOpen: false },
        },
        deliveryAreas: [
          { id: '1', name: 'Vila Nova', fee: 4.00 },
        ],
        paymentMethods: ['PIX', 'Cartão de Crédito'],
        minimumOrder: 30.00,
        isOpen: false,
      },
      createdAt: '2024-02-01T14:30:00Z',
    },
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: '2',
      email: 'bellavista@admin.com',
      name: 'João Silva',
      role: 'admin',
      tenantId: 'tenant-1',
      isActive: true,
      createdAt: '2024-01-15T00:00:00Z',
      lastLogin: '2024-06-23T18:30:00Z',
    },
    {
      id: '3',
      email: 'bellavista@atendente.com',
      name: 'Maria Santos',
      role: 'attendant',
      tenantId: 'tenant-1',
      isActive: true,
      createdAt: '2024-02-01T00:00:00Z',
      lastLogin: '2024-06-24T09:15:00Z',
    },
    {
      id: '4',
      email: 'express@admin.com',
      name: 'Carlos Oliveira',
      role: 'admin',
      tenantId: 'tenant-2',
      isActive: true,
      createdAt: '2024-02-01T00:00:00Z',
      lastLogin: '2024-06-20T16:45:00Z',
    },
    {
      id: '5',
      email: 'express@atendente.com',
      name: 'Ana Costa',
      role: 'attendant',
      tenantId: 'tenant-2',
      isActive: false,
      createdAt: '2024-03-01T00:00:00Z',
      lastLogin: '2024-06-10T14:20:00Z',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('all');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [tenantModalOpen, setTenantModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit'>('create');
  const [tenantModalMode, setTenantModalMode] = useState<'create' | 'edit'>('create');

  // Handlers para usuários
  const handleCreateUser = () => {
    setSelectedUser(null);
    setUserModalMode('create');
    setUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserModalMode('edit');
    setUserModalOpen(true);
  };

  const handleSaveUser = (userData: Partial<User> & { password?: string }) => {
    if (userModalMode === 'create') {
      const newUser: User = {
        id: userData.id || `user-${Date.now()}`,
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || 'attendant',
        tenantId: userData.tenantId,
        isActive: userData.isActive ?? true,
        createdAt: userData.createdAt || new Date().toISOString(),
      };

      // Adicionar usuário ao contexto de autenticação
      addUser(newUser, userData.password || 'admin123');
      
      // Adicionar à lista local
      setUsers([...users, newUser]);
      
      // Atualizar contagem de usuários do tenant
      if (userData.tenantId) {
        setTenants(tenants.map(t => 
          t.id === userData.tenantId 
            ? { ...t, usersCount: (t.usersCount || 0) + 1 }
            : t
        ));
      }
    } else {
      const updatedUser: User = {
        id: userData.id || '',
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || 'attendant',
        tenantId: userData.tenantId,
        isActive: userData.isActive ?? true,
        createdAt: userData.createdAt || new Date().toISOString(),
        lastLogin: users.find(u => u.id === userData.id)?.lastLogin,
      };

      // Atualizar usuário no contexto de autenticação
      updateUser(updatedUser);
      
      // Atualizar na lista local
      setUsers(users.map(u => u.id === userData.id ? updatedUser : u));
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      const userToDelete = users.find(u => u.id === userId);
      
      // Remover do contexto de autenticação
      removeUser(userId);
      
      // Remover da lista local
      setUsers(users.filter(u => u.id !== userId));
      
      // Atualizar contagem de usuários do tenant
      if (userToDelete?.tenantId) {
        setTenants(tenants.map(t => 
          t.id === userToDelete.tenantId 
            ? { ...t, usersCount: Math.max((t.usersCount || 0) - 1, 0) }
            : t
        ));
      }
    }
  };

  // Handlers para estabelecimentos
  const handleCreateTenant = () => {
    setSelectedTenant(null);
    setTenantModalMode('create');
    setTenantModalOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setTenantModalMode('edit');
    setTenantModalOpen(true);
  };

  const handleSaveTenant = (tenantData: Partial<Tenant>) => {
    if (tenantModalMode === 'create') {
      setTenants([...tenants, tenantData as Tenant]);
    } else {
      setTenants(tenants.map(t => t.id === tenantData.id ? { ...t, ...tenantData } : t));
    }
  };

  const handleDeleteTenant = (tenantId: string) => {
    if (confirm('Tem certeza que deseja excluir este estabelecimento? Todos os usuários associados também serão removidos.')) {
      setTenants(tenants.filter(t => t.id !== tenantId));
      setUsers(users.filter(u => u.tenantId !== tenantId));
    }
  };

  const handleToggleTenantStatus = (tenantId: string) => {
    setTenants(tenants.map(t => 
      t.id === tenantId ? { ...t, isActive: !t.isActive } : t
    ));
  };

  // Filtros e cálculos
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTenant = selectedTenantFilter === 'all' || user.tenantId === selectedTenantFilter;
    return matchesSearch && matchesTenant;
  });

  const getTenantName = (tenantId: string) => {
    return tenants.find(t => t.id === tenantId)?.name || 'N/A';
  };

  const totalRevenue = tenants.reduce((sum, tenant) => sum + (tenant.monthlyRevenue || 0), 0);
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const activeTenants = tenants.filter(t => t.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Super Administração</h2>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="tenants">Estabelecimentos</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Estabelecimentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{tenants.length}</div>
                  <p className="text-sm text-muted-foreground">
                    {activeTenants} ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Total de Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{totalUsers}</div>
                  <p className="text-sm text-muted-foreground">
                    {activeUsers} ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Taxa de Atividade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Usuários ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Receita Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receita mensal estimada
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Resumo por estabelecimento */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo por Estabelecimento</CardTitle>
                <CardDescription>
                  Faturamento e estatísticas de cada estabelecimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-semibold">{tenant.name}</h4>
                          <p className="text-sm text-muted-foreground">{tenant.address}</p>
                        </div>
                        <Badge variant={tenant.isActive ? "default" : "destructive"}>
                          {tenant.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          R$ {(tenant.monthlyRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {tenant.usersCount || 0} usuários
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tenants">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Gerenciar Estabelecimentos</h3>
                <Button onClick={handleCreateTenant}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Estabelecimento
                </Button>
              </div>

              <div className="space-y-4">
                {tenants.map((tenant) => (
                  <Card key={tenant.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{tenant.name}</CardTitle>
                          <CardDescription>
                            Criado em {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={tenant.isActive ? "default" : "destructive"}>
                            {tenant.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Informações Básicas</h4>
                          <div className="text-sm space-y-1">
                            <p><strong>Slug:</strong> {tenant.slug}</p>
                            <p><strong>Telefone:</strong> {tenant.phone}</p>
                            <p><strong>Endereço:</strong> {tenant.address}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Estatísticas</h4>
                          <div className="text-sm space-y-1">
                            <p><strong>Usuários:</strong> {tenant.usersCount}</p>
                            <p><strong>Receita Mensal:</strong> R$ {tenant.monthlyRevenue?.toFixed(2)}</p>
                            <p><strong>Pedido Mínimo:</strong> R$ {tenant.settings.minimumOrder.toFixed(2)}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Configurações</h4>
                          <div className="text-sm space-y-1">
                            <p><strong>Status:</strong> {tenant.settings.isOpen ? 'Aberto' : 'Fechado'}</p>
                            <p><strong>Áreas de Entrega:</strong> {tenant.settings.deliveryAreas.length}</p>
                            <p><strong>Formas de Pagamento:</strong> {tenant.settings.paymentMethods.length}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Ações</h4>
                          <div className="space-y-2">
                            <Button 
                              variant={tenant.isActive ? "destructive" : "default"} 
                              className="w-full" 
                              size="sm"
                              onClick={() => handleToggleTenantStatus(tenant.id)}
                            >
                              {tenant.isActive ? "Desativar" : "Ativar"}
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full" 
                              size="sm"
                              onClick={() => handleEditTenant(tenant)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="w-full" 
                              size="sm"
                              onClick={() => handleDeleteTenant(tenant.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Buscar usuários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-80"
                    />
                  </div>
                  <Select value={selectedTenantFilter} onValueChange={setSelectedTenantFilter}>
                    <SelectTrigger className="w-60">
                      <SelectValue placeholder="Filtrar por estabelecimento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os estabelecimentos</SelectItem>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateUser}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Usuários</CardTitle>
                  <CardDescription>
                    Gerencie os usuários de todas as pizzarias do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Estabelecimento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Último Login</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role === 'admin' ? 'Administrador' : 'Atendente'}
                            </Badge>
                          </TableCell>
                          <TableCell>{getTenantName(user.tenantId || '')}</TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? 'default' : 'destructive'}>
                              {user.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.lastLogin ? 
                              new Date(user.lastLogin).toLocaleDateString('pt-BR') : 
                              'Nunca'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <UserModal
          isOpen={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          onSave={handleSaveUser}
          user={selectedUser}
          tenants={tenants}
          mode={userModalMode}
        />

        <TenantModal
          isOpen={tenantModalOpen}
          onClose={() => setTenantModalOpen(false)}
          onSave={handleSaveTenant}
          tenant={selectedTenant}
          mode={tenantModalMode}
        />
      </main>
    </div>
  );
}
