import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Trash2, CreditCard, FileText, XCircle } from "lucide-react"; // Adicionado XCircle para o ícone de limpar
import { SaleItem } from "@/types/pos";
import { Customer } from "@/types/product";
import React, { useState, useEffect } from "react";

interface ShoppingCartProps {
  items: SaleItem[];
  customers: Customer[];
  selectedCustomer: string;
  onCustomerChange: (value: string) => void;
  onUpdateQuantity: (id: number | string, quantity: number) => void;
  onRemoveItem: (id: number | string) => void;
  discountPercentage: number;
  discountAmount: number;
  onDiscountPercentageChange: (value: number) => void;
  onDiscountRealChange: (value: number) => void;
  subtotal: number;
  total: number;
  paymentMethods: string[];
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  onFinalizeSale: () => void;
  onGeneratePDF: () => void;
  onClearCart: () => void; // --- NOVA PROPRIEDADE PARA LIMPAR O CARRINHO ---
}

export const ShoppingCartPanel = ({
  items, customers, selectedCustomer, onCustomerChange, onUpdateQuantity, onRemoveItem,
  discountPercentage, discountAmount, onDiscountPercentageChange, onDiscountRealChange,
  subtotal, total, paymentMethods, paymentMethod, onPaymentMethodChange, 
  notes, onNotesChange, onFinalizeSale, onGeneratePDF, onClearCart // --- NOVA PROPRIEDADE AQUI ---
}: ShoppingCartProps) => {

  const [localDiscountPercentage, setLocalDiscountPercentage] = useState<string>(discountPercentage.toString());
  const [localDiscountAmount, setLocalDiscountAmount] = useState<string>(discountAmount.toFixed(2));

  useEffect(() => {
    setLocalDiscountPercentage(discountPercentage.toString());
    setLocalDiscountAmount(discountAmount.toFixed(2));
  }, [discountPercentage, discountAmount]);

  const handlePercentageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalDiscountPercentage(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onDiscountPercentageChange(numValue);
    } else if (value === '') {
      onDiscountPercentageChange(0);
    }
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalDiscountAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onDiscountRealChange(numValue);
    } else if (value === '') {
      onDiscountRealChange(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Carrinho
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Cliente</Label>
          <Select value={selectedCustomer} onValueChange={onCustomerChange}>
            <SelectTrigger><SelectValue placeholder="Selecionar cliente" /></SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id.toString()}>{customer.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {items.length > 0 ? items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex-1 mr-2">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.quantity} x R$ {Number(item.price).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-medium text-sm">R$ {item.total.toFixed(2)}</div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => onRemoveItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          )) : <p className="text-sm text-muted-foreground text-center py-10">O carrinho está vazio.</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discountPercentage">Desconto (%)</Label>
              <Input
                id="discountPercentage"
                type="number"
                value={localDiscountPercentage}
                onChange={handlePercentageInputChange}
                min="0"
                max="100"
              />
            </div>
            <div>
              <Label htmlFor="discountReal">Desconto (R$)</Label>
              <Input
                id="discountReal"
                type="number"
                value={localDiscountAmount}
                onChange={handleAmountInputChange}
                min="0"
              />
            </div>
        </div>
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm"><span>Subtotal:</span><span>R$ {subtotal.toFixed(2)}</span></div>
          {discountPercentage > 0 && (<div className="flex justify-between text-sm text-red-600"><span>Desconto ({discountPercentage.toFixed(2)}%):</span><span>- R$ {discountAmount.toFixed(2)}</span></div>)}
          <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>R$ {total.toFixed(2)}</span></div>
        </div>
        <div>
          <Label>Observações da Venda</Label>
          <Textarea placeholder="Adicionar observações à venda..." value={notes} onChange={(e) => onNotesChange(e.target.value)} />
        </div>
        <div>
          <Label>Forma de Pagamento</Label>
          <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
            <SelectTrigger><SelectValue placeholder="Selecionar forma de pagamento" /></SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (<SelectItem key={method} value={method}>{method}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="pt-4 space-y-2">
          <Button onClick={onFinalizeSale} className="w-full" size="lg"><CreditCard className="h-4 w-4 mr-2" />Finalizar Venda</Button>
          {/* --- NOVO BOTÃO DE LIMPAR CARRINHO --- */}
          <Button onClick={onClearCart} variant="outline" className="w-full">
            <XCircle className="h-4 w-4 mr-2" />Limpar Carrinho
          </Button>
          {/* --- FIM DO NOVO BOTÃO --- */}
          {items.length > 0 && (<Button onClick={onGeneratePDF} variant="outline" className="w-full">Visualizar pré-venda</Button>)}
        </div>
      </CardContent>
    </Card>
  );
};