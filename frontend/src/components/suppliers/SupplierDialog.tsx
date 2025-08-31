// src/components/suppliers/SupplierDialog.tsx (Versão Final e Corrigida)

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SupplierForm, SupplierFormData } from "./SupplierForm";
import { Supplier } from "@/types/product";
import { useState, useEffect } from 'react';

interface SupplierDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  editingSupplier: Supplier | null;
  onSave: (supplierData: Partial<SupplierFormData>, id?: number | string) => void;
}

const emptyForm: Partial<SupplierFormData> = {
  name: "",
  cnpj: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  contactPerson: "",
};

export const SupplierDialog = ({ isOpen, onOpenChange, editingSupplier, onSave }: SupplierDialogProps) => {
  const [formData, setFormData] = useState<Partial<SupplierFormData>>(emptyForm);

  // AJUSTE FEITO AQUI: A lógica agora depende de 'isOpen' também.
  // Isso garante que TODA VEZ que a janela for aberta (isOpen se torna true),
  // o código irá verificar se há um fornecedor para editar e irá preencher o formulário.
  // Isso resolve o bug do formulário aparecer vazio.
  useEffect(() => {
    if (isOpen && editingSupplier) {
      // Se a janela está abrindo E estamos editando, preenche o formulário
      setFormData(editingSupplier);
    } else {
      // Em qualquer outro caso (abrindo para criar um novo, ou ao fechar),
      // o formulário é resetado para o estado vazio.
      setFormData(emptyForm);
    }
  }, [editingSupplier, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, editingSupplier?.id);
  };

  const isEditing = !!editingSupplier;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informações do fornecedor." : "Adicione um novo fornecedor ao sistema."}
          </DialogDescription>
        </DialogHeader>
        <SupplierForm
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          isEditing={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
};