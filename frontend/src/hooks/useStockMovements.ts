
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { StockMovement, Product, MovementFormData, Location, StockTransfer, TransferItem } from "@/types/stock-movements";

const initialMovements: StockMovement[] = [
    {
      id: "1",
      productId: 1,
      productName: "Camiseta Básica",
      type: "entrada",
      category: "compra",
      quantity: 50,
      unitPrice: 15,
      totalValue: 750,
      batch: "LOTE001",
      supplier: "Fornecedor ABC",
      reason: "Compra mensal",
      userId: "user1",
      userName: "João Silva",
      date: "2024-01-15T10:30:00.000Z",
      status: "confirmed",
      reference: "NF-001"
    },
    {
      id: "2",
      productId: 1,
      productName: "Camiseta Básica",
      type: "saida",
      category: "venda",
      quantity: 10,
      unitPrice: 35,
      totalValue: 350,
      customer: "Cliente XYZ",
      reason: "Venda no PDV",
      userId: "user2",
      userName: "Maria Santos",
      date: "2024-01-16T14:20:00.000Z",
      status: "confirmed",
      reference: "VENDA-001"
    },
    {
      id: "3",
      productId: 2,
      productName: "Suco Natural",
      type: "saida",
      category: "perda",
      quantity: 5,
      unitPrice: 3,
      totalValue: 15,
      batch: "LOTE002",
      reason: "Produto vencido",
      userId: "user1",
      userName: "João Silva",
      date: "2024-01-17T09:15:00.000Z",
      status: "confirmed"
    }
  ];

const initialProducts: Product[] = [
    {
      id: 1,
      name: "Camiseta Básica",
      category: "Roupas",
      stock: 65,
      stockByLocation: { 'depot-main': 50, 'store-center': 10, 'store-neighborhood': 5 },
      costPrice: 15,
      salePrice: 35,
      barcode: "7891234567890"
    },
    {
      id: 2,
      name: "Suco Natural",
      category: "Bebidas", 
      stock: 130,
      stockByLocation: { 'depot-main': 95, 'store-center': 20, 'store-neighborhood': 15 },
      costPrice: 3,
      salePrice: 8,
      barcode: "7891234567891"
    }
  ];

const initialLocations: Location[] = [
    { id: 'depot-main', name: 'Depósito Principal' },
    { id: 'store-center', name: 'Loja Centro' },
    { id: 'store-neighborhood', name: 'Loja Bairro' },
  ];
  
