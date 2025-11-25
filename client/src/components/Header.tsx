import { useState, useEffect } from "react";
import { Search, ShoppingBag, Sparkles, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { productService } from "@/lib/products";
import { useQuery } from "@tanstack/react-query";
import type { User as UserType } from "@/lib/auth";

interface HeaderProps {
  onCartClick: () => void;
  onAIClick: () => void;
  onAuthClick: () => void;
  cartItemCount?: number;
  user?: UserType | null;
  categories?: string[];
  onCategoryClick?: (category: string) => void;
  activeCategory?: string | null;
}

export default function Header({ onCartClick, onAIClick, onAuthClick, cartItemCount = 0, user, categories: categoriesProp, onCategoryClick, activeCategory }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const categories = categoriesProp && categoriesProp.length > 0 ? categoriesProp : ["All"];

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search products
  const { data: searchResults } = useQuery({
    queryKey: ['/api/products/search', debouncedQuery],
    queryFn: () => productService.searchProducts(debouncedQuery, 5),
    enabled: debouncedQuery.length > 2,
  });

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-6">
            <button 
              className="lg:hidden" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <h1 className="font-serif text-2xl font-light tracking-wide" data-testid="text-logo">
              Team10
            </h1>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            {categories.map((category) => (
              <button
                key={category}
                className={`text-sm font-medium tracking-wide px-3 py-1.5 rounded-md transition-colors ${activeCategory === category ? 'bg-primary/10 text-primary' : 'hover-elevate active-elevate-2'}`}
                data-testid={`link-category-${category.toLowerCase().replace(' ', '-')}`}
                onClick={() => onCategoryClick && onCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </nav>

          <div className={`flex-1 max-w-md mx-4 transition-all ${searchFocused ? 'max-w-lg' : ''}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for products..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                data-testid="input-search"
              />
              {searchFocused && searchResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-popover border rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      className="w-full flex items-center gap-3 p-3 hover-elevate active-elevate-2 text-left"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchFocused(false);
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onAIClick}
              className="relative"
              data-testid="button-ai-assistant"
            >
              <Sparkles className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onCartClick}
              className="relative"
              data-testid="button-cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                  data-testid="text-cart-count"
                >
                  {cartItemCount}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onAuthClick}
              data-testid="button-account"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`text-left px-3 py-2 text-sm font-medium tracking-wide rounded-md ${activeCategory === category ? 'bg-primary/10 text-primary' : 'hover-elevate active-elevate-2'}`}
                  data-testid={`link-mobile-${category.toLowerCase().replace(' ', '-')}`}
                  onClick={() => {
                    onCategoryClick && onCategoryClick(category);
                    setMobileMenuOpen(false);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
