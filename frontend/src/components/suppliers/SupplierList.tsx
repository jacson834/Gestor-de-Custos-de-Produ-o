import { Supplier } from "@/types/product";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface SupplierListProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplierId: number | string) => void;
}

export const SupplierList = ({ suppliers, onEdit, onDelete }: SupplierListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome / Empresa</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead className="hidden sm:table-cell">Email</TableHead>
          <TableHead className="hidden md:table-cell">Telefone</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.map((supplier) => (
          <TableRow key={supplier.id}>
            <TableCell>
              <div className="font-medium">{supplier.name}</div>
              <div className="text-sm text-muted-foreground md:hidden">{supplier.cnpj || ''}</div>
            </TableCell>
            <TableCell>{supplier.contactPerson || '-'}</TableCell>
            <TableCell className="hidden sm:table-cell">{supplier.email || '-'}</TableCell>
            <TableCell className="hidden md:table-cell">{supplier.phone || '-'}</TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="icon" onClick={() => onEdit(supplier)} title="Editar Fornecedor">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => onDelete(supplier.id)} title="Deletar Fornecedor">
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