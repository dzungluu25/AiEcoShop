import { Button } from "@/components/ui/button";
import heroImage from "@assets/generated_images/hero_banner_lifestyle_image.png";

interface HeroProps {
  onShopNow?: () => void;
  onTryAI?: () => void;
}

export default function Hero({ onShopNow, onTryAI }: HeroProps) {
  return (
    <section className="relative h-[70vh] min-h-[500px] flex items-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 w-full">
        <div className="max-w-xl">
          <h2 
            className="font-serif text-5xl lg:text-7xl font-light text-white mb-6 leading-tight"
            data-testid="text-hero-title"
          >
            Discover Your Perfect Style
          </h2>
          <p 
            className="text-lg text-white/90 mb-8 leading-relaxed"
            data-testid="text-hero-description"
          >
            Experience AI-powered personal shopping with virtual try-on technology. 
            Find curated collections tailored just for you.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="text-base px-8"
              data-testid="button-shop-now"
              onClick={onShopNow}
            >
              Shop Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-base px-8 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
              data-testid="button-try-ai"
              onClick={onTryAI}
            >
              Try AI Stylist
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
