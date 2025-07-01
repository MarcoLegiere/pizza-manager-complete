import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import Navbar from '@/components/Navbar';

export default function Menu() {
  const [products] = useState<Product[]>([
    {
      id: '1',
      tenantId: 'tenant-1',
      name: 'Pizza Margherita',
      description: 'Molho de tomate, mussarela, manjericão e azeite',
      price: 35.90,
      category: 'Pizzas Tradicionais',
      isAvailable: true,
    },
    {
      id: '2',
      tenantId: 'tenant-1',
      name: 'Pizza Pepperoni',
      description: 'Molho de tomate, mussarela e pepperoni',
      price: 42.90,
      category: 'Pizzas Tradicionais',
      isAvailable: true,
    },
    {
      id: '3',
      tenantId: 'tenant-1',
      name: 'Coca-Cola 2L',
      description: 'Refrigerante Coca-Cola 2 litros',
      price: 8.90,
      category: 'Bebidas',
      isAvailable: false,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search">Buscar produto</Label>
                  <Input
                    id="search"
                    placeholder="Nome ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Categorias</Label>
                  <div className="space-y-2 mt-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total de produtos:</span>
                    <span className="font-medium">{products.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disponíveis:</span>
                    <span className="font-medium text-green-600">
                      {products.filter(p => p.isAvailable).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Indisponíveis:</span>
                    <span className="font-medium text-red-600">
                      {products.filter(p => !p.isAvailable).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {product.category}
                        </Badge>
                      </div>
                      <Badge 
                        variant={product.isAvailable ? "default" : "destructive"}
                        className="ml-2"
                      >
                        {product.isAvailable ? "Disponível" : "Indisponível"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {product.description}
                    </CardDescription>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-600">
                        R$ {product.price.toFixed(2)}
                      </span>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        <Button 
                          variant={product.isAvailable ? "destructive" : "default"} 
                          size="sm"
                        >
                          {product.isAvailable ? "Pausar" : "Ativar"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-gray-500">Nenhum produto encontrado com os filtros aplicados.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
