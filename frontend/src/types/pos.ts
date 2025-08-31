
export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  barcode?: string;
  image?: string;
}

export interface SaleItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}
