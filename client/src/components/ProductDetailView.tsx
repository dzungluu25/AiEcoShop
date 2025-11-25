import { useState } from "react";
import { Heart, Camera, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export interface ProductDetail {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  description: string;
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
}

interface ProductDetailViewProps {
  product: ProductDetail;
  onAddToCart?: (product: ProductDetail, size?: string) => void;
  onTryOn?: () => void;
}

export default function ProductDetailView({ product, onAddToCart, onTryOn }: ProductDetailViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [isWishlisted, setIsWishlisted] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden group">
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
              data-testid="img-main-product"
            />
            
            {product.images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={prevImage}
                  data-testid="button-prev-image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={nextImage}
                  data-testid="button-next-image"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex ? 'border-primary' : 'border-transparent'
                  }`}
                  data-testid={`button-thumbnail-${index}`}
                >
                  <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2" data-testid="text-category">
              {product.category}
            </Badge>
            <h1 className="font-serif text-4xl mb-3" data-testid="text-product-name">
              {product.name}
            </h1>
            <p className="text-3xl font-semibold mb-4" data-testid="text-product-price">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
              {product.description}
            </p>
          </div>

          <Separator />

          {product.sizes && product.sizes.length > 0 && (
            <div>
              <Label className="text-sm font-medium uppercase tracking-wide mb-3 block">
                Select Size
              </Label>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <div key={size}>
                      <RadioGroupItem
                        value={size}
                        id={`size-${size}`}
                        className="peer sr-only"
                        data-testid={`radio-size-${size.toLowerCase()}`}
                      />
                      <Label
                        htmlFor={`size-${size}`}
                        className="flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover-elevate active-elevate-2"
                      >
                        {size}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              disabled={!product.inStock}
              onClick={() => onAddToCart?.(product, selectedSize)}
              data-testid="button-add-to-cart"
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setIsWishlisted(!isWishlisted);
              }}
              data-testid="button-wishlist"
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              data-testid="button-share"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <Button
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={onTryOn}
            data-testid="button-try-on"
          >
            <Camera className="h-5 w-5 mr-2" />
            Try On Virtually
          </Button>

          <div className="bg-muted/50 rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Free shipping on orders over $100</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Free returns within 30 days</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Secure checkout guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
