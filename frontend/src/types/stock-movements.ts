export interface StockMovement {
  id: string;
  productId: number;
  productName: string;
  type: 'entrada' | 'saida';
  category: 'compra' | 'devolucao' | 'venda' | 'perda' | 'transferencia' | 'ajuste';
  quantity: number;
  unitPrice: number;
  totalValue: number;
  batch?: string;
  serial?: string;
  supplier?: string;
  customer?: string;
  reason: string;
  userId: string;
  userName: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  reference?: string;
  validityDate?: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  stock: number;
  stockByLocation?: { [locationId: string]: number };
  costPrice: number;
  salePrice: number;
  barcode: string;
}

export interface MovementFormData {
  type: "entrada" | "saida" | "";
  category: string;
  quantity: string;
  unitPrice: string;
  batch: string;
  serial: string;
  supplier: string;
  customer: string;
  reason: string;
  reference: string;
  validityDate: string;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
}

export interface TransferItem {
  productId: number;
  productName: string;
  quantity: number;
  barcode: string;
}

export interface StockTransfer {
  id: string;
  originLocationId: string;
  destinationLocationId: string;
  originLocationName: string;
  destinationLocationName: string;
  items: TransferItem[];
  transferDate: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  notes?: string;
  createdBy: string;
  trackingCode: string;
}
