// src/components/orders/OrderItemEditor.tsx (Exemplo de correção)

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderItem } from "@/types/orders"; // Importa OrderItem
import { Product as BackendProduct } from "@/types/product"; // Importa Product do types/product.ts

import { Plus, X } from "lucide-react";

interface OrderItemEditorProps {
  orderItems: OrderItem[];
  products: BackendProduct[]; // Deve receber produtos do backend
  addItem: () => void;
  updateItem: (id: number, field: keyof OrderItem, value: any) => void;
  removeItem: (id: number) => void;
  // Ajuste aqui: handleProductSelect agora recebe o ID do produto para o pai
  handleProductSelect: (itemId: number, productId: number) => void; 
}

export const OrderItemEditor = ({
  orderItems,
  products,
  addItem,
  updateItem,
  removeItem,
  handleProductSelect,
}: OrderItemEditorProps) => {
  return (
    <div className="space-y-4 border p-4 rounded-md">
      <Label>Itens do Pedido</Label>
      {orderItems.map((item) => (
        <div key={item.id} className="flex items-end gap-2 bg-muted/50 p-3 rounded-md">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="col-span-2">
              <Label htmlFor={`product-${item.id}`}>Produto</Label>
              <Select
                value={item.id.toString()} // O valor do select deve ser o ID do produto selecionado
                onValueChange={(value) => {
                  // Converte o valor para número e chama a função do pai
                  handleProductSelect(item.id, Number(value));
                }}
              >
                <SelectTrigger id={`product-${item.id}`}>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} (Estoque: {product.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`quantity-${item.id}`}>Qtd</Label>
              <Input
                id={`quantity-${item.id}`}
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
              />
            </div>
            {/* O campo de preço unitário pode ser exibido, mas não editável se for puxado do produto */}
            {/* <div>
              <Label htmlFor={`unitPrice-${item.id}`}>Preço Unitário</Label>
              <Input
                id={`unitPrice-${item.id}`}
                type="number"
                step="0.01"
                value={item.unitPrice.toFixed(2)}
                onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
              />
            </div> */}
            {/* Exibe o total do item */}
            <div className="col-span-3 text-right">
                <Label>Total do Item:</Label>
                <span className="font-bold ml-2">R$ {item.total.toFixed(2)}</span>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" className="w-full" onClick={addItem}>
        <Plus className="h-4 w-4 mr-2" /> Adicionar Item
      </Button>
    </div>
  );
};