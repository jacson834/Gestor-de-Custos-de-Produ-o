// frontend/src/components/production/IngredientManager.tsx
// Componente para gerenciamento de ingredientes

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
  Package,
  DollarSign,
  Scale,
  Truck,
  AlertTriangle
} from 'lucide-react';
import { useIngredientsContext } from '@/contexts/IngredientsContext';
import IngredientForm from './IngredientForm';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const IngredientManager: React.FC = () => {
  const { ingredients, isLoading, deleteIngredient } = useIngredientsContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Log para debug
  console.log('IngredientManager: Re-renderizando com', ingredients.length, 'ingredientes');

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.supplier_info?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDeleteIngredient = async (id: number) => {
    await deleteIngredient(id);
  };

  const getUsageStatus = (usageCount: number = 0) => {
    if (usageCount === 0) {
      return { variant: 'secondary' as const, text: 'Não usado' };
    } else if (usageCount <= 3) {
      return { variant: 'outline' as const, text: `${usageCount} receitas` };
    } else {
      return { variant: 'default' as const, text: `${usageCount} receitas` };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Package className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-muted-foreground">Carregando ingredientes...</p>
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
              placeholder="Buscar ingredientes..."
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
              Novo Ingrediente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[95vh] sm:max-w-lg flex flex-col p-0">
            <DialogHeader className="flex-shrink-0 p-6 pb-4">
              <DialogTitle>Adicionar Novo Ingrediente</DialogTitle>
              <DialogDescription>
                Cadastre um novo ingrediente com preço unitário
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto dialog-scroll px-6 pb-6">
              <IngredientForm 
                onSuccess={() => setIsCreateDialogOpen(false)}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ingredients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lista de Ingredientes
          </CardTitle>
          <CardDescription>
            {filteredIngredients.length} ingredientes encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[60vh] overflow-y-auto dialog-scroll">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Preço Unitário</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIngredients.map((ingredient) => {
                const usageStatus = getUsageStatus(0); // TODO: Implementar contagem de uso
                return (
                  <TableRow key={ingredient.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{ingredient.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <Scale className="h-3 w-3" />
                        {ingredient.unit}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-600">
                          {formatCurrency(ingredient.unit_price)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ingredient.supplier_info ? (
                        <div className="flex items-center gap-1">
                          <Truck className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{ingredient.supplier_info}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Não informado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={usageStatus.variant}>
                        {usageStatus.text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(ingredient.updated_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700"
                              disabled={false} // TODO: Implementar validação de uso
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Confirmar Exclusão
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o ingrediente "{ingredient.name}"? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteIngredient(ingredient.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredIngredients.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum ingrediente encontrado' : 'Nenhum ingrediente cadastrado'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Tente ajustar os termos de busca'
              : 'Comece cadastrando ingredientes para usar nas receitas'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Ingrediente
            </Button>
          )}
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total de Ingredientes</p>
              <p className="text-2xl font-bold">{ingredients.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Preço Médio</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  ingredients.reduce((sum, ing) => sum + ing.unit_price, 0) / ingredients.length || 0
                )}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Com Fornecedor</p>
              <p className="text-2xl font-bold">
                {ingredients.filter(ing => ing.supplier_info).length}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default IngredientManager;