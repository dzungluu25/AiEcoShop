import { useEffect, useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { productService, type ProductDetail as ProductDetailType, type ReviewEntry } from "@/lib/products";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authService, type User } from "@/lib/auth";
import { formatPrice, t } from "@/lib/utils";
import VirtualTryOn from "@/components/VirtualTryOn";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const id = params?.id || "";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["/api/products", id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });

  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ["/api/products", id, "reviews"],
    queryFn: () => productService.getReviews(id),
    enabled: !!id,
  });

  const [newRating, setNewRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tryOnOpen, setTryOnOpen] = useState(false);

  useEffect(() => {
    authService.getCurrentUser().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  const addToCart = () => {
    if (!product) return;
    try {
      setIsAdding(true);
      const stored = localStorage.getItem("cart_items");
      const items = stored ? JSON.parse(stored) : [];
      const existing = items.find((i: any) => i.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        items.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
      }
      localStorage.setItem("cart_items", JSON.stringify(items));
      toast({ title: "Added to cart", description: `${product.name} added to cart.` });
      localStorage.setItem('open_cart', '1');
      setLocation('/');
    } catch {}
    finally { setIsAdding(false); }
  };

  if (!match) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <p>Invalid product url</p>
        <Link href="/">Go back</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse text-muted-foreground">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <p className="text-destructive">Product not found</p>
        <Link href="/" className="underline">Back to home</Link>
      </div>
    );
  }

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
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-4">
              <img src={product.image} alt={product.name} className="w-full h-auto rounded" />
            </Card>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.category}</p>
              <h1 className="font-serif text-3xl">{product.name}</h1>
              <p className="text-2xl font-semibold">{formatPrice(product.price)}</p>
              {typeof product.ratingAverage === 'number' && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`h-5 w-5 ${i <= Math.round((product.ratingAverage || 0)) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{(product.ratingAverage || 0).toFixed(1)} ({product.ratingCount || 0} reviews)</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Sizes</p>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((s) => (
                      <span key={s} className="px-3 py-1 border rounded text-sm">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Colors</p>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((c) => (
                      <span key={c} className="w-6 h-6 rounded-full border" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button onClick={addToCart} data-testid="button-detail-add" aria-label={t('Add to Cart')} disabled={isAdding}>
                  {isAdding ? 'Adding...' : t('Add to Cart')}
                </Button>
                <Button variant="outline" onClick={()=>setTryOnOpen(true)} aria-label="Try on">Try On</Button>
                <Link href="/">
                  <Button variant="outline" aria-label="Back to home">Back</Button>
                </Link>
              </div>
              <div className="pt-6">
                <h2 className="font-serif text-xl mb-3">Reviews</h2>
                <div className="space-y-3 mb-4">
                  {reviews.length === 0 && (
                    <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review.</p>
                  )}
                  {reviews.map((r, idx) => (
                    <div key={idx} className="border rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`h-4 w-4 ${i <= r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                        ))}
                        <span className="text-xs text-muted-foreground">{r.user || 'Anonymous'}</span>
                        {r.createdAt && (
                          <span className="text-xs text-muted-foreground">• {new Date(r.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      {r.comment && (<p className="text-sm">{r.comment}</p>)}
                    </div>
                  ))}
                </div>
                <div className="border rounded p-4 space-y-3">
                  <p className="text-sm font-medium">Add your review</p>
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map(i => (
                      <button key={i} onClick={() => setNewRating(i)}>
                        <Star className={`h-5 w-5 ${i <= newRating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                      </button>
                    ))}
                    <span className="text-xs text-muted-foreground">{newRating}/5</span>
                  </div>
                  <textarea
                    className="w-full border rounded p-2 text-sm"
                    rows={3}
                    placeholder="Write a comment (optional)"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button
                    aria-label="Submit review"
                    disabled={newRating === 0 || isSubmittingReview}
                    onClick={async () => {
                      if (!product) return;
                      try {
                        setIsSubmittingReview(true);
                        await productService.addReview(product.id, { rating: newRating, comment: newComment, user: currentUser?.fullname || currentUser?.email });
                        setNewRating(0);
                        setNewComment("");
                        refetchReviews();
                        toast({ title: 'Review submitted', description: 'Thank you for your feedback!' });
                      } catch {}
                      finally { setIsSubmittingReview(false); }
                    }}
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <VirtualTryOn isOpen={tryOnOpen} onClose={()=>setTryOnOpen(false)} imageUrl={product.image} productName={product.name} />
    </div>
  );
}
import Header from "@/components/Header";
import Footer from "@/components/Footer";
