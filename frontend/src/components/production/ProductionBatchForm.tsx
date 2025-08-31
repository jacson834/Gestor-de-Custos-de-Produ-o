// frontend/src/components/production/ProductionBatchForm.tsx
// Formulário para registrar nova produção

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Factory, Calculator } from 'lucide-react';
import { useProductionBatches, type CreateProductionBatchData } from '@/hooks/useProductionBatches';
import { useRecipes } from '@/hooks/useRecipes';

interface ProductionBatchFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductionBatchForm: React.FC<ProductionBatchFormProps> = ({ onSuccess, onCancel }) => {
  const { createBatch } = useProductionBatches();
  const { recipes } = useRecipes();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    recipe_id: 0,
    batch_size: 1,
    notes: ''
  });

  const selectedRecipe = recipes.find(r => r.id === formData.recipe_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recipe_id || formData.batch_size <= 0) {
      return;
    }

    setIsSubmitting(true);
    
    const batchData: CreateProductionBatchData = {
      recipe_id: formData.recipe_id,
      batch_size: formData.batch_size,
      notes: formData.notes || undefined
    };
    
    const success = await createBatch(batchData);
    
    setIsSubmitting(false);
    
    if (success) {
      onSuccess();
    }
  };

  const calculateTotalCost = () => {
    if (!selectedRecipe) return 0;
    return selectedRecipe.cost_per_unit * formData.batch_size;
  };

  const calculateTotalUnits = () => {
    if (!selectedRecipe) return 0;
    return selectedRecipe.yield_quantity * formData.batch_size;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Recipe Selection */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipe_id">Receita *</Label>
          <Select
            value={formData.recipe_id.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, recipe_id: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma receita" />
            </SelectTrigger>
            <SelectContent>
              {recipes.map(recipe => (
                <SelectItem key={recipe.id} value={recipe.id.toString()}>
                  {recipe.name} - {recipe.yield_quantity} {recipe.yield_unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="batch_size">Quantidade de Lotes *</Label>
          <Input
            id="batch_size"
            type="number"
            min="1"
            step="1"
            value={formData.batch_size}
            onChange={(e) => setFormData(prev => ({ ...prev, batch_size: parseInt(e.target.value) || 1 }))}
            placeholder="1"
            required
          />
          {selectedRecipe && (
            <p className="text-sm text-muted-foreground">
              Cada lote produz {selectedRecipe.yield_quantity} {selectedRecipe.yield_unit}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Observações sobre esta produção..."
            rows={3}
          />
        </div>
      </div>

      {/* Production Summary */}
      {selectedRecipe && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Resumo da Produção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Receita Selecionada</p>
                <p className="font-semibold">{selectedRecipe.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedRecipe.ingredients?.length || 0} ingredientes
                </p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total a Produzir</p>
                <p className="font-semibold">
                  {calculateTotalUnits()} {selectedRecipe.yield_unit}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formData.batch_size} lote(s)
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Custo Estimado</p>
                <p className="font-semibold text-green-600">
                  R$ {calculateTotalCost().toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  R$ {selectedRecipe.cost_per_unit.toFixed(2)} por unidade
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || !selectedRecipe}>
          <Factory className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Registrando...' : 'Registrar Produção'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ProductionBatchForm;