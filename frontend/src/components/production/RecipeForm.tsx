// frontend/src/components/production/RecipeForm.tsx
// Formulário para criar/editar receitas

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Package } from 'lucide-react';
import { useRecipes, type CreateRecipeData } from '@/hooks/useRecipes';
import { useIngredientsContext } from '@/contexts/IngredientsContext';

interface RecipeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface RecipeIngredientForm {
  ingredient_id: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onSuccess, onCancel }) => {
  const { createRecipe } = useRecipes();
  const { ingredients } = useIngredientsContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    yield_quantity: 1,
    yield_unit: 'unidades'
  });

  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientForm[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.yield_quantity <= 0 || recipeIngredients.length === 0) {
      return;
    }

    setIsSubmitting(true);
    
    const recipeData: CreateRecipeData = {
      ...formData,
      description: formData.description || undefined,
      ingredients: recipeIngredients.map(ing => ({
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity,
        unit_price: ing.unit_price
      }))
    };
    
    const success = await createRecipe(recipeData);
    
    setIsSubmitting(false);
    
    if (success) {
      onSuccess();
    }
  };

  const addIngredient = () => {
    if (ingredients.length === 0) return;
    
    const firstIngredient = ingredients[0];
    setRecipeIngredients(prev => [...prev, {
      ingredient_id: firstIngredient.id,
      ingredient_name: firstIngredient.name,
      quantity: 1,
      unit: firstIngredient.unit,
      unit_price: firstIngredient.unit_price
    }]);
  };

  const removeIngredient = (index: number) => {
    setRecipeIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredientForm, value: any) => {
    setRecipeIngredients(prev => prev.map((ing, i) => {
      if (i === index) {
        if (field === 'ingredient_id') {
          const selectedIngredient = ingredients.find(ingredient => ingredient.id === value);
          if (selectedIngredient) {
            return {
              ...ing,
              ingredient_id: value,
              ingredient_name: selectedIngredient.name,
              unit: selectedIngredient.unit,
              unit_price: selectedIngredient.unit_price
            };
          }
        }
        return { ...ing, [field]: value };
      }
      return ing;
    }));
  };

  const calculateTotalCost = () => {
    return recipeIngredients.reduce((total, ing) => total + (ing.quantity * ing.unit_price), 0);
  };

  const calculateCostPerUnit = () => {
    const totalCost = calculateTotalCost();
    return formData.yield_quantity > 0 ? totalCost / formData.yield_quantity : 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Recipe Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Receita *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Sorvete de Morango"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descrição da receita..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="yield_quantity">Rendimento *</Label>
            <Input
              id="yield_quantity"
              type="number"
              min="1"
              step="0.1"
              value={formData.yield_quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, yield_quantity: parseFloat(e.target.value) || 1 }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="yield_unit">Unidade *</Label>
            <Input
              id="yield_unit"
              value={formData.yield_unit}
              onChange={(e) => setFormData(prev => ({ ...prev, yield_unit: e.target.value }))}
              placeholder="Ex: unidades, litros"
              required
            />
          </div>
        </div>
      </div>

      {/* Ingredients Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ingredientes
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {recipeIngredients.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhum ingrediente adicionado. Clique em "Adicionar" para começar.
            </p>
          ) : (
            recipeIngredients.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <Label>Ingrediente</Label>
                    <Select
                      value={ingredient.ingredient_id.toString()}
                      onValueChange={(value) => updateIngredient(index, 'ingredient_id', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredients.map(ing => (
                          <SelectItem key={ing.id} value={ing.id.toString()}>
                            {ing.name} ({ing.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label>Custo</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        R$ {(ingredient.quantity * ingredient.unit_price).toFixed(2)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {ingredient.unit}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeIngredient(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Cost Summary */}
      {recipeIngredients.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-lg font-semibold">R$ {calculateTotalCost().toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rendimento</p>
                <p className="text-lg font-semibold">{formData.yield_quantity} {formData.yield_unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Custo por Unidade</p>
                <p className="text-lg font-semibold text-green-600">R$ {calculateCostPerUnit().toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || recipeIngredients.length === 0}>
          {isSubmitting ? 'Salvando...' : 'Salvar Receita'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default RecipeForm;