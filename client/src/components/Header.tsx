import { useState, useEffect, useRef } from "react";
import { Search, ShoppingBag, Sparkles, Menu, X, User, LogOut, Settings, Package, Globe, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { productService } from "@/lib/products";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { User as UserType } from "@/lib/auth";
import { authService } from "@/lib/auth";
import { formatPrice, getCurrency, setCurrency, getLanguage, setLanguage, t } from "@/lib/utils";

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
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [, setLocation] = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const openSettings = () => setLocation('/account/settings');
  const [currency, setCurrencyState] = useState(getCurrency());
  const [language, setLanguageState] = useState(getLanguage());

  const categories = categoriesProp && categoriesProp.length > 0 ? categoriesProp : ["All"];

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.signOut();
      // Refresh the page to clear all user data
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  // Search products
  const { data: searchResults } = useQuery({
    queryKey: ['/api/products/search', debouncedQuery],
    queryFn: () => productService.searchProducts(debouncedQuery, 5),
    enabled: debouncedQuery.length > 2,
  });
  const { data: recommended = [] } = useQuery({
    queryKey: ['/api/products/recommended'],
    queryFn: () => productService.getRecommendedProducts(),
  });
  const displayedProducts = (searchQuery.trim().length > 2 ? (searchResults || []) : recommended.slice(0,20));

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

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

          <div className="hidden lg:flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-sm font-medium tracking-wide">
                  Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    className={`${activeCategory === category ? 'text-primary' : ''}`}
                    data-testid={`menu-category-${category.toLowerCase().replace(' ', '-')}`}
                    onClick={() => onCategoryClick && onCategoryClick(category)}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className={`flex-1 max-w-md mx-4 transition-all ${searchFocused ? 'max-w-lg' : ''}`}>
            <div className="relative" ref={dropdownRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for products..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim().length > 0) {
                    setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchFocused(false);
                  }
                  if (e.key === 'Escape') {
                    setSearchFocused(false);
                    setHighlightedIndex(-1);
                  }
                  if (e.key === 'ArrowDown' && displayedProducts && displayedProducts.length > 0) {
                    e.preventDefault();
                    setHighlightedIndex((prev) => Math.min(prev + 1, displayedProducts.length - 1));
                  }
                  if (e.key === 'ArrowUp' && displayedProducts && displayedProducts.length > 0) {
                    e.preventDefault();
                    setHighlightedIndex((prev) => Math.max(prev - 1, 0));
                  }
                  if (e.key === 'Enter' && highlightedIndex >= 0 && displayedProducts && displayedProducts[highlightedIndex]) {
                    e.preventDefault();
                    const p = displayedProducts[highlightedIndex];
                    setLocation(`/product/${p.id}`);
                    setSearchFocused(false);
                  }
                }}
                aria-label="Search"
                data-testid="input-search"
              />
              {searchQuery && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => { setSearchQuery(""); setHighlightedIndex(-1); }}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {searchFocused && displayedProducts && displayedProducts.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-popover border rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
                  {searchQuery.trim().length <= 2 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground uppercase tracking-wide">Recommended</div>
                  )}
                  {displayedProducts.map((product, idx) => (
                    <button
                      key={product.id}
                      className={`w-full flex items-center gap-3 p-3 text-left ${idx === highlightedIndex ? 'bg-muted' : 'hover-elevate active-elevate-2'}`}
                      onClick={() => {
                        setSearchQuery("");
                        setSearchFocused(false);
                        setLocation(`/product/${product.id}`);
                      }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                      </div>
                    </button>
                  ))}
                  {searchQuery.trim().length > 0 && (
                    <button
                      className="w-full text-left p-3 text-sm text-muted-foreground hover:bg-muted"
                      onClick={() => {
                        setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                        setSearchFocused(false);
                      }}
                    >
                      View all results for "{searchQuery.trim()}"
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-language-currency">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Language</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => { setLanguage('en'); setLanguageState('en'); }}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setLanguage('vi'); setLanguageState('vi'); }}>Tiếng Việt</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Currency</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => { setCurrency('USD'); setCurrencyState('USD'); }}>
                  <DollarSign className="h-4 w-4 mr-2" /> USD
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setCurrency('EUR'); setCurrencyState('EUR'); }}>
                  <DollarSign className="h-4 w-4 mr-2" /> EUR
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setCurrency('VND'); setCurrencyState('VND'); }}>
                  <DollarSign className="h-4 w-4 mr-2" /> VND
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/seller/dashboard')}
              aria-label="Seller account"
              data-testid="button-seller"
            >
              {t('Seller')}
            </Button>
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

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="button-account"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{user.fullname}</p>
                    <p className="text-muted-foreground text-xs">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => setLocation('/account/orders')}>
                    <Package className="h-4 w-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={openSettings}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-destructive"
                  >
                    {isLoggingOut ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Logging out...
                      </div>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={onAuthClick}
                data-testid="button-account"
              >
                <User className="h-5 w-5" />
              </Button>
            )}
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
