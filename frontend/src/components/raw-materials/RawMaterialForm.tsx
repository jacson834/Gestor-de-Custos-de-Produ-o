// src/components/raw-materials/RawMaterialForm.tsx (Arquivo Corrigido)

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RawMaterial, Supplier } from '@/types/product';
import { Textarea } from '../ui/textarea';

export type RawMaterialFormData = Omit<RawMaterial, 'id' | 'costPerBaseUnit'>;

interface RawMaterialFormProps {
  formData: Partial<RawMaterialFormData>;
  setFormData: (data: Partial<RawMaterialFormData>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  suppliers: Supplier[];
}

export const RawMaterialForm = ({ formData, setFormData, handleSubmit, isEditing, suppliers }: RawMaterialFormProps) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSelectChange = (field: 'baseUnit' | 'supplierId', value: string) => {
    // Convertemos para null se o valor for uma string vazia, para o caso de o usuário limpar a seleção
    const finalValue = value === "" ? null : value;
    setFormData({ ...formData, [field]: finalValue });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome da Matéria-Prima</Label>
        <Input id="name" value={formData.name || ''} onChange={handleChange} required placeholder="Ex: Leite em Pó Integral" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="unitOfPurchase">Unidade de Compra</Label>
          <Input id="unitOfPurchase" value={formData.unitOfPurchase || ''} onChange={handleChange} placeholder="Ex: Lata 900g, Caixa 100 un" />
          <p className="text-xs text-muted-foreground mt-1">Como você compra este item.</p>
        </div>
        <div>
          <Label htmlFor="purchasePrice">Preço de Compra (R$)</Label>
          <Input id="purchasePrice" type="number" step="0.01" value={formData.purchasePrice || ''} onChange={handleChange} placeholder="39.90" />
          <p className="text-xs text-muted-foreground mt-1">Preço pago pela unidade de compra.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="baseUnit">Unidade Base</Label>
          <Select value={formData.baseUnit || ''} onValueChange={(value) => handleSelectChange('baseUnit', value)}>
            <SelectTrigger><SelectValue placeholder="Selecione a unidade..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="g">Grama (g)</SelectItem>
              <SelectItem value="kg">Quilograma (kg)</SelectItem>
              <SelectItem value="ml">Mililitro (ml)</SelectItem>
              <SelectItem value="l">Litro (l)</SelectItem>
              <SelectItem value="un">Unidade (un)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">A menor unidade para cálculo.</p>
        </div>
        <div>
          <Label htmlFor="totalQuantityInBaseUnit">Estoque Total (em Unidade Base)</Label>
          <Input id="totalQuantityInBaseUnit" type="number" step="0.01" value={formData.totalQuantityInBaseUnit || ''} onChange={handleChange} placeholder="900" required />
          <p className="text-xs text-muted-foreground mt-1">Ex: Se comprou lata de 900g, insira 900.</p>
        </div>
      </div>

      <div>
        <Label htmlFor="supplierId">Fornecedor (Opcional)</Label>
        {/* AJUSTE FEITO AQUI: Removida a opção <SelectItem value="">Nenhum</SelectItem> que causava o erro. */}
        <Select value={String(formData.supplierId || '')} onValueChange={(value) => handleSelectChange('supplierId', value)}>
          <SelectTrigger><SelectValue placeholder="Selecione um fornecedor..." /></SelectTrigger>
          <SelectContent>
            {suppliers.map(supplier => (
              <SelectItem key={supplier.id} value={String(supplier.id)}>{supplier.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">{isEditing ? "Atualizar Matéria-Prima" : "Cadastrar Matéria-Prima"}</Button>
    </form>
  );
};