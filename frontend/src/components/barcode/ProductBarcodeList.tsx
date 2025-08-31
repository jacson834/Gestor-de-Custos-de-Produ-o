
import { Product } from "@/types/product";
import { ProductBarcodeItem } from "./ProductBarcodeItem";

interface ProductBarcodeListProps {
  products: Product[];
  selectedProducts: number[];
  onToggleSelection: (productId: number) => void;
  onCopy: (text: string) => void;
  onGenerateBarcodeForProduct: (productId: number) => void;
  onGenerateBarcodeForVariation: (productId: number, variationId: string) => void;
}

export const ProductBarcodeList = ({
  products,
  selectedProducts,
  onToggleSelection,
  onCopy,
  onGenerateBarcodeForProduct,
  onGenerateBarcodeForVariation,
}: ProductBarcodeListProps) => {
  return (
    <div className="grid gap-4">
      {products.map((product) => (
        <ProductBarcodeItem
          key={product.id}
          product={product}
          isSelected={selectedProducts.includes(product.id)}
          onToggleSelection={onToggleSelection}
          onCopy={onCopy}
          onGenerateBarcodeForProduct={onGenerateBarcodeForProduct}
          onGenerateBarcodeForVariation={onGenerateBarcodeForVariation}
        />
      ))}
    </div>
  );
};
