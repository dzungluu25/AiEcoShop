import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import AIChat from "@/components/AIChat";
import VisualSearchModal from "@/components/VisualSearchModal";
import ShoppingCart from "@/components/ShoppingCart";
import AuthModal from "@/components/AuthModal";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import type { Product } from "@/components/ProductCard";
import type { CartItem } from "@/components/ShoppingCart";
import type { User } from "@/lib/auth";
import { productService } from "@/lib/products";
import { authService } from "@/lib/auth";

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch products from backend
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
    queryFn: () => productService.getAllProducts({ limit: 50 }),
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart_items');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  // Check for existing auth session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        // User not authenticated
        setCurrentUser(null);
      }
    };
    checkAuth();
  }, []);

  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(prev =>
        prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      };
      setCartItems(prev => [...prev, newItem]);
    }

    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onAIClick={() => setIsAIChatOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        user={currentUser}
      />

      <main className="flex-1">
        <Hero />

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
            <h2 className="font-serif text-4xl mb-4" data-testid="text-features-title">
              Shop with AI Intelligence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience personalized shopping with our AI stylist and visual search technology
            </p>
          </div>

          <div className="max-w-7xl mx-auto px-4 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl mb-2" data-testid="text-feature-ai">AI Personal Shopper</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized recommendations tailored to your unique style preferences
                </p>
              </div>

              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl mb-2" data-testid="text-feature-visual">Visual Search</h3>
                <p className="text-sm text-muted-foreground">
                  Upload any image to find similar products instantly
                </p>
              </div>

              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl mb-2" data-testid="text-feature-tryon">Virtual Try-On</h3>
                <p className="text-sm text-muted-foreground">
                  See how items look on you before making a purchase
                </p>
              </div>
            </div>
          </div>

          {isLoadingProducts ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-pulse text-muted-foreground">Loading products...</div>
            </div>
          ) : (
            <ProductGrid
              products={products}
              onAddToCart={handleAddToCart}
              onVisualSearch={() => setIsVisualSearchOpen(true)}
            />
          )}
        </section>
      </main>

      <Footer />

      <Button
        size="lg"
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-40"
        onClick={() => setIsAIChatOpen(true)}
        data-testid="button-floating-ai"
      >
        <Sparkles className="h-6 w-6" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-destructive rounded-full animate-pulse" />
      </Button>

      <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} />
      <VisualSearchModal isOpen={isVisualSearchOpen} onClose={() => setIsVisualSearchOpen(false)} />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
}
