// frontend/src/hooks/useIngredients.ts
// Hook para gerenciamento de ingredientes

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  unit_price: number;
  supplier_info?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIngredientData {
  name: string;
  unit: string;
  unit_price: number;
  supplier_info?: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

export const useIngredients = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch all ingredients
  const fetchIngredients = async () => {
    console.log('useIngredients: Buscando ingredientes...');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/ingredients`);
      console.log('useIngredients: Fetch response status:', response.status);
      
      const data = await response.json();
      console.log('useIngredients: Fetch data:', data);
      
      if (response.ok) {
        setIngredients(data.data || []);
        console.log('useIngredients: Ingredientes carregados:', data.data?.length || 0);
      } else {
        throw new Error(data.error || 'Erro ao carregar ingredientes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('useIngredients: Erro ao buscar:', err);
      setError(errorMessage);
      toast.error(`Erro ao carregar ingredientes: ${errorMessage}`);
      // Em caso de erro, manter ingredientes vazios mas não quebrar a interface
      setIngredients([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new ingredient
  const createIngredient = async (ingredientData: CreateIngredientData): Promise<boolean> => {
    console.log('useIngredients: Criando ingrediente:', ingredientData);
    
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ingredientData),
      });

      console.log('useIngredients: Response status:', response.status);
      
      const data = await response.json();
      console.log('useIngredients: Response data:', data);

      if (response.ok) {
        toast.success('Ingrediente criado com sucesso!');
        console.log('useIngredients: Fazendo refresh da lista...');
        
        // Adicionar o novo ingrediente à lista local imediatamente
        const newIngredient: Ingredient = {
          id: data.id,
          name: ingredientData.name,
          unit: ingredientData.unit,
          unit_price: ingredientData.unit_price,
          supplier_info: ingredientData.supplier_info,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setIngredients(prev => [...prev, newIngredient]);
        
        // Também fazer fetch para garantir sincronização
        setTimeout(() => {
          fetchIngredients();
        }, 100);
        
        console.log('useIngredients: Lista atualizada localmente');
        return true;
      } else {
        const errorMessage = data.error || `Erro HTTP ${response.status}`;
        console.error('useIngredients: Erro do servidor:', errorMessage);
        toast.error(`Erro ao criar ingrediente: ${errorMessage}`);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('useIngredients: Erro de rede:', err);
      toast.error(`Erro de conexão: ${errorMessage}`);
      return false;
    }
  };

  // Update ingredient
  const updateIngredient = async (id: number, ingredientData: CreateIngredientData): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ingredientData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Ingrediente atualizado com sucesso!');
        await fetchIngredients(); // Refresh the list
        return true;
      } else {
        throw new Error(data.error || 'Erro ao atualizar ingrediente');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(`Erro ao atualizar ingrediente: ${errorMessage}`);
      return false;
    }
  };

  // Delete ingredient
  const deleteIngredient = async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Ingrediente excluído com sucesso!');
        await fetchIngredients(); // Refresh the list
        return true;
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir ingrediente');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(`Erro ao excluir ingrediente: ${errorMessage}`);
      return false;
    }
  };

  // Load ingredients on mount and when refreshKey changes
  useEffect(() => {
    fetchIngredients();
  }, [refreshKey]);

  return {
    ingredients,
    isLoading,
    error,
    fetchIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient,
  };
};