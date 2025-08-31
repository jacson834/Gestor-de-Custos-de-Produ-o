import { useState, useEffect, useCallback } from 'react';
import { Recipe } from '@/types/production';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from './use-toast';

const STORAGE_KEY = 'recipes';

export const useRecipes = () => {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedRecipes = localStorage.getItem(STORAGE_KEY);
      if (storedRecipes) {
        setRecipes(JSON.parse(storedRecipes));
      }
    } catch (error) {
      console.error("Failed to load recipes from localStorage", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as receitas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const saveData = useCallback((data: Recipe[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save recipes to localStorage", error);
      toast({
        title: "Erro ao salvar dados",
        description: "Não foi possível salvar as receitas.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const addRecipe = (recipe: Recipe) => {
    const updatedRecipes = [...recipes, recipe];
    setRecipes(updatedRecipes);
    saveData(updatedRecipes);
    toast({ title: "Receita adicionada", description: `"${recipe.name}" foi adicionada com sucesso.` });
  };

  const updateRecipe = (updatedRecipe: Recipe) => {
    const updatedRecipes = recipes.map(r =>
      r.id === updatedRecipe.id ? updatedRecipe : r
    );
    setRecipes(updatedRecipes);
    saveData(updatedRecipes);
    toast({ title: "Receita atualizada", description: `"${updatedRecipe.name}" foi atualizada com sucesso.` });
  };

  const deleteRecipe = (recipeId: string) => {
    const recipeToDelete = recipes.find(r => r.id === recipeId);
    const updatedRecipes = recipes.filter(r => r.id !== recipeId);
    setRecipes(updatedRecipes);
    saveData(updatedRecipes);
    if (recipeToDelete) {
        toast({ title: "Receita removida", description: `"${recipeToDelete.name}" foi removida com sucesso.`, variant: "destructive" });
    }
  };

  return { recipes, isLoading, addRecipe, updateRecipe, deleteRecipe };
};