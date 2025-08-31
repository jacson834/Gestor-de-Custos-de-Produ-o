// frontend/src/components/barcode/AdvancedSettingsDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AppSettings, PrintSettings, AdvancedBarcodeSettings } from '@/types/product';

// Combinando todos os tipos de configurações
type AllSettings = AppSettings & PrintSettings & AdvancedBarcodeSettings;

interface AdvancedSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  settings: AllSettings;
  onSettingsChange: (settings: AllSettings) => void;
}

export const AdvancedSettingsDialog = ({ isOpen, onOpenChange, settings, onSettingsChange }: AdvancedSettingsDialogProps) => {
  // Estado local para o "rascunho" das alterações
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [settings, isOpen]);

  const handleSaveChanges = () => {
    onSettingsChange(localSettings);
    onOpenChange(false);
  };

  // Se as configurações ainda não foram carregadas, não renderize o conteúdo
  if (!localSettings) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações Avançadas</DialogTitle>
          <DialogDescription>
            Configure parâmetros do sistema de códigos de barras.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="prefix">Prefixo padrão para novos códigos</Label>
            <Input
              id="prefix"
              value={localSettings.barcodePrefix}
              onChange={(e) => setLocalSettings(s => ({ ...s, barcodePrefix: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="format">Formato de numeração</Label>
            <Select
              value={localSettings.barcodeFormat}
              onValueChange={(value) => setLocalSettings(s => ({ ...s, barcodeFormat: value }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EAN-13">EAN-13 (Padrão)</SelectItem>
                <SelectItem value="CODE-128">CODE-128</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoGenerate"
              checked={localSettings.barcodeAutoGenerate}
              onCheckedChange={(checked) => setLocalSettings(s => ({ ...s, barcodeAutoGenerate: checked === true }))}
            />
            <Label htmlFor="autoGenerate">Gerar códigos automaticamente para novos produtos</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSaveChanges}>Salvar Configurações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};