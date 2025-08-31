import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, Edit, Package } from 'lucide-react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { RawMaterial } from '@/types/product';

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const EMPTY_MATERIAL: Omit<RawMaterial, 'id'> = {
  name: '',
  unit: 'kg',
  cost: 0,
};

const RawMaterialsTab = () => {
  const { rawMaterials, addRawMaterial, updateRawMaterial, deleteRawMaterial, isLoading } = useRawMaterials();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<RawMaterial | Omit<RawMaterial, 'id'>>(EMPTY_MATERIAL);
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenDialog = (material?: RawMaterial) => {
    if (material) {
      setMaterialToEdit(material);
      setIsEditing(true);
    } else {
      setMaterialToEdit(EMPTY_MATERIAL);
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!materialToEdit.name || materialToEdit.cost < 0) {
      // Adicionar validação e toast de erro se necessário
      return;
    }
    if (isEditing) {
      updateRawMaterial(materialToEdit as RawMaterial);
    } else {
      addRawMaterial(materialToEdit);
    }
    setIsDialogOpen(false);
  };

  const handleFieldChange = (field: keyof RawMaterial, value: string | number) => {
    setMaterialToEdit(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <p>Carregando matérias-primas...</p>;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Matérias-Primas</CardTitle>
            <CardDescription>Cadastre e gerencie os insumos para suas receitas.</CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Matéria-Prima
          </Button>
        </CardHeader>
        <CardContent>
          {rawMaterials.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              <Package className="mx-auto h-12 w-12" />
              <p className="mt-4">Nenhuma matéria-prima cadastrada.</p>
              <p>Clique no botão acima para começar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Custo Unitário</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rawMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>{formatCurrency(material.cost)} / {material.unit}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(material)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso removerá permanentemente a matéria-prima "{material.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteRawMaterial(material.id)}>
                              Sim, remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Matéria-Prima' : 'Adicionar Matéria-Prima'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input id="name" value={materialToEdit.name} onChange={(e) => handleFieldChange('name', e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cost" className="text-right">Custo</Label>
              <Input id="cost" type="number" value={materialToEdit.cost} onChange={(e) => handleFieldChange('cost', parseFloat(e.target.value) || 0)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">Unidade</Label>
              <Select onValueChange={(value: RawMaterial['unit']) => handleFieldChange('unit', value)} value={materialToEdit.unit}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Quilograma (kg)</SelectItem>
                  <SelectItem value="g">Grama (g)</SelectItem>
                  <SelectItem value="l">Litro (l)</SelectItem>
                  <SelectItem value="ml">Mililitro (ml)</SelectItem>
                  <SelectItem value="un">Unidade (un)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RawMaterialsTab;