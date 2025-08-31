import { useState, useEffect, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Seller } from '@/pages/SellersCommissions';

interface SellerFormData {
  name: string;
  email: string;
  phone: string;
  commissionRate: string;
}

interface SellerFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingSeller: Seller | null;
  onSave: (sellerData: Partial<Seller>) => void;
}

const initialFormData: SellerFormData = {
  name: "",
  email: "",
  phone: "",
  commissionRate: "",
};

export const SellerFormDialog = ({ isOpen, onOpenChange, editingSeller, onSave }: SellerFormDialogProps) => {
  const [formData, setFormData] = useState<SellerFormData>(initialFormData);

  useEffect(() => {
    if (isOpen && editingSeller) {
      setFormData({
        name: editingSeller.name,
        email: editingSeller.email,
        phone: editingSeller.phone,
        commissionRate: editingSeller.commissionRate.toString(),
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingSeller, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      commissionRate: parseFloat(formData.commissionRate),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {editingSeller ? "Editar Vendedor" : "Novo Vendedor"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do vendedor abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="commissionRate">Taxa de Comissão (%)</Label>
              <Input id="commissionRate" type="number" step="0.1" min="0" max="100" value={formData.commissionRate} onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{editingSeller ? "Atualizar" : "Cadastrar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};