// frontend/src/components/production/IngredientForm.tsx
// Formulário para criar/editar ingredientes

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter } from '@/components/ui/dialog';
import { useIngredientsContext, type CreateIngredientData } from '@/contexts/IngredientsContext';
import { toast } from 'sonner';

interface IngredientFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const IngredientForm: React.FC<IngredientFormProps> = ({ onSuccess, onCancel }) => {
  const { createIngredient, ingredients } = useIngredientsContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keepDialogOpen, setKeepDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState<CreateIngredientData>({
    name: '',
    unit: '',
    unit_price: 0,
    supplier_info: ''
  });

  // Sugestões inteligentes de unidades
  const commonUnits = [
    'kg', 'g', 'litro', 'ml', 'unidade', 'pacote', 'caixa', 'lata', 'saco', 'pote'
  ];

  // Sugestões baseadas no nome do ingrediente
  const getUnitSuggestions = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('leite') || lowerName.includes('água') || lowerName.includes('óleo')) {
      return ['litro', 'ml'];
    }
    if (lowerName.includes('açúcar') || lowerName.includes('farinha') || lowerName.includes('sal')) {
      return ['kg', 'g'];
    }
    if (lowerName.includes('ovo') || lowerName.includes('limão') || lowerName.includes('laranja')) {
      return ['unidade'];
    }
    return commonUnits;
  };

  const unitSuggestions = getUnitSuggestions(formData.name);

  // Sugestões de preço baseadas em ingredientes similares
  const getPriceSuggestion = (name: string, unit: string) => {
    if (!name || !unit) return null;
    
    const similarIngredients = ingredients.filter(ing => 
      ing.unit === unit && (
        ing.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(ing.name.toLowerCase())
      )
    );
    
    if (similarIngredients.length > 0) {
      const avgPrice = similarIngredients.reduce((sum, ing) => sum + ing.unit_price, 0) / similarIngredients.length;
      return avgPrice;
    }
    
    return null;
  };

  const suggestedPrice = getPriceSuggestion(formData.name, formData.unit);

  // Atalhos de teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter para salvar e continuar
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      setKeepDialogOpen(true);
      handleSubmit(e as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name.trim()) {
      toast.error('Nome do ingrediente é obrigatório');
      return;
    }
    
    if (!formData.unit.trim()) {
      toast.error('Unidade de medida é obrigatória');
      return;
    }
    
    if (formData.unit_price <= 0) {
      toast.error('Preço unitário deve ser maior que zero');
      return;
    }

    console.log('Enviando dados do ingrediente:', formData);
    setIsSubmitting(true);
    
    try {
      const success = await createIngredient({
        name: formData.name.trim(),
        unit: formData.unit.trim(),
        unit_price: formData.unit_price,
        supplier_info: formData.supplier_info.trim() || undefined
      });
      
      if (success) {
        // Limpar apenas os campos principais, manter fornecedor se útil
        const shouldKeepSupplier = formData.supplier_info.trim().length > 0;
        
        setFormData({
          name: '',
          unit: formData.unit, // Manter unidade para próximo ingrediente similar
          unit_price: 0,
          supplier_info: shouldKeepSupplier ? formData.supplier_info : ''
        });

        // Se checkbox marcado, manter diálogo aberto
        if (!keepDialogOpen) {
          onSuccess();
        } else {
          // Focar no campo nome para próximo ingrediente
          setTimeout(() => {
            const nameInput = document.getElementById('name') as HTMLInputElement;
            nameInput?.focus();
          }, 100);
        }
      }
    } catch (error) {
      console.error('Erro no handleSubmit:', error);
      toast.error('Erro inesperado ao salvar ingrediente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateIngredientData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex-1 space-y-4 max-w-full overflow-y-auto">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Ingrediente *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ex: Leite Integral"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unit">Unidade de Medida *</Label>
          <div className="space-y-2">
            <Input
              id="unit"
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              placeholder="Ex: litro, kg, unidade"
              required
            />
            {/* Sugestões de unidades */}
            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
              {unitSuggestions.slice(0, 8).map((unit) => (
                <Button
                  key={unit}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs flex-shrink-0"
                  onClick={() => handleChange('unit', unit)}
                >
                  {unit}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_price">Preço Unitário (R$) *</Label>
          <div className="space-y-2">
            <Input
              id="unit_price"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.unit_price}
              onChange={(e) => handleChange('unit_price', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              required
            />
            {/* Sugestão de preço */}
            {suggestedPrice && formData.unit_price === 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sugestão baseada em ingredientes similares:</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleChange('unit_price', suggestedPrice)}
                >
                  R$ {suggestedPrice.toFixed(2).replace('.', ',')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier_info">Informações do Fornecedor</Label>
        <Textarea
          id="supplier_info"
          value={formData.supplier_info}
          onChange={(e) => handleChange('supplier_info', e.target.value)}
          placeholder="Nome do fornecedor, contato, observações..."
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Opções avançadas */}
      <div className="space-y-2 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="keep-open"
            checked={keepDialogOpen}
            onChange={(e) => setKeepDialogOpen(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="keep-open" className="text-sm text-muted-foreground">
            Manter diálogo aberto para adicionar mais ingredientes
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          💡 Dica: Use Ctrl+Enter para salvar e continuar rapidamente
        </p>
      </div>

      <DialogFooter className="gap-2 flex-wrap">
        <Button type="button" variant="outline" onClick={onCancel} size="sm">
          Cancelar
        </Button>
        <Button 
          type="button" 
          variant="secondary"
          size="sm"
          onClick={(e) => {
            setKeepDialogOpen(true);
            handleSubmit(e as any);
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : 'Salvar e Continuar'}
        </Button>
        <Button type="submit" disabled={isSubmitting} size="sm">
          {isSubmitting ? 'Salvando...' : 'Salvar e Fechar'}
        </Button>
      </DialogFooter>
      </form>
    </div>
  );
};

export default IngredientForm;