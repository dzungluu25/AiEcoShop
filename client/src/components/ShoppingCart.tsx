import React, { useState } from "react";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cartService } from "@/lib/cart";
import { getAuthToken } from "@/lib/api";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items?: CartItem[];
  onItemsChange?: (items: CartItem[]) => void;
}

export default function ShoppingCart({ isOpen, onClose, items: initialItems = [], onItemsChange }: ShoppingCartProps) {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [serverTotals, setServerTotals] = useState<{ subtotal:number; shipping:number; discount:number; total:number } | null>(null);

  // Keep local state in sync when parent updates items
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const commit = (next: CartItem[]) => {
    setItems(next);
    onItemsChange?.(next);
  };

  const updateQuantity = (id: string, delta: number) => {
    const next = items.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    commit(next);
  };

  const removeItem = (id: string) => {
    const itemToRemove = items.find(item => item.id === id);
    if (!itemToRemove) return;
    
    commit(items.filter(item => item.id !== id));
    
    // Show toast notification with undo option
    toast({
      title: "Item removed",
      description: `${itemToRemove.name} was removed from your cart`,
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            commit([...items, itemToRemove]);
          }}
        >
          Undo
        </Button>
      ),
    });
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  React.useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    const payload = items.map(i => ({ productId: i.id, name: i.name, price: i.price, image: i.image, quantity: i.quantity, size: i.size }));
    cartService.setCart(payload).catch(() => {});
    cartService.quote().then(q => setServerTotals({ subtotal: q.subtotal, shipping: q.shipping, discount: q.discount, total: q.total })).catch(() => setServerTotals(null));
  }, [items]);

  const applyPromo = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const q = await cartService.applyCoupon(promoCode);
      setServerTotals({ subtotal: q.subtotal, shipping: q.shipping, discount: q.discount, total: q.total });
      if (q.codeApplied) {
        toast({ title: "Coupon applied", description: `${q.codeApplied}` });
      } else {
        toast({ title: "Coupon invalid", variant: "destructive" });
      }
    } catch {
      toast({ title: "Coupon error", variant: "destructive" });
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsCheckingOut(true);
    
    try {
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart after successful checkout
      setItems([]);
      
      toast({
        title: "Checkout successful!",
        description: "Your order has been placed and will be processed shortly.",
        duration: 5000,
      });
      
      // Close cart after successful checkout
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-background border-l shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold" data-testid="text-cart-title">
          Shopping Cart ({items.length})
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          data-testid="button-close-cart"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2" data-testid="text-empty-cart">Your cart is empty</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Add some items to get started
          </p>
          <Button onClick={onClose} data-testid="button-continue-shopping">
            Continue Shopping
          </Button>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-4"
                  data-testid={`cart-item-${item.id}`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                    data-testid={`img-cart-${item.id}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-sm truncate" data-testid={`text-name-${item.id}`}>
                          {item.name}
                        </h4>
                        {item.size && (
                          <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-foreground"
                        data-testid={`button-remove-${item.id}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border rounded">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, -1)}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-8 text-center" data-testid={`text-quantity-${item.id}`}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, 1)}
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <p className="font-semibold" data-testid={`text-price-${item.id}`}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-4 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span data-testid="text-subtotal">${(serverTotals?.subtotal ?? subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span data-testid="text-shipping">{((serverTotals?.shipping ?? shipping) === 0) ? 'Free' : `$${(serverTotals?.shipping ?? shipping).toFixed(2)}`}</span>
              </div>
              {serverTotals && serverTotals.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span data-testid="text-discount">-${serverTotals.discount.toFixed(2)}</span>
                </div>
              )}
              {subtotal < 100 && subtotal > 0 && (
                <p className="text-xs text-muted-foreground">
                  Add ${(100 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span data-testid="text-total">${(serverTotals?.total ?? total).toFixed(2)}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <input className="flex-1 border rounded px-3 py-1 text-sm" placeholder="Promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                <Button variant="outline" onClick={applyPromo} disabled={!promoCode.trim()}>Apply</Button>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg" 
              data-testid="button-checkout"
              onClick={handleCheckout}
              disabled={isCheckingOut || items.length === 0}
            >
              {isCheckingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Processing...
                </>
              ) : (
                `Proceed to Checkout ($${total.toFixed(2)})`
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
