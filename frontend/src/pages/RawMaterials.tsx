// src/pages/RawMaterials.tsx (Versão com a Tag Corrigida)

import { useState, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Factory } from "lucide-react";
import { RawMaterialList } from "@/components/raw-materials/RawMaterialList";
import { RawMaterialDialog } from "@/components/raw-materials/RawMaterialDialog";
import { RawMaterial } from "@/types/product";
import { RawMaterialFormData } from "@/components/raw-materials/RawMaterialForm";

const RawMaterials = () => {
  const { rawMaterials, suppliers, addRawMaterial, updateRawMaterial, deleteRawMaterial, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  const filteredRawMaterials = useMemo(() => {
    if (!rawMaterials) return [];
    return rawMaterials.filter(material =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rawMaterials, searchTerm]);

  const handleNewClick = () => {
    setEditingMaterial(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (material: RawMaterial) => {
    setEditingMaterial(material);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: Partial<RawMaterialFormData>, id?: string | number) => {
    try {
      if (id) {
        await updateRawMaterial({ ...data, id } as RawMaterial);
      } else {
        await addRawMaterial(data as Omit<RawMaterial, 'id'>);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Falha ao salvar matéria-prima", error);
    }
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen w-full">Carregando Dados...</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="border-b bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <Factory className="h-6 w-6" />
                  <h1 className="text-2xl font-bold">Matérias-Primas</h1>
                </div>
              </div>
            </div>
          </header>
          
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar matéria-prima..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Button onClick={handleNewClick} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nova Matéria-Prima
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Matérias-Primas</CardTitle>
                <CardDescription>Gerencie os ingredientes e componentes para a produção.</CardDescription>
              </CardHeader> {/* AJUSTE FEITO AQUI: A tag de fechamento foi corrigida de </Header> para </CardHeader> */}
              <CardContent>
                <RawMaterialList
                  rawMaterials={filteredRawMaterials}
                  onEdit={handleEditClick}
                  onDelete={deleteRawMaterial}
                />
              </CardContent>
            </Card>

            <RawMaterialDialog
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              editingMaterial={editingMaterial}
              onSave={handleSave}
              suppliers={suppliers || []}
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default RawMaterials;