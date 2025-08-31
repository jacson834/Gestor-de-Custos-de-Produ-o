// src/components/orders/OrderForm.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Importado Select
import { OrderItem, Product, Order } from "@/types/orders"; // Product importado de types/orders
import { Customer } from "@/types/product"; // Importado Customer do types/product
import { OrderItemEditor } from "./OrderItemEditor";

interface OrderFormProps {
  handleSubmit: (e: React.FormEvent) => void;
  editingOrder: Order | null;
  formData: {
    customerName: string;
    customerEmail: string;
    deliveryDate: string;
    discount: number;
    notes: string;
    customerId: string; // Adicionado customerId ao formData
  };
  setFormData: React.Dispatch<React.SetStateAction<OrderFormProps['formData']>>;
  orderItems: OrderItem[];
  products: Product[];
  customers: Customer[]; // --- NOVA PROP: Lista de clientes ---
  addItem: () => void;
  updateItem: (id: number, field: keyof OrderItem, value: any) => void;
  removeItem: (id: number) => void;
  // Ajuste aqui: handleProductSelect agora recebe o ID do produto, não o objeto Product completo
  handleProductSelect: (itemId: number, productId: number) => void; 
}

export const OrderForm = ({
  handleSubmit,
  editingOrder,
  formData,
  setFormData,
  orderItems,
  products,
  customers, // --- NOVA PROP ---
  addItem,
  updateItem,
  removeItem,
  handleProductSelect,
}: OrderFormProps) => {

  // Encontra o nome do cliente selecionado para exibir no SelectTrigger
  const selectedCustomerName = customers.find(c => c.id.toString() === formData.customerId)?.name || "Selecione o Cliente";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerSelect">Cliente</Label> {/* Mudança de ID */}
          <Select
            value={formData.customerId} // Controla pelo ID do cliente
            onValueChange={(value) => {
              const selectedCustomer = customers.find(c => c.id.toString() === value);
              setFormData({ 
                ...formData, 
                customerId: value, 
                customerName: selectedCustomer ? selectedCustomer.name : "", // Atualiza o nome do cliente
                customerEmail: selectedCustomer ? (selectedCustomer.email || "") : "" // Atualiza o email
              });
            }}
            required // Torna a seleção do cliente obrigatória
          >
            <SelectTrigger id="customerSelect"> {/* Mudança de ID */}
              <SelectValue placeholder="Selecione o Cliente" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id.toString()}>
                  {customer.name} {customer.cpf_cnpj ? `(${customer.cpf_cnpj})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* O campo de Email do Cliente não é mais necessário como input direto,
            pois será preenchido automaticamente ao selecionar o cliente.
            Você pode removê-lo se o email não for editável, ou mantê-lo desabilitado para exibição.
            Vou removê-lo para simplificar, como o backend de vendas não o usa diretamente. */}
        {/* <div>
          <Label htmlFor="customerEmail">Email do Cliente</Label>
          <Input
            id="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            required
            disabled // Desabilitado pois o valor é setado pela seleção
          />
        </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deliveryDate">Data de Entrega</Label>
          <Input
            id="deliveryDate"
            type="date"
            value={formData.deliveryDate}
            onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="discount">Desconto (%)</Label>
          <Input
            id="discount"
            type="number"
            min="0"
            max="100"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
      
      <OrderItemEditor 
        orderItems={orderItems}
        products={products} // Produtos reais
        addItem={addItem}
        updateItem={updateItem}
        removeItem={removeItem}
        handleProductSelect={handleProductSelect}
      />

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Observações adicionais para o pedido"
          rows={3}
        />
      </div>
      
      <Button type="submit" className="w-full">
        {editingOrder ? "Atualizar Pedido" : "Criar Pedido"}
      </Button>
    </form>
  );
};