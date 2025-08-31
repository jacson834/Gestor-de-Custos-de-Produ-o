// src/hooks/useDelivery.ts

import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Customer } from "@/types/product"; // Importa Customer, pois será necessário para a seleção na entrega

// Re-definir as interfaces aqui para o hook, ou importá-las se você criar um arquivo de tipos específico para delivery
interface DeliveryZone {
  id: number;
  name: string;
  districts: string[]; // No backend será string JSON
  deliveryFee: number;
  estimatedTime: string;
  active: boolean;
}

interface DeliveryDriver {
  id: number;
  name: string;
  phone: string;
  vehicle: string;
  vehiclePlate: string;
  status: "available" | "busy" | "offline";
  currentDeliveries: number;
  totalDeliveries: number;
  rating: number;
}

interface Delivery {
  id: number;
  orderId: number;
  customerName: string;
  customerPhone: string;
  address: string;
  district: string;
  zoneId: number;
  driverId?: number;
  driverName?: string;
  status: "pending" | "assigned" | "picked_up" | "in_transit" | "delivered" | "cancelled";
  orderTime: string; // DATETIME
  estimatedDeliveryTime: string; // DATETIME
  actualDeliveryTime?: string; // DATETIME
  deliveryFee: number;
  notes: string;
  priority: "low" | "normal" | "high" | "urgent";
}

