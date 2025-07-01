
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Se o usuário está logado, mostrar o dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-orange-600">🍕 Pizza Manager</CardTitle>
          <CardDescription className="text-lg">
            Sistema de Gerenciamento para Pizzarias
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600">
            Gerencie pedidos, cardápio e clientes de forma simples e eficiente.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full h-12 text-lg">
              <a href="/login">Entrar no Sistema</a>
            </Button>
            <p className="text-sm text-gray-500">
              Faça login para acessar o painel de controle
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
