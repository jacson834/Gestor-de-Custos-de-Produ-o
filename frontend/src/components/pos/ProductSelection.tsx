import { useState } from "react";
import { Product } from "@/types/product";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ScanLine } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductSelectionProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onScanClick: () => void;
}

export const ProductSelection = ({ products, onAddProduct, onScanClick }: ProductSelectionProps) => {
  const [search, setSearch] = useState("");
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Seleção de Produtos</CardTitle>
        <CardDescription>Clique em um produto para adicionar ao carrinho ou use o leitor de código de barras.</CardDescription>
        <div className="flex gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar produto..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" onClick={onScanClick}>
            <ScanLine className="mr-2 h-4 w-4" />
            Escanear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pr-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} onClick={() => onAddProduct(product)} className="cursor-pointer hover:border-primary transition-colors flex flex-col">
                <div className="aspect-square bg-muted flex items-center justify-center rounded-t-lg">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-t-lg" /> : <span className="text-3xl text-muted-foreground">🍦</span>}
                </div>
                <div className="p-2 flex-1 flex flex-col justify-between">
                  <h3 className="font-semibold text-sm leading-tight h-10 line-clamp-2" title={product.name}>{product.name}</h3>
                  <p className="text-xs text-primary font-bold mt-1">{product.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};