export const useDelivery = () => {
  const API_BASE_URL = 'http://localhost:3001/api';
  const { toast } = useToast();

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]); // Novo estado para clientes
  const [isLoading, setIsLoading] = useState(true);

  // --- Função para buscar todos os dados de Delivery e Clientes ---
  const fetchAllDeliveryData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [zonesRes, driversRes, deliveriesRes, customersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/delivery-zones`),
        fetch(`${API_BASE_URL}/delivery-drivers`),
        fetch(`${API_BASE_URL}/deliveries`),
        fetch(`${API_BASE_URL}/clientes`) // Busca clientes também
      ]);

      if (!zonesRes.ok || !driversRes.ok || !deliveriesRes.ok || !customersRes.ok) {
        throw new Error("Falha ao carregar dados de delivery ou clientes.");
      }

      const zonesData = await zonesRes.json();
      const driversData = await driversRes.json();
      const deliveriesData = await deliveriesRes.json();
      const customersData = await customersRes.json(); // Dados dos clientes

      if (zonesData.data) {
        // Mapeia districts de string JSON para array
        const parsedZones = zonesData.data.map((zone: any) => ({
          ...zone,
          districts: JSON.parse(zone.districts || '[]'),
          active: Boolean(zone.active)
        }));
        setZones(parsedZones);
      }
      if (driversData.data) {
        // Converte currentDeliveries, totalDeliveries, rating para números
        const parsedDrivers = driversData.data.map((driver: any) => ({
          ...driver,
          currentDeliveries: Number(driver.currentDeliveries),
          totalDeliveries: Number(driver.totalDeliveries),
          rating: Number(driver.rating)
        }));
        setDrivers(parsedDrivers);
      }
      if (deliveriesData.data) {
        // Converte orderId, zoneId, driverId, deliveryFee para números
        const parsedDeliveries = deliveriesData.data.map((delivery: any) => ({
          ...delivery,
          id: Number(delivery.id), // Garante que o ID é número
          orderId: Number(delivery.orderId),
          zoneId: Number(delivery.zoneId),
          driverId: Number(delivery.driverId) || undefined, // Pode ser null no DB, mapeia para undefined
          deliveryFee: Number(delivery.deliveryFee),
          orderTime: delivery.orderTime,
          estimatedDeliveryTime: delivery.estimatedDeliveryTime,
          actualDeliveryTime: delivery.actualDeliveryTime || undefined
        }));
        setDeliveries(parsedDeliveries);
      }
      if (customersData.data) {
        setCustomers(customersData.data); // Define os clientes
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

  useEffect(() => {
    fetchAllDeliveryData();
  }, [fetchAllDeliveryData]);

  // --- Funções de CRUD para Zonas de Entrega ---
  const addZone = async (zoneData: Omit<DeliveryZone, 'id' | 'active'> & { districts: string }) => {
    setIsLoading(true);
    try {
      const payload = {
        name: zoneData.name,
        districts: zoneData.districts.split(',').map(d => d.trim()), // Converte string de bairros para array
        deliveryFee: Number(zoneData.deliveryFee),
        estimatedTime: zoneData.estimatedTime,
        active: true // Sempre ativa ao criar
      };
      const response = await fetch(`${API_BASE_URL}/delivery-zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Falha ao adicionar zona."); }
      toast({ title: "Sucesso", description: "Zona de entrega adicionada." });
      fetchAllDeliveryData();
    } catch (error: any) { toast({ variant: "destructive", title: "Erro ao adicionar zona", description: error.message }); } // Mensagem de erro mais específica
    finally { setIsLoading(false); }
  };

  const updateZone = async (zoneId: number, zoneData: Omit<DeliveryZone, 'id'> & { districts: string }) => {
    setIsLoading(true);
    try {
      const payload = {
        name: zoneData.name,
        districts: zoneData.districts.split(',').map(d => d.trim()),
        deliveryFee: Number(zoneData.deliveryFee),
        estimatedTime: zoneData.estimatedTime,
        active: zoneData.active
      };
      const response = await fetch(`${API_BASE_URL}/delivery-zones/${zoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Falha ao atualizar zona."); }
      toast({ title: "Sucesso", description: "Zona de entrega atualizada." });
      fetchAllDeliveryData();
    } catch (error: any) { toast({ variant: "destructive", title: "Erro ao atualizar zona", description: error.message }); } // Mensagem de erro mais específica
    finally { setIsLoading(false); }
  };

  const deleteZone = async (zoneId: number) => {
    if (!window.confirm("Tem certeza que deseja deletar esta zona de entrega?")) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/delivery-zones/${zoneId}`, { method: 'DELETE' });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Falha ao deletar zona."); }
      toast({ variant: "destructive", title: "Zona Deletada", description: "Zona de entrega removida." });
      fetchAllDeliveryData();
    } catch (error: any) { toast({ variant: "destructive", title: "Erro ao deletar zona", description: error.message }); } // Mensagem de erro mais específica
    finally { setIsLoading(false); }
  };

  // --- Funções de CRUD para Entregadores ---
  const addDriver = async (driverData: Omit<DeliveryDriver, 'id' | 'status' | 'currentDeliveries' | 'totalDeliveries' | 'rating'>) => {
    setIsLoading(true);
    try {
      const payload = {
        ...driverData,
        status: "available", // Status padrão ao criar
        currentDeliveries: 0,
        totalDeliveries: 0,
        rating: 5.0
      };
      const response = await fetch(`${API_BASE_URL}/delivery-drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Falha ao adicionar entregador."); }
      toast({ title: "Sucesso", description: "Entregador adicionado." });
      fetchAllDeliveryData();
    } catch (error: any) { toast({ variant: "destructive", title: "Erro ao adicionar entregador", description: error.message }); }
    finally { setIsLoading(false); }
  };

  const updateDriver = async (driverId: number, driverData: Omit<DeliveryDriver, 'id' | 'currentDeliveries' | 'totalDeliveries' | 'rating'>) => {
    setIsLoading(true);
    try {
      const payload = {
        name: driverData.name,
        phone: driverData.phone,
        vehicle: driverData.vehicle,
        vehiclePlate: driverData.vehiclePlate,
        status: driverData.status // Status pode ser alterado
      };
      const response = await fetch(`${API_BASE_URL}/delivery-drivers/${driverId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Falha ao atualizar entregador."); }
      toast({ title: "Sucesso", description: "Entregador atualizado." });
      fetchAllDeliveryData();
    } catch (error: any) { toast({ variant: "destructive", title: "Erro ao atualizar entregador", description: error.message }); }
    finally { setIsLoading(false); }
  };

  const deleteDriver = async (driverId: number) => {
    if (!window.confirm("Tem certeza que deseja deletar este entregador?")) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/delivery-drivers/${driverId}`, { method: 'DELETE' });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Falha ao deletar entregador."); }
      toast({ variant: "destructive", title: "Entregador Deletado", description: "Entregador removido." });
      fetchAllDeliveryData();
    } catch (error: any) { toast({ variant: "destructive", title: "Erro ao deletar entregador", description: error.message }); }
    finally { setIsLoading(false); }
  };

  // --- Funções de CRUD para Entregas ---
  const addDelivery = async (deliveryData: Omit<Delivery, 'id' | 'orderTime' | 'actualDeliveryTime' | 'deliveryFee' | 'driverName' | 'status'> & { deliveryFee: number, status?: Delivery['status'], customerId: number }) => {
    setIsLoading(true);
    try {
        const selectedCustomer = customers.find(c => c.id === deliveryData.customerId);
        const customerName = selectedCustomer ? selectedCustomer.name : deliveryData.customerName;
        const customerPhone = selectedCustomer ? selectedCustomer.phone : deliveryData.customerPhone;
        const address = selectedCustomer ? selectedCustomer.address : deliveryData.address;
        const district = selectedCustomer ? selectedCustomer.city : deliveryData.district; // Usando city do cliente como district
        const deliveryZone = zones.find(z => z.id === deliveryData.zoneId);
        const deliveryFee = deliveryZone ? deliveryZone.deliveryFee : 0; // Pega taxa da zona

      const payload = {
        orderId: Number(deliveryData.orderId),
        customerName: customerName,
        customerPhone: customerPhone,
        address: address,
        district: district,
        zoneId: Number(deliveryData.zoneId),
        estimatedDeliveryTime: deliveryData.estimatedDeliveryTime,
        deliveryFee: Number(deliveryFee), // Taxa da zona de entrega
        notes: deliveryData.notes,
        priority: deliveryData.priority,
        status: deliveryData.status || 'pending'
      };
      const response = await fetch(`${API_BASE_URL}/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Falha ao adicionar entrega."); }
      toast({ title: "Sucesso", description: "Entrega adicionada." });
      fetchAllDeliveryData();
    } catch (error: any) { toast({ variant: "destructive", title: "Erro ao adicionar entrega", description: error.message }); }
    finally { setIsLoading(false); }
  };

  const updateDelivery = async (deliveryId: number, deliveryData: Omit<Delivery, 'id' | 'orderTime' | 'actualDeliveryTime' | 'driverName' | 'status'> & { status?: Delivery['status'], customerId?: number }) => {
    setIsLoading(true);
    try {
      const currentDelivery = deliveries.find(d => d.id === deliveryId);
      if (!currentDelivery) throw new Error("Entrega não encontrada para atualização.");

      // Se um customerId for fornecido para atualização, use os dados do cliente
      let updatedCustomerName = deliveryData.customerName || currentDelivery.customerName;
      let updatedCustomerPhone = deliveryData.customerPhone || currentDelivery.customerPhone;
      let updatedAddress = deliveryData.address || currentDelivery.address;
      let updatedDistrict = deliveryData.district || currentDelivery.district;
      
      if (deliveryData.customerId) {
        const selectedCustomer = customers.find(c => c.id === deliveryData.customerId);
        if (selectedCustomer) {
            updatedCustomerName = selectedCustomer.name;
            updatedCustomerPhone = selectedCustomer.phone || "";
            updatedAddress = selectedCustomer.address || "";
            updatedDistrict = selectedCustomer.city || ""; // Usando city do cliente como district
        }
      }

      const deliveryZone = zones.find(z => z.id === (Number(deliveryData.zoneId) || currentDelivery.zoneId));
      const updatedDeliveryFee = deliveryZone ? deliveryZone.deliveryFee : (deliveryData.deliveryFee || currentDelivery.deliveryFee);

      const payload = {
        orderId: Number(deliveryData.orderId || currentDelivery.orderId),
        customerName: updatedCustomerName,
        customerPhone: updatedCustomerPhone,
        address: updatedAddress,
        district: updatedDistrict,
        zoneId: Number(deliveryData.zoneId || currentDelivery.zoneId),
        driverId: Number(deliveryData.driverId || currentDelivery.driverId) || null,
        driverName: deliveryData.driverName || currentDelivery.driverName || null,
        status: deliveryData.status || currentDelivery.status,
        orderTime: currentDelivery.orderTime,
        estimatedDeliveryTime: deliveryData.estimatedDeliveryTime || currentDelivery.estimatedDeliveryTime,
        actualDeliveryTime: deliveryData.actualDeliveryTime || currentDelivery.actualDeliveryTime || null,
        deliveryFee: updatedDeliveryFee,
        notes: deliveryData.notes || currentDelivery.notes,
        priority: deliveryData.priority || currentDelivery.priority,
      };

      const response = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Falha ao atualizar entrega."); }
      toast({ title: "Sucesso", description: "Entrega atualizada." });
      fetchAllDeliveryData();
    } catch (error: any) { toast({ variant: "destructive", title: "Erro ao atualizar entrega", description: error.message }); }
    finally { setIsLoading(false); }
  };

  const deleteDelivery = async (deliveryId: number) => {
    if (!window.confirm("Tem certeza que deseja deletar esta entrega?")) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}`, { method: 'DELETE' });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Falha ao deletar entrega."); }
      toast({ variant: "destructive", title: "Entrega Deletada", description: "Entrega removida." });
      fetchAllDeliveryData();
    } catch (error: any) { toast({ variant: "destructive", title: "Erro ao deletar entrega", description: error.message }); }
    finally { setIsLoading(false); }
  };

  const assignDeliveryDriver = async (deliveryId: number, driverId: number, status: Delivery['status']) => {
    setIsLoading(true);
    try {
      const driver = drivers.find(d => d.id === driverId);
      if (!driver) throw new Error("Entregador não encontrado.");

      const payload = {
        driverId: driver.id,
        driverName: driver.name,
        status: status // Pode ser "assigned"
      };
      const response = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}/assign-driver`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Falha ao atribuir entregador."); }
      toast({ title: "Sucesso", description: "Entregador atribuído à entrega." });
      fetchAllDeliveryData();
    } catch (error: any) { toast({ variant: "destructive", title: "Erro ao atribuir entregador", description: error.message }); }
    finally { setIsLoading(false); }
  };

  const updateDeliveryStatus = async (deliveryId: number, status: Delivery['status'], driverId?: number) => {
    setIsLoading(true);
    try {
      const payload = { status, driverId };
      const response = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Falha ao atualizar status da entrega."); }
      toast({ title: "Sucesso", description: "Status da entrega atualizado." });
      fetchAllDeliveryData();
    } catch (error: any) { toast({ variant: "destructive", title: "Erro ao atualizar status", description: error.message }); }
    finally { setIsLoading(false); }
  };


  return {
    zones, drivers, deliveries, customers, isLoading, // Customers também é retornado
    addZone, updateZone, deleteZone,
    addDriver, updateDriver, deleteDriver,
    addDelivery, updateDelivery, deleteDelivery,
    assignDeliveryDriver, updateDeliveryStatus,
    fetchAllDeliveryData // Exporta a função de recarregamento
  };
};