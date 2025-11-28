import { useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ProductCard, { type Product } from "./ProductCard";
import { formatPrice, convertUsdToCurrency, convertCurrencyToUsd, getCurrency } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onVisualSearch?: (product: Product) => void;
}

export default function ProductGrid({ 
  products, 
  onProductClick,
  onAddToCart,
  onVisualSearch 
}: ProductGridProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRangeUsd, setPriceRangeUsd] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState("featured");

  const categories = Array.from(new Set(products.map(p => p.category)));
  
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRangeUsd([0, 500]);
  };

  const filteredProducts = products.filter(product => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }
    if (product.price < priceRangeUsd[0] || product.price > priceRangeUsd[1]) {
      return false;
    }
    return true;
  });

  const FilterContent = () => (
    <div className="space-y-6">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <span className="text-sm font-medium uppercase tracking-wide">Category</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-3">
          {categories.map(category => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
                data-testid={`checkbox-${category.toLowerCase()}`}
              />
              <Label htmlFor={`cat-${category}`} className="text-sm cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
          <span className="text-sm font-medium uppercase tracking-wide">Price Range</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <Slider
            value={[convertUsdToCurrency(priceRangeUsd[0]), convertUsdToCurrency(priceRangeUsd[1])]}
            onValueChange={(v)=>setPriceRangeUsd([convertCurrencyToUsd(v[0]), convertCurrencyToUsd(v[1])])}
            min={convertUsdToCurrency(0)}
            max={convertUsdToCurrency(500)}
            step={Math.max(1, Math.round(convertUsdToCurrency(500)/50))}
            className="w-full"
            data-testid="slider-price"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span data-testid="text-price-min">{formatPrice(priceRangeUsd[0])}</span>
            <span data-testid="text-price-max">{formatPrice(priceRangeUsd[1])}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden" data-testid="button-filters">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>

          {selectedCategories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedCategories.map(cat => (
                <Badge 
                  key={cat} 
                  variant="secondary" 
                  className="gap-1"
                  data-testid={`badge-filter-${cat.toLowerCase()}`}
                >
                  {cat}
                  <button onClick={() => toggleCategory(cat)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                data-testid="button-clear-filters"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border rounded-md px-3 py-1.5 bg-background"
            data-testid="select-sort"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <FilterContent />
            {(selectedCategories.length > 0 || priceRangeUsd[0] !== 0 || priceRangeUsd[1] !== 500) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full mt-6"
                data-testid="button-clear-all"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </aside>

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onProductClick}
                onAddToCart={onAddToCart}
                onVisualSearch={onVisualSearch}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16" data-testid="text-no-results">
              <p className="text-muted-foreground mb-4">No products found matching your filters.</p>
              <Button onClick={clearFilters} data-testid="button-reset-filters">
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
