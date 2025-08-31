
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types/product";
import { Quote, QuoteItem } from "@/types/quotes";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface QuoteFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  editingQuote: Quote | null;
  products: Product[];
  onSave: (data: { formData: any, quoteItems: QuoteItem[] }) => void;
}

const initialFormData = {
  customerName: "",
  customerEmail: "",
  customerCnpj: "",
  customerAddress: "",
  customerCity: "",
  customerPhone: "",
  validUntil: "",
  discount: 0,
  notes: ""
};

export const QuoteFormDialog = ({ isOpen, onOpenChange, editingQuote, products, onSave }: QuoteFormDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialFormData);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [openProductSearch, setOpenProductSearch] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState("");

  const resetForm = () => {
    setFormData(initialFormData);
    setQuoteItems([]);
  };

  useEffect(() => {
    if (editingQuote) {
      setFormData({
        customerName: editingQuote.customerName,
        customerEmail: editingQuote.customerEmail,
        customerCnpj: editingQuote.customerCnpj || "",
        customerAddress: editingQuote.customerAddress || "",
        customerCity: editingQuote.customerCity || "",
        customerPhone: editingQuote.customerPhone || "",
        validUntil: editingQuote.validUntil,
        discount: editingQuote.discount,
        notes: editingQuote.notes
      });
      setQuoteItems(editingQuote.items);
    } else {
      resetForm();
    }
  }, [editingQuote, isOpen]);

  const handleProductSelect = (itemId: number, product: Product) => {
    setQuoteItems(quoteItems.map(item => {
      if (item.id === itemId) {
        const updatedItem = {
          ...item,
          productName: product.name,
          unitPrice: product.price,
        };
        updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        return updatedItem;
      }
      return item;
    }));
    setOpenProductSearch(null);
    setProductSearch("");
  };

  const addItem = () => {
    const newItem: QuoteItem = { id: Date.now(), productName: "", quantity: 1, unitPrice: 0, total: 0 };
    setQuoteItems([...quoteItems, newItem]);
  };

  const updateItem = (id: number, field: keyof QuoteItem, value: any) => {
    setQuoteItems(quoteItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id: number) => {
    setQuoteItems(quoteItems.filter(item => item.id !== id));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quoteItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item ao orçamento.",
        variant: "destructive",
      });
      return;
    }
    onSave({ formData, quoteItems });
    resetForm();
  };
  
  const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingQuote ? "Editar Orçamento" : "Novo Orçamento"}</DialogTitle>
          <DialogDescription>Crie propostas comerciais para seus clientes</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Dados do Cliente</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Nome do Cliente</Label>
                  <Input id="customerName" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} required />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email do Cliente</Label>
                  <Input id="customerEmail" type="email" value={formData.customerEmail} onChange={(e) => setFormData({...formData, customerEmail: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerCnpj">CNPJ</Label>
                  <Input id="customerCnpj" value={formData.customerCnpj} onChange={(e) => setFormData({...formData, customerCnpj: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Telefone</Label>
                  <Input id="customerPhone" value={formData.customerPhone} onChange={(e) => setFormData({...formData, customerPhone: e.target.value})} />
                </div>
              </div>
              <div>
                <Label htmlFor="customerAddress">Endereço</Label>
                <Input id="customerAddress" value={formData.customerAddress} onChange={(e) => setFormData({...formData, customerAddress: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="customerCity">Cidade</Label>
                <Input id="customerCity" value={formData.customerCity} onChange={(e) => setFormData({...formData, customerCity: e.target.value})} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Detalhes do Orçamento</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validUntil">Válido até</Label>
                <Input id="validUntil" type="date" value={formData.validUntil} onChange={(e) => setFormData({...formData, validUntil: e.target.value})} required />
              </div>
              <div>
                <Label htmlFor="discount">Desconto (%)</Label>
                <Input id="discount" type="number" min="0" max="100" value={formData.discount} onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
             <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Itens do Orçamento</CardTitle>
                <Button type="button" onClick={addItem} size="sm"><Plus className="h-4 w-4 mr-2" />Adicionar Item</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quoteItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-4 border rounded">
                    <div className="col-span-5">
                      <Label>Produto</Label>
                      <Popover open={openProductSearch === item.id} onOpenChange={(isOpen) => setOpenProductSearch(isOpen ? item.id : null)}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">{item.productName || "Selecionar produto..."}</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar produto..." onValueChange={setProductSearch}/>
                            <CommandList>
                              <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                              <CommandGroup>
                                {sortedProducts.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase())).map((product) => (
                                  <CommandItem key={product.id} value={product.name} onSelect={() => handleProductSelect(item.id, product)}>{product.name}</CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="col-span-2"><Label>Qtd</Label><Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)} /></div>
                    <div className="col-span-2"><Label>Preço Unit.</Label><Input type="number" step="0.01" min="0" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} /></div>
                    <div className="col-span-2"><Label>Total</Label><Input value={`R$ ${item.total.toFixed(2)}`} disabled /></div>
                    <div className="col-span-1"><Button type="button" variant="outline" size="sm" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Observações adicionais para o orçamento" rows={3}/>
          </div>
          <Button type="submit" className="w-full">{editingQuote ? "Atualizar Orçamento" : "Criar Orçamento"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
