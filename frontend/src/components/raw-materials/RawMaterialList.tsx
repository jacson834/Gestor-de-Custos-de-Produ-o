// src/components/raw-materials/RawMaterialList.tsx (Arquivo Novo)

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { RawMaterial } from "@/types/product";

interface RawMaterialListProps {
  rawMaterials: RawMaterial[];
  onEdit: (material: RawMaterial) => void;
  onDelete: (materialId: number | string) => void;
}

// Função para formatar valores monetários
const formatCurrency = (value?: number) => {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const RawMaterialList = ({ rawMaterials, onEdit, onDelete }: RawMaterialListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome da Matéria-Prima</TableHead>
          <TableHead>Unidade de Compra</TableHead>
          <TableHead>Preço de Compra</TableHead>
          <TableHead>Estoque (Unid. Base)</TableHead>
          <TableHead>Custo por Unid. Base</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rawMaterials.map((material) => (
          <TableRow key={material.id}>
            <TableCell className="font-medium">{material.name}</TableCell>
            <TableCell>{material.unitOfPurchase || '-'}</TableCell>
            <TableCell>{formatCurrency(material.purchasePrice)}</TableCell>
            <TableCell>
              {material.totalQuantityInBaseUnit} {material.baseUnit}
            </TableCell>
            <TableCell>{formatCurrency(material.costPerBaseUnit)}</TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="icon" onClick={() => onEdit(material)} title="Editar Matéria-Prima">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => onDelete(material.id)} title="Deletar Matéria-Prima">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};