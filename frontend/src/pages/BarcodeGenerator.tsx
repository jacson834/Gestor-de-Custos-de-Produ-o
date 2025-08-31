import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Barcode } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import BarcodeManager from "@/components/BarcodeManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const BarcodeGeneratorPage = () => {
  // Utilizamos o mesmo hook da página de Produtos para obter os dados necessários.
  const { products, settings, updateSettings, isLoading } = useProducts();

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
                  <Barcode className="h-6 w-6" />
                  <h1 className="text-2xl font-bold">Gerador de Código de Barras</h1>
                </div>
              </div>
            </div>
          </header>
          
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Carregando Configurações...</p>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Códigos de Barras</CardTitle>
                  <CardDescription>
                    Gere e atribua códigos de barras para seus produtos e variações.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BarcodeManager 
                    products={products}
                    settings={settings}
                    onSettingsChange={updateSettings}
                    onUpdateProductBarcode={() => {}} 
                    onUpdateVariationBarcode={() => {}} 
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default BarcodeGeneratorPage;