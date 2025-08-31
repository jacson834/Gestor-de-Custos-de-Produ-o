import { useState, useEffect, useCallback } from 'react';
import { RawMaterial } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from './use-toast';

const STORAGE_KEY = 'raw_materials';

export const useRawMaterials = () => {
  const { toast } = useToast();
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedMaterials = localStorage.getItem(STORAGE_KEY);
      if (storedMaterials) {
        setRawMaterials(JSON.parse(storedMaterials));
      }
    } catch (error) {
      console.error("Failed to load raw materials from localStorage", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as matérias-primas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const saveData = useCallback((data: RawMaterial[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save raw materials to localStorage", error);
      toast({
        title: "Erro ao salvar dados",
        description: "Não foi possível salvar as matérias-primas.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const addRawMaterial = (material: Omit<RawMaterial, 'id'>) => {
    const newMaterial = { ...material, id: uuidv4() };
    const updatedMaterials = [...rawMaterials, newMaterial];
    setRawMaterials(updatedMaterials);
    saveData(updatedMaterials);
    toast({ title: "Matéria-prima adicionada", description: `"${newMaterial.name}" foi adicionada com sucesso.` });
  };

  const updateRawMaterial = (updatedMaterial: RawMaterial) => {
    const updatedMaterials = rawMaterials.map(m =>
      m.id === updatedMaterial.id ? updatedMaterial : m
    );
    setRawMaterials(updatedMaterials);
    saveData(updatedMaterials);
    toast({ title: "Matéria-prima atualizada", description: `"${updatedMaterial.name}" foi atualizada com sucesso.` });
  };

  const deleteRawMaterial = (materialId: number | string) => {
    const materialToDelete = rawMaterials.find(m => m.id === materialId);
    const updatedMaterials = rawMaterials.filter(m => m.id !== materialId);
    setRawMaterials(updatedMaterials);
    saveData(updatedMaterials);
    if (materialToDelete) {
        toast({ title: "Matéria-prima removida", description: `"${materialToDelete.name}" foi removida com sucesso.`, variant: "destructive" });
    }
  };

  return { rawMaterials, isLoading, addRawMaterial, updateRawMaterial, deleteRawMaterial };
};