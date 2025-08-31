import { useState, useMemo, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useToast } from "@/hooks/use-toast";
import BarcodeScanner from "@/components/BarcodeScanner";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";
import { generateDocumentPDF } from "@/utils/pdfUtils";
import { SaleItem } from "@/types/pos";
import { Product, Customer } from "@/types/product";
import { ProductSelection } from "@/components/pos/ProductSelection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShoppingCartPanel } from "@/components/pos/ShoppingCartPanel";
import { useProducts } from "@/hooks/useProducts";

const POS = () => {
  const { toast } = useToast();
  const { companyInfo, logo } = useCompanyInfo();
  const stock = useProducts(); 
  
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const subtotal = saleItems.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = useMemo(() => (subtotal * discountPercentage) / 100, [subtotal, discountPercentage]);
  const total = subtotal - discountAmount;

  const handleDiscountPercentageChange = (percentage: number) => {
    const newPercentage = Math.max(0, Math.min(100, percentage || 0));
    setDiscountPercentage(newPercentage);
  };

  const handleDiscountRealChange = (amount: number) => {
    if (subtotal === 0) {
      setDiscountPercentage(0);
      return;
    }
    const newAmount = Math.max(0, Math.min(subtotal, amount || 0));
    const newPercentage = (newAmount / subtotal) * 100;
    setDiscountPercentage(newPercentage);
  };

  const availableProducts = useMemo(() => {
    if (!stock.products) return [];
    return stock.products.filter(p => p.status === 'active');
  }, [stock.products]);
  
  const paymentMethods = ["Dinheiro", "Cartão de Débito", "Cartão de Crédito", "PIX"];

  const addProduct = (product: Product) => {
    const stockAvailable = stock.getTotalStock(product);
    if (stockAvailable <= 0) { toast({ title: "Sem estoque", variant: "destructive" }); return; }
    const existingItem = saleItems.find(item => item.id === product.id);
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    if (currentQuantityInCart + 1 > stockAvailable) { toast({ title: "Estoque insuficiente", variant: "destructive" }); return; }
    if (existingItem) {
      setSaleItems(saleItems.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } : item ));
    } else {
      setSaleItems([...saleItems, { id: product.id, name: product.name, price: product.salePrice, quantity: 1, total: product.salePrice }]);
    }
  };

  const handleBarcodeDetected = (barcode: string) => { const product = availableProducts.find(p => p.barcode === barcode); if (product) { addProduct(product); toast({ title: "Produto encontrado" }); } else { toast({ title: "Produto não encontrado", variant: "destructive" }); } };
  const updateQuantity = (id: number | string, quantity: number) => { if (quantity <= 0) { removeItem(id); return; } const product = availableProducts.find(p => p.id === id); if (product && quantity > stock.getTotalStock(product)) { toast({ title: "Estoque insuficiente", variant: "destructive" }); return; } setSaleItems(saleItems.map(item => item.id === id ? { ...item, quantity, total: quantity * item.price } : item )); };
  const removeItem = (id: number | string) => { setSaleItems(saleItems.filter(item => item.id !== id)); };
  
  const generateSalePDF = () => {
    if (saleItems.length === 0) return;
    const customer = stock.customers.find(c => c.id.toString() === selectedCustomer);
    generateDocumentPDF({ docType: 'sale', companyInfo, logo, customer, items: saleItems, subtotal, discountAmount, discountPercentage, total, paymentMethod: paymentMethod || 'Não informado', notes });
  };
  
  const finalizeSale = async () => {
    if (saleItems.length === 0 || !paymentMethod) { toast({ title: "Erro", description: "Adicione produtos e forma de pagamento.", variant: "destructive" }); return; }
    try {
      const customerName = stock.customers.find(c=>c.id.toString()===selectedCustomer)?.name || 'Consumidor Final';
      await stock.finalizeSaleAndUpdateStock({ items: saleItems, customerId: selectedCustomer, customerName, subtotal, discountPercentage, discountAmount, total, paymentMethod, notes });
      generateSalePDF();
      toast({ variant: "success", title: "Venda finalizada!", duration: 5000 });
      // Limpa os estados após a finalização da venda
      setSaleItems([]); setSelectedCustomer(""); setPaymentMethod(""); setDiscountPercentage(0); setNotes("");
    } catch (error: any) {
      toast({ title: "Venda não realizada", description: error.message || "Não foi possível atualizar o estoque.", variant: "destructive" });
    }
  };

  const clearCart = () => {
    setSaleItems([]);           // Limpa os itens do carrinho
    setSelectedCustomer("");    // Reseta o cliente selecionado
    setPaymentMethod("");       // Reseta a forma de pagamento
    setDiscountPercentage(0);   // Reseta o desconto
    setNotes("");               // Limpa as observações
    toast({ title: "Carrinho Limpo", description: "Todos os itens e informações da venda foram removidos.", variant: "default" });
  };

  if (stock.isLoading) {
    return <div className="flex items-center justify-center h-screen w-full">Carregando dados...</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="border-b bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">PDV - Ponto de Venda</h1>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </header>
          
          {/* VOLTANDO PARA A ESTRUTURA DE GRID QUE FUNCIONAVA */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProductSelection
                products={availableProducts}
                onAddProduct={addProduct}
                onScanClick={() => setIsScannerOpen(true)}
              />
            </div>
            <div>
              <ShoppingCartPanel
                items={saleItems}
                customers={stock.customers || []}
                selectedCustomer={selectedCustomer}
                onCustomerChange={setSelectedCustomer}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                discountPercentage={discountPercentage}
                discountAmount={discountAmount}
                onDiscountPercentageChange={handleDiscountPercentageChange}
                onDiscountRealChange={handleDiscountRealChange}
                subtotal={subtotal}
                total={total}
                paymentMethods={paymentMethods}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod} 
                notes={notes}
                onNotesChange={setNotes}
                onFinalizeSale={finalizeSale}
                onGeneratePDF={generateSalePDF}
                onClearCart={clearCart}
              />
            </div>
          </div>

          <BarcodeScanner
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
            onBarcodeDetected={handleBarcodeDetected}
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default POS;