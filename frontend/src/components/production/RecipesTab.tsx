import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, UtensilsCrossed, Edit } from 'lucide-react';
import { useRawMaterials } from '@/hooks/useRawMaterials'; // <-- Ponto chave: usa o mesmo hook da aba de Matérias-Primas
import { useRecipes } from '@/hooks/useRecipes'; // Hook para salvar as receitas
import { Recipe, RecipeIngredient } from '@/types/production';
import { RawMaterial } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const EMPTY_RECIPE: Recipe = {
  id: '',
  name: '',
  ingredients: [],
  yield: 1,
  yieldUnit: 'unidades'
};

const RecipesTab = () => {
  const { rawMaterials, isLoading: isLoadingMaterials } = useRawMaterials(); // <-- Lê as matérias-primas
  const { recipes, addRecipe, updateRecipe, deleteRecipe, isLoading: isLoadingRecipes } = useRecipes(); // <-- Lê e gerencia as receitas
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>(EMPTY_RECIPE);
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenDialog = (recipe?: Recipe) => {
    if (recipe) {
      setCurrentRecipe(recipe);
      setIsEditing(true);
    } else {
      setCurrentRecipe({ ...EMPTY_RECIPE, id: uuidv4() });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleAddIngredient = () => {
    setCurrentRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { id: uuidv4(), rawMaterialId: '', quantity: 0 }]
    }));
  };

  const handleRemoveIngredient = (id: string) => {
    setCurrentRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.id !== id)
    }));
  };

  const handleIngredientChange = (id: string, field: keyof RecipeIngredient, value: any) => {
    setCurrentRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => 
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const handleSaveRecipe = () => {
    if (isEditing) {
      updateRecipe(currentRecipe);
    } else {
      addRecipe(currentRecipe);
    }
    setIsDialogOpen(false);
    setCurrentRecipe(EMPTY_RECIPE);
  };

  const calculateCost = useMemo(() => {
    let totalCost = 0;
    const ingredientCosts = currentRecipe.ingredients.map(ingredient => {
      const material = rawMaterials.find(rm => rm.id.toString() === ingredient.rawMaterialId.toString());
      if (!material || !ingredient.quantity) {
        return { id: ingredient.id, cost: 0 };
      }
      const cost = material.cost * ingredient.quantity;
      totalCost += cost;
      return { id: ingredient.id, cost };
    });
    return { totalCost, ingredientCosts };
  }, [currentRecipe.ingredients, rawMaterials]);

  const calculateRecipeCost = (recipe: Recipe) => {
    return recipe.ingredients.reduce((total, ingredient) => {
      const material = rawMaterials.find(rm => rm.id.toString() === ingredient.rawMaterialId.toString());
      if (!material) return total;
      return total + (material.cost * ingredient.quantity);
    }, 0);
  };

  if (isLoadingMaterials || isLoadingRecipes) return <p>Carregando dados...</p>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Receitas</CardTitle>
          <CardDescription>Crie e gerencie as receitas dos seus produtos.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            setCurrentRecipe(EMPTY_RECIPE);
            setIsEditing(false);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Receita' : 'Criar Nova Receita'}</DialogTitle>
              <DialogDescription>
                Adicione os ingredientes e suas quantidades para calcular o custo final.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recipe-name" className="text-right">Nome</Label>
                <Input id="recipe-name" value={currentRecipe.name} onChange={(e) => setCurrentRecipe(p => ({...p, name: e.target.value}))} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recipe-yield" className="text-right">Rendimento</Label>
                <Input id="recipe-yield" type="number" value={currentRecipe.yield} onChange={(e) => setCurrentRecipe(p => ({...p, yield: Number(e.target.value)}))} className="col-span-1" />
                <Input id="recipe-yield-unit" value={currentRecipe.yieldUnit} onChange={(e) => setCurrentRecipe(p => ({...p, yieldUnit: e.target.value}))} className="col-span-2" />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Ingredientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative max-h-[240px] overflow-y-auto pr-2">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="w-[40%]">Ingrediente</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Unidade</TableHead>
                          <TableHead className="text-right">Custo</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentRecipe.ingredients.map((ing) => {
                          const material = rawMaterials.find(rm => rm.id.toString() === ing.rawMaterialId.toString());
                          const lineCost = calculateCost.ingredientCosts.find(ic => ic.id === ing.id)?.cost || 0;
                          return (
                            <TableRow key={ing.id}>
                              <TableCell>
                                <Select onValueChange={(val) => handleIngredientChange(ing.id, 'rawMaterialId', val)} value={ing.rawMaterialId.toString()}>
                                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                  <SelectContent>
                                    {rawMaterials.map((rm: RawMaterial) => (
                                      <SelectItem key={rm.id} value={rm.id.toString()}>{rm.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input type="number" value={ing.quantity} onChange={(e) => handleIngredientChange(ing.id, 'quantity', parseFloat(e.target.value) || 0)} />
                              </TableCell>
                              <TableCell className="text-muted-foreground">{material?.unit || '-'}</TableCell>
                              <TableCell className="text-right font-mono">{formatCurrency(lineCost)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveIngredient(ing.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4" onClick={handleAddIngredient}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Ingrediente
                  </Button>
                </CardContent>
              </Card>

              <div className="mt-4 flex justify-end items-center gap-4">
                <span className="text-lg font-semibold">Valor de Custo Total:</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(calculateCost.totalCost)}</span>
              </div>

            </div>
            <DialogFooter>
              <Button onClick={handleSaveRecipe}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {recipes.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            <UtensilsCrossed className="mx-auto h-12 w-12" />
            <p className="mt-4">Nenhuma receita criada ainda.</p>
            <p>Clique em "Nova Receita" para começar.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Receita</TableHead>
                <TableHead>Rendimento</TableHead>
                <TableHead className="text-right">Custo Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map(recipe => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">{recipe.name}</TableCell>
                  <TableCell>{recipe.yield} {recipe.yieldUnit}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(calculateRecipeCost(recipe))}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(recipe)}>
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
                            Esta ação não pode ser desfeita. Isso removerá permanentemente a receita "{recipe.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteRecipe(recipe.id)}>Sim, remover</AlertDialogAction>
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
  );
};

export default RecipesTab;