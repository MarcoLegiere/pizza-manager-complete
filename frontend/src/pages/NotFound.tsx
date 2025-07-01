
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-700">🍕 Página não encontrada</CardTitle>
          <CardDescription>
            A página que você está procurando não existe.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Verifique o endereço ou volte para o início.
          </p>
          <div className="space-y-2">
            <Button onClick={() => navigate('/')} className="w-full">
              Ir para Dashboard
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Página Inicial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
