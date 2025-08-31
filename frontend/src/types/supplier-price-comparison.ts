
export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  deliveryTime: number; // em dias
  isActive: boolean;
}

export interface ProductPrice {
  id: string;
  productId: number;
  productName: string;
  supplierId: string;
  supplierName: string;
  currentPrice: number;
  previousPrice?: number;
  validFrom: string;
  validUntil?: string;
  minimumQuantity: number;
  deliveryTime: number;
  currency: string;
  lastUpdated: string;
}

export interface PriceAlert {
  id: string;
  productId: number;
  productName: string;
  targetPrice: number;
  currentBestPrice: number;
  bestSupplierId: string;
  bestSupplierName: string;
  isActive: boolean;
  createdAt: string;
}

export interface PriceHistory {
  id: string;
  productId: number;
  supplierId: string;
  price: number;
  date: string;
  quantity: number;
}
