import { useState } from "react";
import { Search, ShoppingBag, Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onCartClick: () => void;
  onAIClick: () => void;
  cartItemCount?: number;
}

export default function Header({ onCartClick, onAIClick, cartItemCount = 0 }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const categories = ["New Arrivals", "Women", "Men", "Accessories", "Sale"];

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
              LUXE
            </h1>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            {categories.map((category) => (
              <button
                key={category}
                className="text-sm font-medium tracking-wide hover-elevate active-elevate-2 px-3 py-1.5 rounded-md transition-colors"
                data-testid={`link-category-${category.toLowerCase().replace(' ', '-')}`}
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
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                data-testid="input-search"
              />
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
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className="text-left px-3 py-2 text-sm font-medium tracking-wide hover-elevate active-elevate-2 rounded-md"
                  data-testid={`link-mobile-${category.toLowerCase().replace(' ', '-')}`}
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