export const useStockMovements = () => {
  const { toast } = useToast();
  
  const [movements, setMovements] = useState<StockMovement[]>(initialMovements);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [locations] = useState<Location[]>(initialLocations);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>([]);

  // Movement Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<MovementFormData>({
    type: "", category: "", quantity: "", unitPrice: "", batch: "", serial: "",
    supplier: "", customer: "", reason: "", reference: "", validityDate: "",
  });

  // Transfer Form State
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [newTransferItems, setNewTransferItems] = useState<TransferItem[]>([]);
  const [transferOrigin, setTransferOrigin] = useState<string>("");
  const [transferDestination, setTransferDestination] = useState<string>("");
  const [transferNotes, setTransferNotes] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !formData.type || !formData.category) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    const newMovement: StockMovement = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: formData.type as "entrada" | "saida",
      category: formData.category as any,
      quantity: parseInt(formData.quantity),
      unitPrice: parseFloat(formData.unitPrice),
      totalValue: parseInt(formData.quantity) * parseFloat(formData.unitPrice),
      batch: formData.batch || undefined,
      serial: formData.serial || undefined,
      validityDate: formData.validityDate || undefined,
      supplier: formData.supplier || undefined,
      customer: formData.customer || undefined,
      reason: formData.reason,
      userId: "user1",
      userName: "Usuário Atual",
      date: new Date().toISOString(),
      status: "confirmed",
      reference: formData.reference || undefined
    };
    setMovements([newMovement, ...movements]);
    toast({
      title: "Movimentação registrada",
      description: `${formData.type === "entrada" ? "Entrada" : "Saída"} de ${formData.quantity} unidade(s) registrada com sucesso.`,
    });
    setFormData({ type: "", category: "", quantity: "", unitPrice: "", batch: "", serial: "", supplier: "", customer: "", reason: "", reference: "", validityDate: "" });
    setSelectedProduct(null);
    setIsDialogOpen(false);
  };

  const resetTransferForm = () => {
    setNewTransferItems([]);
    setTransferOrigin("");
    setTransferDestination("");
    setTransferNotes("");
    setIsTransferDialogOpen(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferOrigin || !transferDestination || newTransferItems.length === 0) {
      toast({ title: "Erro", description: "Selecione origem, destino e adicione pelo menos um produto.", variant: "destructive" });
      return;
    }
    if (transferOrigin === transferDestination) {
      toast({ title: "Erro", description: "A origem e o destino não podem ser iguais.", variant: "destructive" });
      return;
    }
    for (const item of newTransferItems) {
      const product = products.find(p => p.id === item.productId);
      const stockAtOrigin = product?.stockByLocation?.[transferOrigin] ?? 0;
      if (item.quantity > stockAtOrigin) {
        toast({ title: "Estoque insuficiente", description: `O produto "${item.productName}" não tem estoque suficiente na origem. Disponível: ${stockAtOrigin}`, variant: "destructive" });
        return;
      }
    }
    const originLocation = locations.find(l => l.id === transferOrigin);
    const destinationLocation = locations.find(l => l.id === transferDestination);
    const newTransfer: StockTransfer = {
      id: Date.now().toString(),
      trackingCode: `TR-${Date.now().toString().slice(-6)}`,
      originLocationId: transferOrigin,
      destinationLocationId: transferDestination,
      originLocationName: originLocation?.name || 'N/A',
      destinationLocationName: destinationLocation?.name || 'N/A',
      items: newTransferItems,
      transferDate: new Date().toISOString(),
      status: 'in_transit',
      notes: transferNotes,
      createdBy: "Usuário Atual",
    };
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      newTransfer.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (productIndex > -1) {
          const product = updatedProducts[productIndex];
          const newStockByLocation = { ...product.stockByLocation };
          newStockByLocation[transferOrigin] = (newStockByLocation[transferOrigin] || 0) - item.quantity;
          updatedProducts[productIndex] = { ...product, stockByLocation: newStockByLocation };
        }
      });
      return updatedProducts;
    });
    setStockTransfers([newTransfer, ...stockTransfers]);
    toast({ title: "Transferência Criada", description: "A transferência de estoque foi registrada e está em trânsito." });
    resetTransferForm();
  };
  
  const addProductToTransfer = (product: Product) => {
    if (!transferOrigin) {
      toast({ title: "Atenção", description: "Selecione um local de origem primeiro.", variant: "destructive" });
      return;
    }
    const stockAtOrigin = product.stockByLocation?.[transferOrigin] ?? 0;
    if (stockAtOrigin <= 0) {
      toast({ title: "Sem Estoque", description: `O produto "${product.name}" não tem estoque na origem selecionada.`, variant: "destructive" });
      return;
    }
    setNewTransferItems(prev => {
      if (prev.find(item => item.productId === product.id)) return prev;
      return [...prev, { productId: product.id, productName: product.name, quantity: 1, barcode: product.barcode }];
    });
  };

  const updateTransferItemQuantity = (productId: number, quantity: number) => {
    if (!transferOrigin) {
      toast({ title: "Atenção", description: "Selecione um local de origem para ajustar a quantidade.", variant: "destructive" });
      return;
    }
    const product = products.find(p => p.id === productId);
    const stockAtOrigin = product?.stockByLocation?.[transferOrigin] ?? 0;
    let adjustedQuantity = Math.max(0, quantity);
    if (adjustedQuantity > stockAtOrigin) {
      toast({ title: "Quantidade excede o estoque", description: `Máximo de ${stockAtOrigin} unidades para "${product?.name}" na origem.` });
      adjustedQuantity = stockAtOrigin;
    }
    setNewTransferItems(prev => prev.map(item => item.productId === productId ? { ...item, quantity: adjustedQuantity } : item));
  };

  const removeTransferItem = (productId: number) => {
    setNewTransferItems(prev => prev.filter(item => item.productId !== productId));
  };
  
  const handleReceiveTransfer = (transferId: string) => {
    const transfer = stockTransfers.find(t => t.id === transferId);
    if (!transfer) return;
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      transfer.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (productIndex > -1) {
          const product = updatedProducts[productIndex];
          const newStockByLocation = { ...product.stockByLocation };
          const destId = transfer.destinationLocationId;
          newStockByLocation[destId] = (newStockByLocation[destId] || 0) + item.quantity;
          updatedProducts[productIndex] = { ...product, stockByLocation: newStockByLocation };
        }
      });
      return updatedProducts;
    });
    setStockTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: 'completed' } : t));
    toast({ title: "Transferência Recebida", description: "O estoque foi atualizado no local de destino." });
  };

  const handleCancelTransfer = (transferId: string) => {
    const transfer = stockTransfers.find(t => t.id === transferId);
    if (!transfer || transfer.status === 'completed' || transfer.status === 'cancelled') return;
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      transfer.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (productIndex > -1) {
          const product = updatedProducts[productIndex];
          const newStockByLocation = { ...product.stockByLocation };
          const originId = transfer.originLocationId;
          newStockByLocation[originId] = (newStockByLocation[originId] || 0) + item.quantity;
          updatedProducts[productIndex] = { ...product, stockByLocation: newStockByLocation };
        }
      });
      return updatedProducts;
    });
    setStockTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: 'cancelled' } : t));
    toast({ title: "Transferência Cancelada", description: "O estoque foi devolvido ao local de origem.", variant: "destructive" });
  };

  return {
    movements, products, locations, stockTransfers,
    isDialogOpen, setIsDialogOpen, selectedProduct, setSelectedProduct, formData, setFormData, handleSubmit,
    isTransferDialogOpen, setIsTransferDialogOpen, newTransferItems, setNewTransferItems,
    transferOrigin, setTransferOrigin, transferDestination, setTransferDestination, transferNotes, setTransferNotes,
    handleTransferSubmit, addProductToTransfer, updateTransferItemQuantity, removeTransferItem, handleReceiveTransfer, handleCancelTransfer, resetTransferForm,
  };
}
