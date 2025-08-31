// src/hooks/useOrders.ts

import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Order, OrderItem, OrderStatus } from "@/types/orders";
import { Product as BackendProduct } from "@/types/product";
import { Customer } from "@/types/product";

export const useOrders = () => {
  const API_BASE_URL = 'http://localhost:3001/api';
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllOrderData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/vendas`),
        fetch(`${API_BASE_URL}/produtos`),
        fetch(`${API_BASE_URL}/clientes`)
      ]);

      if (!ordersRes.ok || !productsRes.ok || !customersRes.ok) {
        throw new Error("Falha ao carregar dados de pedidos, produtos ou clientes.");
      }

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();
      const customersData = await customersRes.json();

      if (ordersData.data) {
        const parsedOrders: Order[] = ordersData.data.map((order: any) => ({
          ...order,
          id: order.id,
          // Mapeamento dos nomes do backend para o frontend
          customerName: order.nome_cliente,
          // customerEmail não vem diretamente de 'vendas', mas pode ser preenchido se buscar o cliente completo
          customerEmail: customersData.data.find((c: any) => c.id === order.id_cliente)?.email || "",
          date: order.data_venda,
          deliveryDate: order.deliveryDate || "",
          status: order.status || "pending",
          items: JSON.parse(order.itens_vendidos || '[]'),
          subtotal: Number(order.subtotal) || 0,
          discount: Number(order.desconto_valor) || 0,
          total: Number(order.total_final) || 0,
          notes: order.observacoes || "",
          // Campo extra para armazenar o ID do cliente do backend
          id_cliente: Number(order.id_cliente)
        }));
        setOrders(parsedOrders);
      }
      
      if (productsData.data) {
          setProducts(productsData.data.map((p: any) => ({ 
              ...p, 
              costPrice: Number(p.costPrice),
              salePrice: Number(p.salePrice),
              stock: Number(p.stock),
              minStock: Number(p.minStock),
              variations: p.variations ? JSON.parse(p.variations) : [],
              priceHistory: p.priceHistory ? JSON.parse(p.priceHistory) : []
          })));
      }

      if (customersData.data) setCustomers(customersData.data);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro de Carregamento",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, toast]);

  useEffect(() => {
    fetchAllOrderData();
  }, [fetchAllOrderData]);

  // Função para adicionar um novo pedido
  const addOrder = async (newOrderData: Omit<Order, 'id' | 'date' | 'status'> & { customerId: number }) => {
    setIsLoading(true);
    try {
      const payload = {
        id_cliente: newOrderData.customerId, // <-- Mapeado para o backend
        nome_cliente: newOrderData.customerName, // <-- Mapeado para o backend
        deliveryDate: newOrderData.deliveryDate,
        itens_vendidos: JSON.stringify(newOrderData.items),
        subtotal: newOrderData.subtotal,
        desconto_valor: newOrderData.discount, // <-- Mapeado para o backend
        total_final: newOrderData.total, // <-- Mapeado para o backend
        observacoes: newOrderData.notes, // <-- Mapeado para o backend
        status: "pending" // O status inicial deve ser enviado
      };

      const response = await fetch(`${API_BASE_URL}/vendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao criar o pedido.");
      }

      toast({ title: "Sucesso", description: "Pedido criado com sucesso!" });
      fetchAllOrderData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao Criar Pedido", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar um pedido existente
  const updateOrder = async (orderId: number, updatedOrderData: Omit<Order, 'id' | 'date'> & { customerId: number }) => {
    setIsLoading(true);
    try {
      const payload = {
        id_cliente: updatedOrderData.customerId, // <-- Mapeado para o backend
        nome_cliente: updatedOrderData.customerName, // <-- Mapeado para o backend
        deliveryDate: updatedOrderData.deliveryDate,
        itens_vendidos: JSON.stringify(updatedOrderData.items),
        subtotal: updatedOrderData.subtotal,
        desconto_valor: updatedOrderData.discount, // <-- Mapeado para o backend
        total_final: updatedOrderData.total, // <-- Mapeado para o backend
        observacoes: updatedOrderData.notes, // <-- Mapeado para o backend
        status: updatedOrderData.status 
      };

      const response = await fetch(`${API_BASE_URL}/vendas/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao atualizar o pedido.");
      }

      toast({ title: "Sucesso", description: "Pedido atualizado com sucesso!" });
      fetchAllOrderData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao Atualizar Pedido", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para deletar um pedido
  const deleteOrder = async (orderId: number) => {
    if (!window.confirm("Tem certeza que deseja remover este pedido?")) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/vendas/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao remover o pedido.");
      }

      toast({ variant: "destructive", title: "Pedido Removido", description: "O pedido foi removido do sistema." });
      fetchAllOrderData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao Remover Pedido", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar o status do pedido
  const updateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    setIsLoading(true);
    try {
        const currentOrder = orders.find(o => o.id === orderId);
        if (!currentOrder) {
            throw new Error("Pedido não encontrado para atualização de status.");
        }

        // Assegura que todos os campos esperados pelo PUT do backend estejam no payload
        // O `currentOrder` já deve ter sido mapeado corretamente na `fetchAllOrderData`
        const backendPayload = {
            id_cliente: (currentOrder as any).id_cliente, 
            nome_cliente: currentOrder.customerName,
            deliveryDate: currentOrder.deliveryDate,
            itens_vendidos: JSON.stringify(currentOrder.items), // json string
            subtotal: currentOrder.subtotal,
            desconto_valor: currentOrder.discount,
            total_final: currentOrder.total,
            observacoes: currentOrder.notes,
            status: newStatus
        };

      const response = await fetch(`${API_BASE_URL}/vendas/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao atualizar status do pedido ${orderId}.`);
      }

      toast({ title: "Status Atualizado", description: `Pedido ${orderId} marcado como ${newStatus}.` });
      fetchAllOrderData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro no Status", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const getProductStock = useCallback((productId: number | string): number => {
    const product = products.find(p => p.id === productId);
    return product ? Number(product.stock) : 0;
  }, [products]);

  const getProductById = useCallback((productId: number | string) => {
    return products.find(p => p.id === productId);
  }, [products]);

  return {
    orders,
    products,
    customers,
    isLoading,
    addOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    getProductStock,
    getProductById
  };
};