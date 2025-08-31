
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductBarcodeItemProps {
  product: Product;
  isSelected: boolean;
  onToggleSelection: (productId: number) => void;
  onCopy: (text: string) => void;
  onGenerateBarcodeForProduct: (productId: number) => void;
  onGenerateBarcodeForVariation: (
    productId: number,
    variationId: string
  ) => void;
}

export const ProductBarcodeItem = ({
  product,
  isSelected,
  onToggleSelection,
  onCopy,
  onGenerateBarcodeForProduct,
  onGenerateBarcodeForVariation,
}: ProductBarcodeItemProps) => {
  return (
    <Card className={cn(isSelected && "border-primary bg-accent")}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(product.id)}
              aria-label={`Select product ${product.name}`}
              className="mt-1"
            />
            <div>
              <h3 className="font-medium">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {product.barcode}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCopy(product.barcode)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onGenerateBarcodeForProduct(product.id)}
              className="w-full"
            >
              <QrCode className="h-4 w-4 mr-1" />
              Gerar Novo
            </Button>
          </div>
        </div>

        {/* Variações */}
        {product.variations && product.variations.length > 0 && (
          <div className="mt-4 pl-6 border-l-2 border-border">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Variações:
            </h4>
            <div className="space-y-2">
              {product.variations.map((variation) => (
                <div
                  key={variation.id}
                  className="flex flex-col sm:flex-row items-start justify-between gap-2 bg-muted p-2 rounded"
                >
                  <div>
                    <span className="text-sm font-medium">
                      {variation.name}: {variation.value}
                    </span>
                    {variation.barcode && (
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <code className="text-xs bg-background px-2 py-1 rounded">
                          {variation.barcode}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onCopy(variation.barcode!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onGenerateBarcodeForVariation(product.id, variation.id)
                    }
                    className="w-full sm:w-auto"
                  >
                    {variation.barcode ? "Gerar Novo" : "Gerar Código"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
