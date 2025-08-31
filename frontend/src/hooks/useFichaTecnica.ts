// src/hooks/useFichaTecnica.ts (Arquivo Novo)

import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { RawMaterial } from '@/types/product';

// Definindo os tipos para nossa Ficha Técnica
export interface IngredienteFichaTecnica {
  id_materia_prima: number | string;
  quantidade: number;
  nome_materia_prima?: string; // Opcional, para exibição
  baseUnit?: string; // Opcional, para exibição
}

export interface FichaTecnica {
  id?: number | string;
  id_produto_venda: number | string;
  nome?: string;
  rendimento: number;
  unidade_rendimento: string;
  ingredientes: IngredienteFichaTecnica[];
}

export const useFichaTecnica = (idProdutoVenda: number | string | null) => {
  const API_BASE_URL = 'http://localhost:3001/api';
  const { toast } = useToast();

  const [ficha, setFicha] = useState<FichaTecnica | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar os dados da ficha técnica no servidor
  const fetchFichaTecnica = useCallback(async () => {
    if (!idProdutoVenda) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/fichas-tecnicas/${idProdutoVenda}`);
      if (!response.ok) throw new Error("Falha ao buscar ficha técnica.");
      
      const result = await response.json();
      if (result.data) {
        setFicha(result.data);
      } else {
        // Se não existir, cria uma ficha técnica vazia no estado local
        setFicha({
          id_produto_venda: idProdutoVenda,
          rendimento: 1,
          unidade_rendimento: 'un',
          ingredientes: [],
        });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [idProdutoVenda, toast]);

  // Executa a busca sempre que o ID do produto mudar
  useEffect(() => {
    fetchFichaTecnica();
  }, [fetchFichaTecnica]);

  // Função para adicionar um ingrediente à lista (apenas no estado local)
  const adicionarIngrediente = (ingrediente: IngredienteFichaTecnica) => {
    setFicha(prevFicha => {
      if (!prevFicha) return null;
      // Evita adicionar o mesmo ingrediente duas vezes
      const existente = prevFicha.ingredientes.find(i => i.id_materia_prima === ingrediente.id_materia_prima);
      if (existente) return prevFicha;
      
      return { ...prevFicha, ingredientes: [...prevFicha.ingredientes, ingrediente] };
    });
  };

  // Função para remover um ingrediente da lista
  const removerIngrediente = (idMateriaPrima: number | string) => {
    setFicha(prevFicha => {
      if (!prevFicha) return null;
      const novosIngredientes = prevFicha.ingredientes.filter(i => i.id_materia_prima !== idMateriaPrima);
      return { ...prevFicha, ingredientes: novosIngredientes };
    });
  };
  
  // Função para atualizar os dados gerais da ficha (nome, rendimento, etc)
  const atualizarFicha = (updates: Partial<FichaTecnica>) => {
    setFicha(prevFicha => prevFicha ? { ...prevFicha, ...updates } : null);
  };

  // Função para salvar a ficha técnica completa no servidor
  const salvarFichaTecnica = async () => {
    if (!ficha) {
      toast({ variant: "destructive", title: "Erro", description: "Não há dados para salvar." });
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/fichas-tecnicas/${ficha.id_produto_venda}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ficha),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Falha ao salvar a ficha técnica.");
      }
      
      toast({ title: "Sucesso", description: "Ficha técnica salva." });
      await fetchFichaTecnica(); // Re-busca os dados para garantir consistência
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao Salvar", description: error.message });
    }
  };

  return {
    ficha,
    isLoading,
    adicionarIngrediente,
    removerIngrediente,
    atualizarFicha,
    salvarFichaTecnica
  };
};