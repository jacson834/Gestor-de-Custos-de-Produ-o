
export interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  date: string;
  deliveryDate: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  notes: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  barcode?: string;
  image?: string;
}

export const statusColors: Record<OrderStatus, string> = {
  pending: "bg-gray-500",
  processing: "bg-blue-500",
  shipped: "bg-yellow-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

export const statusLabels: Record<OrderStatus, string> = {
  pending: "Pendente",
  processing: "Processando",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};
