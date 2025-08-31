// src/pages/Products.tsx (Arquivo Corrigido)

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Package, PackagePlus } from "lucide-react";
import { ProductStats } from "@/components/products/ProductStats";
import { ProductList } from "@/components/products/ProductList";
import { LowStockAlerts } from "@/components/products/LowStockAlerts";
import { ValidityAlerts } from "@/components/products/ValidityAlerts";
import { ProductAnalytics } from "@/components/products/ProductAnalytics";
import { ProductSettings } from "@/components/products/ProductSettings";
import { ProductDialog } from "@/components/products/ProductDialog";
import { useProducts } from "@/hooks/useProducts";
import BarcodeManager from "@/components/BarcodeManager";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StockReplenishmentDialog } from "@/components/StockReplenishmentDialog";

const Products = () => {
  const stock = useProducts();

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
                  <Package className="h-6 w-6" />
                  {/* AJUSTE FEITO AQUI: Título da página */}
                  <h1 className="text-2xl font-bold">Produtos de Venda</h1>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </header>
          
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {stock.isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Carregando Dados...</p>
              </div>
            ) : (
              <>
                <ProductStats 
                  totalProducts={stock.products.length}
                  lowStockCount={stock.lowStockProducts.length}
                  totalStockValue={stock.getTotalStockValue()}
                  validityAlertCount={(stock.expired?.length || 0) + (stock.expiringSoon?.length || 0)}
                  expiredCount={stock.expired?.length || 0}
                />

                <Tabs defaultValue="products" className="w-full">
                  <TabsList className="grid w-full grid-cols-6">
                    {/* AJUSTE FEITO AQUI: Título da Aba */}
                    <TabsTrigger value="products">Produtos de Venda</TabsTrigger>
                    <TabsTrigger value="barcodes">Códigos de Barras</TabsTrigger>
                    <TabsTrigger value="alerts">Alertas</TabsTrigger>
                    <TabsTrigger value="validity">Validade</TabsTrigger>
                    <TabsTrigger value="analytics">Análises</TabsTrigger>
                    <TabsTrigger value="settings">Configurações</TabsTrigger>
                  </TabsList>

                  <TabsContent value="products" className="mt-6 space-y-6">
                    <div className="flex justify-between items-center gap-4">
                      <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input 
                          placeholder="Buscar por nome..." 
                          value={stock.searchTerm} 
                          onChange={(e) => stock.setSearchTerm(e.target.value)} 
                          className="pl-10" 
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => stock.setIsReplenishmentDialogOpen(true)}>
                          <PackagePlus className="h-4 w-4 mr-2" />
                          Abastecimento de Estoque
                        </Button>
                        {/* AJUSTE FEITO AQUI: Texto do Botão */}
                        <Button onClick={stock.openNewProductDialog}>
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Produto de Venda
                        </Button>
                      </div>
                    </div>
                    <Card>
                      {/* AJUSTE FEITO AQUI: Título da Lista */}
                      <CardHeader><CardTitle>Lista de Produtos de Venda</CardTitle></CardHeader>
                      <CardContent>
                        <ProductList 
                          products={stock.sortedAndFilteredProducts} 
                          onEdit={stock.handleEdit} 
                          onDelete={stock.handleDelete} 
                          getTotalStock={stock.getTotalStock}
                          handleStatusToggle={stock.handleStatusToggle}
                          requestSort={stock.requestSort}
                          sortConfig={stock.sortConfig}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="barcodes" className="mt-6">
                    <BarcodeManager 
                      products={stock.products}
                      settings={stock.settings}
                      onSettingsChange={stock.updateSettings}
                      onUpdateProductBarcode={() => {}} 
                      onUpdateVariationBarcode={() => {}} 
                    />
                  </TabsContent>
                  <TabsContent value="alerts" className="mt-6">
                    <LowStockAlerts lowStockProducts={stock.lowStockProducts} onEdit={stock.handleEdit} getTotalStock={stock.getTotalStock} />
                  </TabsContent>
                  <TabsContent value="validity" className="mt-6">
                    <ValidityAlerts expired={stock.expired || []} expiringSoon={stock.expiringSoon || []} />
                  </TabsContent>
                  <TabsContent value="analytics" className="mt-6">
                    <ProductAnalytics products={stock.products} categories={stock.categories} />
                  </TabsContent>
                  <TabsContent value="settings" className="mt-6">
                    <ProductSettings 
                      categories={stock.categories} 
                      settings={stock.settings} 
                      addCategory={stock.addCategory} 
                      deleteCategory={stock.deleteCategory} 
                      updateSettings={stock.updateSettings} 
                    />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </main>
        
        <ProductDialog 
          isOpen={stock.isDialogOpen}
          onOpenChange={stock.setIsDialogOpen}
          editingProduct={stock.editingProduct}
          formData={stock.formData}
          setFormData={stock.setFormData}
          handleSubmit={stock.handleSubmit}
          categories={stock.categories || []}
        />

        <StockReplenishmentDialog
          isOpen={stock.isReplenishmentDialogOpen}
          onOpenChange={stock.setIsReplenishmentDialogOpen}
          onConfirm={stock.handleReplenishment}
        />
      </div>
    </SidebarProvider>
  );
};

export default Products;