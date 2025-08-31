import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecipesTab from "./RecipesTab";
import RawMaterialsTab from "./RawMaterialsTab";
import { NotebookText, Package } from "lucide-react";

const UnifiedProductionModule = () => {
  return (
    <Tabs defaultValue="recipes" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="recipes" className="gap-2">
          <NotebookText className="h-4 w-4" /> Receitas
        </TabsTrigger>
        <TabsTrigger value="materials" className="gap-2">
          <Package className="h-4 w-4" /> Matérias-Primas
        </TabsTrigger>
      </TabsList>
      <TabsContent value="recipes" className="mt-6">
        <RecipesTab />
      </TabsContent>
      <TabsContent value="materials" className="mt-6">
        <RawMaterialsTab />
      </TabsContent>
    </Tabs>
  );
};

export default UnifiedProductionModule;