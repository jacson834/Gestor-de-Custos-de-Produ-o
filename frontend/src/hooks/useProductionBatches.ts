// frontend/src/hooks/useProductionBatches.ts
// Hook para gerenciamento de lotes de produção

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface ProductionBatch {
  id: number;
  recipe_id: number;
  recipe_name: string;
  batch_size: number;
  total_cost: number;
  cost_per_unit: number;
  production_date: string;
  notes?: string;
  yield_unit: string;
}

export interface CreateProductionBatchData {
  recipe_id: number;
  batch_size: number;
  notes?: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

export const useProductionBatches = () => {
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all production batches
  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/production-batches`);
      const data = await response.json();
      
      if (response.ok) {
        setBatches(data.data || []);
      } else {
        throw new Error(data.error || 'Erro ao carregar histórico de produção');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro ao carregar histórico: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new production batch
  const createBatch = async (batchData: CreateProductionBatchData): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/production-batches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Produção registrada com sucesso!');
        await fetchBatches(); // Refresh the list
        return true;
      } else {
        throw new Error(data.error || 'Erro ao registrar produção');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(`Erro ao registrar produção: ${errorMessage}`);
      return false;
    }
  };

  // Get batch details by ID
  const getBatch = async (id: number): Promise<ProductionBatch | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/production-batches/${id}`);
      const data = await response.json();

      if (response.ok) {
        return data.data;
      } else {
        throw new Error(data.error || 'Erro ao carregar detalhes da produção');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(`Erro ao carregar produção: ${errorMessage}`);
      return null;
    }
  };

  // Load batches on mount
  useEffect(() => {
    fetchBatches();
  }, []);

  return {
    batches,
    isLoading,
    error,
    fetchBatches,
    createBatch,
    getBatch,
  };
};