import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/lib/products";
import ProductGrid from "@/components/ProductGrid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";

export default function SearchResults() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") || "";

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products/search", q],
    queryFn: () => productService.searchProducts(q, 50),
    enabled: q.length > 0,
  });

  const cartCount = (() => {
    try {
      const stored = localStorage.getItem('cart_items');
      const items = stored ? JSON.parse(stored) : [];
      return items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);
    } catch { return 0; }
  })();

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onCartClick={() => { localStorage.setItem('open_cart','1'); setLocation('/'); }}
        onAIClick={() => { localStorage.setItem('open_ai','1'); setLocation('/'); }}
        onAuthClick={() => { localStorage.setItem('open_auth','1'); setLocation('/'); }}
        cartItemCount={cartCount}
      />
      <div className="max-w-7xl mx-auto px-4 py-12 flex-1">
        <div className="mb-8">
          <h1 className="font-serif text-3xl">Search results</h1>
          <p className="text-sm text-muted-foreground">for "{q}"</p>
        </div>

      {isLoading ? (
        <div className="py-16">Loading...</div>
      ) : products.length === 0 ? (
        <div className="py-16">No products found.</div>
      ) : (
        <ProductGrid
          products={products}
          onProductClick={(p) => setLocation(`/product/${p.id}`)}
        />
      )}
      </div>
      <Footer />
    </div>
  );
}
