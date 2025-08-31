
export interface QuoteItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";

export interface Quote {
  id: number;
  customerName: string;
  customerEmail: string;
  customerCnpj: string;
  customerAddress: string;
  customerCity: string;
  customerPhone: string;
  date: string;
  validUntil: string;
  status: QuoteStatus;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  total: number;
  notes: string;
}

export const statusColors: Record<QuoteStatus, string> = {
  draft: "bg-gray-500",
  sent: "bg-blue-500",
  accepted: "bg-green-500",
  rejected: "bg-red-500",
  expired: "bg-orange-500",
  converted: "bg-purple-500",
};

export const statusLabels: Record<QuoteStatus, string> = {
  draft: "Rascunho",
  sent: "Enviado",
  accepted: "Aceito",
  rejected: "Rejeitado",
  expired: "Expirado",
  converted: "Convertido",
};
