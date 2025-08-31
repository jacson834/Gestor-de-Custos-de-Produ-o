// src/types/delivery.ts

export interface DeliveryZone {
  id: number;
  name: string;
  districts: string[];
  deliveryFee: number;
  estimatedTime: string;
  active: boolean;
}

export interface DeliveryDriver {
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

export interface Delivery {
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
  orderTime: string;
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  deliveryFee: number;
  notes: string;
  priority: "low" | "normal" | "high" | "urgent";
}

