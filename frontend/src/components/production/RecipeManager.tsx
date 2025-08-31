// frontend/src/components/production/RecipeManager.tsx
// Componente para gerenciamento de receitas

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChefHat,
  DollarSign,
  Scale,
  Clock
} from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { useIngredientsContext } from '@/contexts/IngredientsContext';
import RecipeForm from './RecipeForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const RecipeManager: React.FC = () => {
  const { recipes, isLoading, deleteRecipe } = useRecipes();
  const { ingredients } = useIngredientsContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDeleteRecipe = async (id: number) => {
    await deleteRecipe(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <ChefHat className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-muted-foreground">Carregando receitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar receitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Receita</DialogTitle>
              <DialogDescription>
                Crie uma nova receita adicionando ingredientes e definindo o rendimento
              </DialogDescription>
            </DialogHeader>
            <RecipeForm 
              onSuccess={() => setIsCreateDialogOpen(false)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Recipes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">{recipe.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteRecipe(recipe.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {recipe.description && (
                <CardDescription className="text-sm">
                  {recipe.description}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Recipe Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rendimento</p>
                    <p className="font-medium">{recipe.yield_quantity} {recipe.yield_unit}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Custo/Unidade</p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(recipe.cost_per_unit)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Custo Total:</span>
                  <span className="font-semibold">{formatCurrency(recipe.total_cost)}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {recipe.ingredients?.length || 0} ingredientes
                </Badge>
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(recipe.created_at)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecipes.length === 0 && (
        <Card className="p-12 text-center">
          <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhuma receita encontrada' : 'Nenhuma receita cadastrada'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Tente ajustar os termos de busca'
              : 'Comece criando sua primeira receita de produto'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Receita
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default RecipeManager;