import { useState, useEffect } from "react";
import { Heart, Camera, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, t } from "@/lib/utils";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  ratingAverage?: number;
  ratingCount?: number;
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
  const { toast } = useToast();

  // Load wishlist state from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      const wishlist = JSON.parse(savedWishlist);
      setIsWishlisted(wishlist.includes(product.id));
    }
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newWishlistedState = !isWishlisted;
    setIsWishlisted(newWishlistedState);
    
    // Update localStorage
    const savedWishlist = localStorage.getItem('wishlist');
    let wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
    
    if (newWishlistedState) {
      wishlist.push(product.id);
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    } else {
      wishlist = wishlist.filter((id: string) => id !== product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  const handleVisualSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onVisualSearch) {
      onVisualSearch(product);
    }
  };

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
          onClick={toggleWishlist}
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
              onClick={handleAddToCart}
              data-testid={`button-add-cart-${product.id}`}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              {t('Add to Cart')}
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="bg-white/95 backdrop-blur-sm"
              onClick={handleVisualSearch}
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
          {formatPrice(product.price)}
        </p>
        {typeof product.ratingAverage === 'number' && (
          <div className="mt-2 flex items-center gap-2" data-testid={`rating-${product.id}`}>
            <div className="flex items-center">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`h-4 w-4 ${i <= Math.round((product.ratingAverage || 0)) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{(product.ratingAverage || 0).toFixed(1)} ({product.ratingCount || 0})</span>
          </div>
        )}
      </div>
    </Card>
  );
}
