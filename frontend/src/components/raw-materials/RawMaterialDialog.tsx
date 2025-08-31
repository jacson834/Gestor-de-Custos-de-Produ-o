// src/components/raw-materials/RawMaterialDialog.tsx (Arquivo Novo)

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RawMaterialForm, RawMaterialFormData } from "./RawMaterialForm";
import { RawMaterial, Supplier } from "@/types/product";
import { useState, useEffect } from 'react';

interface RawMaterialDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  editingMaterial: RawMaterial | null;
  onSave: (data: Partial<RawMaterialFormData>, id?: number | string) => void;
  suppliers: Supplier[];
}

const emptyForm: Partial<RawMaterialFormData> = {
  name: "",
  unitOfPurchase: "",
  purchasePrice: 0,
  baseUnit: "",
  totalQuantityInBaseUnit: 0,
  supplierId: null,
};

export const RawMaterialDialog = ({ isOpen, onOpenChange, editingMaterial, onSave, suppliers }: RawMaterialDialogProps) => {
  const [formData, setFormData] = useState<Partial<RawMaterialFormData>>(emptyForm);

  useEffect(() => {
    if (isOpen && editingMaterial) {
      setFormData(editingMaterial);
    } else {
      setFormData(emptyForm);
    }
  }, [editingMaterial, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, editingMaterial?.id);
  };

  const isEditing = !!editingMaterial;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Matéria-Prima" : "Nova Matéria-Prima"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informações do ingrediente." : "Adicione um novo ingrediente ao seu inventário."}
          </DialogDescription>
        </DialogHeader>
        <RawMaterialForm
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          isEditing={isEditing}
          suppliers={suppliers}
        />
      </DialogContent>
    </Dialog>
  );
};