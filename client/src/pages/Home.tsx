import { useState } from "react";
import { Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import AIChat from "@/components/AIChat";
import VisualSearchModal from "@/components/VisualSearchModal";
import ShoppingCart from "@/components/ShoppingCart";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import type { Product } from "@/components/ProductCard";
import type { CartItem } from "@/components/ShoppingCart";

import sneakerImg from '@assets/generated_images/white_sneaker_product.png';
import jacketImg from '@assets/generated_images/black_leather_jacket.png';
import coatImg from '@assets/generated_images/beige_trench_coat.png';
import sweaterImg from '@assets/generated_images/grey_wool_sweater.png';
import jeansImg from '@assets/generated_images/blue_denim_jeans.png';
import blouseImg from '@assets/generated_images/white_silk_blouse.png';

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const products: Product[] = [
    { id: '1', name: 'Classic White Sneaker', price: 129.99, image: sneakerImg, category: 'Footwear' },
    { id: '2', name: 'Premium Leather Jacket', price: 349.99, image: jacketImg, category: 'Outerwear' },
    { id: '3', name: 'Elegant Trench Coat', price: 289.99, image: coatImg, category: 'Outerwear' },
    { id: '4', name: 'Cashmere Wool Sweater', price: 159.99, image: sweaterImg, category: 'Knitwear' },
    { id: '5', name: 'Designer Denim Jeans', price: 189.99, image: jeansImg, category: 'Bottoms' },
    { id: '6', name: 'Silk Blouse', price: 139.99, image: blouseImg, category: 'Tops' },
    { id: '7', name: 'White Sneaker Collection', price: 129.99, image: sneakerImg, category: 'Footwear' },
    { id: '8', name: 'Black Leather Classic', price: 379.99, image: jacketImg, category: 'Outerwear' },
    { id: '9', name: 'Beige Statement Coat', price: 299.99, image: coatImg, category: 'Outerwear' },
  ];

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
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
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

          <ProductGrid
            products={products}
            onAddToCart={handleAddToCart}
            onVisualSearch={() => setIsVisualSearchOpen(true)}
          />
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
    </div>
  );
}
