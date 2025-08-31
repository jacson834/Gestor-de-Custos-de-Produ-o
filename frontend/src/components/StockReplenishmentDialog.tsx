// src/components/StockReplenishmentDialog.tsx (Arquivo com Entrada Manual)

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanBarcode, PackagePlus, AlertCircle, CheckCircle } from "lucide-react";
import { BarcodeScannerDialog } from '@/components/BarcodeScannerDialog';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/product';
import { useToast } from "@/hooks/use-toast";

interface StockReplenishmentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (productId: string | number, quantityToAdd: number) => void;
}

export const StockReplenishmentDialog = ({ isOpen, onOpenChange, onConfirm }: StockReplenishmentDialogProps) => {
  const { toast } = useToast();
  const { fetchProductByBarcode } = useProducts();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // AJUSTE FEITO AQUI: Estado para o código de barras digitado manualmente
  const [manualBarcode, setManualBarcode] = useState('');
  
  const [scannerKey, setScannerKey] = useState(0);

  // Esta função agora é chamada tanto pelo scanner quanto pela entrada manual
  const findProductByBarcode = useCallback(async (barcode: string) => {
    setIsScannerOpen(false);
    setErrorMessage('');
    setFoundProduct(null);

    try {
      const product = await fetchProductByBarcode(barcode);
      if (product) {
        setFoundProduct(product);
      } else {
        setErrorMessage(`Produto com o código de barras "${barcode}" não encontrado. Cadastre-o primeiro.`);
      }
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      setErrorMessage("Ocorreu um erro ao buscar o produto. Tente novamente.");
    }
  }, [fetchProductByBarcode]);

  const handleConfirm = () => {
    if (!foundProduct || quantityToAdd <= 0) {
      toast({ title: "Dados inválidos", description: "Encontre um produto e defina uma quantidade positiva.", variant: "destructive" });
      return;
    }
    onConfirm(foundProduct.id, quantityToAdd);
  };
  
  const openScanner = () => {
    setScannerKey(prevKey => prevKey + 1);
    setIsScannerOpen(true);
  };

  // AJUSTE FEITO AQUI: Função para lidar com a submissão manual
  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      findProductByBarcode(manualBarcode.trim());
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFoundProduct(null);
        setQuantityToAdd(1);
        setErrorMessage('');
        setManualBarcode('');
      }, 200);
    }
  }, [isOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><PackagePlus />Reabastecimento de Estoque</DialogTitle>
            <DialogDescription>Escaneie ou digite o código de barras para adicionar ao estoque.</DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <Button className="w-full" onClick={openScanner}><ScanBarcode className="mr-2 h-4 w-4" />Escanear com a Câmera</Button>

            {/* AJUSTE FEITO AQUI: Adicionado o campo de entrada manual */}
            <div className="text-center text-sm text-muted-foreground">ou</div>
            <div className="space-y-2">
              <Label htmlFor="manual-barcode">Digite o Código Manualmente</Label>
              <div className="flex gap-2">
                <Input
                  id="manual-barcode"
                  placeholder="Digite o código de barras..."
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                />
                <Button onClick={handleManualSubmit} variant="secondary">Buscar</Button>
              </div>
            </div>

            {errorMessage && (<div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md"><AlertCircle className="h-5 w-5" /><p className="text-sm">{errorMessage}</p></div>)}
            
            {foundProduct && (
              <div className="space-y-4 pt-4 border-t border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <Label>Produto Encontrado</Label>
                </div>
                <p className="font-semibold text-lg">{foundProduct.name}</p>
                <p className="text-sm text-muted-foreground">Estoque Atual: {foundProduct.stock}</p>
                <div>
                  <Label htmlFor="quantity">Quantidade a Adicionar</Label>
                  <Input id="quantity" type="number" min="1" value={quantityToAdd} onChange={(e) => setQuantityToAdd(Number(e.target.value))} className="text-lg" autoFocus />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleConfirm} disabled={!foundProduct || quantityToAdd <= 0}>Confirmar Abastecimento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <BarcodeScannerDialog key={scannerKey} isOpen={isScannerOpen} onOpenChange={setIsScannerOpen} onBarcodeDetected={findProductByBarcode} />
    </>
  );
};