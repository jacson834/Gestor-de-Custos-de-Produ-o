import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Barcode, Printer, Download, Settings, Trash2, CheckSquare } from "lucide-react";

// Define as "props" que o componente espera receber do componente pai
interface BarcodeManagerActionsProps {
  onSelectAll: () => void;
  onClearSelection: () => void;
  onPrintClick: () => void;
  onExport: () => void;
  onSettingsClick: () => void;
  selectedCount: number;
}

export const BarcodeManagerActions = ({
  onSelectAll,
  onClearSelection,
  onPrintClick,
  onExport,
  onSettingsClick,
  selectedCount,
}: BarcodeManagerActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Barcode className="h-5 w-5" />
          Sistema de Códigos de Barras
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onSelectAll} variant="outline">
            <CheckSquare className="h-4 w-4 mr-2" />
            Selecionar Todos
          </Button>
          <Button 
            onClick={onClearSelection} 
            variant="outline" 
            disabled={selectedCount === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Seleção
          </Button>
          <Button onClick={onPrintClick} disabled={selectedCount === 0}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Etiquetas ({selectedCount})
          </Button>
          <Button onClick={onExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Códigos
          </Button>
          <Button onClick={onSettingsClick} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};