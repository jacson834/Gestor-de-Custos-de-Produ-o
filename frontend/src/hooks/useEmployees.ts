// src/hooks/useEmployees.ts

import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";

// Interface Employee (copiada do Employees.tsx)
interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string; // Formato YYYY-MM-DD
  status: "active" | "inactive";
}

export const useEmployees = () => {
  const API_BASE_URL = 'http://localhost:3001/api';
  const { toast } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar todos os funcionários
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/employees`);
      if (!response.ok) {
        throw new Error("Falha ao carregar dados de funcionários.");
      }
      const data = await response.json();
      if (data.data) {
        // Garante a tipagem correta dos números
        const parsedEmployees: Employee[] = data.data.map((emp: any) => ({
          ...emp,
          id: Number(emp.id),
          salary: Number(emp.salary),
          // Se hireDate vier como DATETIME do DB, pode precisar de formatação aqui se necessário para input type="date"
          hireDate: emp.hireDate ? emp.hireDate.split('T')[0] : '' // Assegura YYYY-MM-DD
        }));
        setEmployees(parsedEmployees);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro de Sincronização",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, toast]);

  // Efeito para carregar funcionários na montagem do componente
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Função para adicionar um novo funcionário
  const addEmployee = async (employeeData: Omit<Employee, 'id' | 'status'>) => {
    setIsLoading(true);
    try {
      const payload = {
        ...employeeData,
        salary: Number(employeeData.salary), // Garante que salário seja número
        status: "active" // Status padrão ao criar
      };
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao cadastrar funcionário.");
      }

      toast({ title: "Sucesso", description: "Funcionário cadastrado com sucesso!" });
      fetchEmployees(); // Recarrega a lista após a adição
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao Cadastrar", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar um funcionário existente
  const updateEmployee = async (employeeId: number, employeeData: Omit<Employee, 'id'>) => {
    setIsLoading(true);
    try {
      const payload = {
        ...employeeData,
        salary: Number(employeeData.salary), // Garante que salário seja número
      };
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao atualizar funcionário.");
      }

      toast({ title: "Sucesso", description: "Funcionário atualizado com sucesso!" });
      fetchEmployees(); // Recarrega a lista após a atualização
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao Atualizar", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para alterar o status de um funcionário
  const toggleEmployeeStatus = async (employeeId: number, currentStatus: "active" | "inactive") => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    if (!window.confirm(`Tem certeza que deseja ${newStatus === 'inactive' ? 'desativar' : 'ativar'} este funcionário?`)) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao alterar status.");
      }

      toast({ title: "Status Alterado", description: `Funcionário agora está ${newStatus === 'active' ? 'ativo' : 'inativo'}.` });
      fetchEmployees(); // Recarrega a lista
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao Alterar Status", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para deletar um funcionário
  const deleteEmployee = async (employeeId: number) => {
    if (!window.confirm("Tem certeza que deseja deletar este funcionário permanentemente?")) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao deletar funcionário.");
      }

      toast({ variant: "destructive", title: "Funcionário Deletado", description: "Funcionário removido do sistema." });
      fetchEmployees(); // Recarrega a lista
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao Deletar", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Retorna os estados e as funções para o componente
  return {
    employees,
    isLoading,
    addEmployee,
    updateEmployee,
    toggleEmployeeStatus,
    deleteEmployee,
    fetchEmployees, // Exporta a função de recarregamento caso precise
  };
};