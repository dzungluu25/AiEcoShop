import { useState } from "react";
import { Heart, Camera, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onVisualSearch?: (product: Product) => void;
}

export default function ProductCard({ 
  product, 
  onQuickView,
  onAddToCart,
  onVisualSearch 
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="group overflow-hidden hover-elevate cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onQuickView?.(product)}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          data-testid={`img-product-${product.id}`}
        />
        
        <button
          className={`absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 transition-all ${
            isHovered || isWishlisted ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          data-testid={`button-wishlist-${product.id}`}
        >
          <Heart 
            className={`h-4 w-4 ${isWishlisted ? 'fill-destructive text-destructive' : 'text-foreground'}`} 
          />
        </button>

        {isHovered && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center gap-2 p-4">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/95 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart?.(product);
              }}
              data-testid={`button-add-cart-${product.id}`}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="bg-white/95 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                onVisualSearch?.(product);
              }}
              data-testid={`button-visual-search-${product.id}`}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1" data-testid={`text-category-${product.id}`}>
          {product.category}
        </p>
        <h3 className="font-serif text-xl mb-2" data-testid={`text-name-${product.id}`}>
          {product.name}
        </h3>
        <p className="text-2xl font-semibold" data-testid={`text-price-${product.id}`}>
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Card>
  );
}
