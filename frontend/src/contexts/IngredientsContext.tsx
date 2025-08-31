// frontend/src/contexts/IngredientsContext.tsx
// Contexto para compartilhar estado de ingredientes entre componentes

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

interface IngredientsContextType {
  ingredients: Ingredient[];
  isLoading: boolean;
  error: string | null;
  fetchIngredients: () => Promise<void>;
  createIngredient: (data: CreateIngredientData) => Promise<boolean>;
  updateIngredient: (id: number, data: CreateIngredientData) => Promise<boolean>;
  deleteIngredient: (id: number) => Promise<boolean>;
}

const IngredientsContext = createContext<IngredientsContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:3001/api';

export const IngredientsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all ingredients
  const fetchIngredients = async () => {
    console.log('IngredientsContext: Buscando ingredientes...');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/ingredients`);
      console.log('IngredientsContext: Fetch response status:', response.status);
      
      const data = await response.json();
      console.log('IngredientsContext: Fetch data:', data);
      
      if (response.ok) {
        setIngredients(data.data || []);
        console.log('IngredientsContext: Ingredientes carregados:', data.data?.length || 0);
      } else {
        throw new Error(data.error || 'Erro ao carregar ingredientes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('IngredientsContext: Erro ao buscar:', err);
      setError(errorMessage);
      toast.error(`Erro ao carregar ingredientes: ${errorMessage}`);
      setIngredients([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new ingredient
  const createIngredient = async (ingredientData: CreateIngredientData): Promise<boolean> => {
    console.log('IngredientsContext: Criando ingrediente:', ingredientData);
    
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ingredientData),
      });

      console.log('IngredientsContext: Response status:', response.status);
      
      const data = await response.json();
      console.log('IngredientsContext: Response data:', data);

      if (response.ok) {
        toast.success('Ingrediente criado com sucesso!');
        
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
        
        console.log('IngredientsContext: Adicionando ingrediente à lista local:', newIngredient);
        setIngredients(prev => {
          const updated = [...prev, newIngredient];
          console.log('IngredientsContext: Lista atualizada, total:', updated.length);
          return updated;
        });
        
        return true;
      } else {
        const errorMessage = data.error || `Erro HTTP ${response.status}`;
        console.error('IngredientsContext: Erro do servidor:', errorMessage);
        toast.error(`Erro ao criar ingrediente: ${errorMessage}`);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('IngredientsContext: Erro de rede:', err);
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
        // Remove from local list immediately
        setIngredients(prev => prev.filter(ingredient => ingredient.id !== id));
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

  // Load ingredients on mount
  useEffect(() => {
    fetchIngredients();
  }, []);

  const value: IngredientsContextType = {
    ingredients,
    isLoading,
    error,
    fetchIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient,
  };

  return (
    <IngredientsContext.Provider value={value}>
      {children}
    </IngredientsContext.Provider>
  );
};

export const useIngredientsContext = () => {
  const context = useContext(IngredientsContext);
  if (context === undefined) {
    throw new Error('useIngredientsContext must be used within an IngredientsProvider');
  }
  return context;
};