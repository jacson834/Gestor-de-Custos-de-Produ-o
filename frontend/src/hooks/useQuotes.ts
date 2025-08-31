
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types/product";
import { Quote, QuoteItem, QuoteStatus, statusLabels } from "@/types/quotes";
import { generateQuotePDF } from "@/utils/quotePdfGenerator";

const initialQuotes: Quote[] = [
  {
    id: 1,
    customerName: "Carlos Silva",
    customerEmail: "carlos@email.com",
    customerCnpj: "12.345.678/0001-99",
    customerAddress: "Rua Exemplo, 456",
    customerCity: "São Paulo",
    customerPhone: "(11) 98765-4321",
    date: "2024-01-15",
    validUntil: "2024-02-15",
    status: "sent",
    items: [
      { id: 1, productName: "Produto A", quantity: 2, unitPrice: 50, total: 100 },
      { id: 2, productName: "Produto B", quantity: 1, unitPrice: 75, total: 75 },
    ],
    subtotal: 175,
    discount: 10,
    total: 157.5,
    notes: "Proposta especial para cliente VIP"
  }
];

const initialProducts: Product[] = [
  { id: 1, name: "Produto A", price: 50.00, stock: 10, minStock: 5, barcode: "1234567890123", image: "https://placehold.co/150x150" },
  { id: 2, name: "Produto B", price: 75.00, stock: 5, minStock: 3, barcode: "9876543210987", image: "https://placehold.co/150x150" },
  { id: 3, name: "Produto C", price: 100.00, stock: 8, minStock: 2, barcode: "5555666677778", image: "https://placehold.co/150x150" },
];

export const useQuotes = () => {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addQuote = (data: { formData: any, quoteItems: QuoteItem[] }) => {
    const { formData, quoteItems } = data;
    const subtotal = quoteItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * formData.discount) / 100;
    const total = subtotal - discountAmount;
    
    const newQuote: Quote = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      status: "draft",
      items: quoteItems,
      subtotal,
      total,
      ...formData
    };
    setQuotes(prev => [...prev, newQuote]);
    toast({
      title: "Orçamento criado",
      description: "Novo orçamento foi criado com sucesso.",
    });
  };

  const updateQuote = (data: { formData: any, quoteItems: QuoteItem[], id: number }) => {
    const { formData, quoteItems, id } = data;
    const subtotal = quoteItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * formData.discount) / 100;
    const total = subtotal - discountAmount;

    setQuotes(prev => prev.map(q => 
      q.id === id 
        ? { ...q, ...formData, items: quoteItems, subtotal, total, id }
        : q
    ));
    toast({
      title: "Orçamento atualizado",
      description: "O orçamento foi atualizado com sucesso.",
    });
  };

  const deleteQuote = (id: number) => {
    setQuotes(quotes.filter(quote => quote.id !== id));
    toast({
      title: "Orçamento removido",
      description: "O orçamento foi removido do sistema.",
      variant: "destructive",
    });
  };

  const updateQuoteStatus = (id: number, status: QuoteStatus) => {
    setQuotes(prev => prev.map(quote => 
      quote.id === id ? { ...quote, status } : quote
    ));
    toast({
      title: "Status atualizado",
      description: `Orçamento marcado como ${statusLabels[status].toLowerCase()}.`,
    });
  };

  const sendQuote = (quote: Quote) => {
    updateQuoteStatus(quote.id, "sent");
    generateQuotePDF(quote);
    toast({
      title: "Orçamento enviado",
      description: "O orçamento foi enviado e o PDF foi gerado.",
    });
  };

  const handleConvertToOrder = (quoteToConvert: Quote) => {
    setProducts(currentProducts => currentProducts.map(p => {
        const itemInQuote = quoteToConvert.items.find(item => item.productName === p.name);
        if (itemInQuote) {
            return { ...p, stock: p.stock - itemInQuote.quantity };
        }
        return p;
    }));

    setQuotes(currentQuotes => currentQuotes.map(quote => 
      quote.id === quoteToConvert.id ? { ...quote, status: 'converted' } : quote
    ));

    toast({
      title: "Orçamento convertido em venda!",
      description: "O status foi atualizado e o estoque dos produtos foi ajustado.",
    });
  };

  return {
    quotes,
    products,
    addQuote,
    updateQuote,
    deleteQuote,
    updateQuoteStatus,
    sendQuote,
    handleConvertToOrder,
  };
};
