// src/components/fichas-tecnicas/FichaTecnicaForm.tsx (Arquivo Novo)

import React, { useState } from 'react';
import { useFichaTecnica, IngredienteFichaTecnica } from '@/hooks/useFichaTecnica';
import { RawMaterial } from '@/types/product';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Trash2, PlusCircle, Save } from "lucide-react";
import { useToast } from '../ui/use-toast';

interface FichaTecnicaFormProps {
  idProdutoVenda: number | string;
  rawMaterials: RawMaterial[]; // Todas as matérias-primas disponíveis
}

export const FichaTecnicaForm = ({ idProdutoVenda, rawMaterials }: FichaTecnicaFormProps) => {
  const { toast } = useToast();
  // Usando nosso novo hook para gerenciar o estado e a lógica
  const { ficha, isLoading, adicionarIngrediente, removerIngrediente, atualizarFicha, salvarFichaTecnica } = useFichaTecnica(idProdutoVenda);

  // Estado local para os campos de "adicionar novo ingrediente"
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');

  const handleAddIngredient = () => {
    if (!selectedMaterialId || !quantity || parseFloat(quantity) <= 0) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, selecione um ingrediente e insira uma quantidade válida.",
        variant: "destructive"
      });
      return;
    }

    const selectedMaterial = rawMaterials.find(m => String(m.id) === selectedMaterialId);
    if (!selectedMaterial) return;

    const novoIngrediente: IngredienteFichaTecnica = {
      id_materia_prima: selectedMaterial.id,
      quantidade: parseFloat(quantity),
      nome_materia_prima: selectedMaterial.name, // Incluímos para exibição imediata
      baseUnit: selectedMaterial.baseUnit,
    };

    adicionarIngrediente(novoIngrediente);
    
    // Limpa os campos após adicionar
    setSelectedMaterialId('');
    setQuantity('');
  };

  if (isLoading) return <div className="p-4 text-center">Carregando Ficha Técnica...</div>;
  if (!ficha) return <div className="p-4 text-center text-red-500">Não foi possível carregar os dados da ficha técnica.</div>;

  return (
    <div className="space-y-6 rounded-lg border p-4">
      {/* Informações Gerais da Receita */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
        <div>
          <Label htmlFor="fichaNome">Nome da Receita (Opcional)</Label>
          <Input id="fichaNome" value={ficha.nome || ''} onChange={(e) => atualizarFicha({ nome: e.target.value })} placeholder="Ex: Receita Base de Ninho" />
        </div>
        <div>
          <Label htmlFor="rendimento">Rendimento</Label>
          <Input id="rendimento" type="number" value={ficha.rendimento} onChange={(e) => atualizarFicha({ rendimento: parseFloat(e.target.value) || 0 })} />
        </div>
        <div>
          <Label htmlFor="unidadeRendimento">Unidade do Rendimento</Label>
          <Select value={ficha.unidade_rendimento} onValueChange={(value) => atualizarFicha({ unidade_rendimento: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="l">Litro (l)</SelectItem>
              <SelectItem value="kg">Quilograma (kg)</SelectItem>
              <SelectItem value="un">Unidade (un)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Seção para Adicionar Novos Ingredientes */}
      <div className="space-y-4">
        <h4 className="font-medium text-lg">Adicionar Ingrediente</h4>
        <div className="flex flex-col md:flex-row items-end gap-2 p-4 border rounded-lg bg-muted/40">
          <div className="flex-1 w-full">
            <Label>Matéria-Prima</Label>
            <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
              <SelectTrigger><SelectValue placeholder="Selecione um ingrediente..." /></SelectTrigger>
              <SelectContent>
                {rawMaterials.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 w-full md:w-auto">
            <Label>Quantidade (em unid. base)</Label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Ex: 100" />
          </div>
          <Button onClick={handleAddIngredient} type="button" className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Lista de Ingredientes Adicionados */}
      <div>
        <h4 className="font-medium text-lg mb-2">Ingredientes da Receita</h4>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingrediente</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead className="text-right w-[80px]">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ficha.ingredientes.length > 0 ? (
                ficha.ingredientes.map(ing => (
                  <TableRow key={ing.id_materia_prima}>
                    <TableCell className="font-medium">{ing.nome_materia_prima}</TableCell>
                    <TableCell>{ing.quantidade} {ing.baseUnit}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => removerIngrediente(ing.id_materia_prima)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">Nenhum ingrediente adicionado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Botão de Salvar */}
      <div className="flex justify-end pt-6">
        <Button onClick={salvarFichaTecnica}>
            <Save className="mr-2 h-4 w-4"/>
            Salvar Ficha Técnica
        </Button>
      </div>
    </div>
  );
};