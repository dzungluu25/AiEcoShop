import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Footer() {
  const footerLinks = {
    Shop: ["New Arrivals", "Women", "Men", "Accessories", "Sale"],
    "Customer Service": ["Contact Us", "Shipping Info", "Returns", "Size Guide", "FAQ"],
    About: ["Our Story", "Sustainability", "Careers", "Press"],
  };

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-serif text-2xl font-light mb-4" data-testid="text-footer-brand">LUXE</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Experience the future of fashion shopping with AI-powered personal styling and virtual try-on.
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">
                AI Powered
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Secure
              </Badge>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-medium uppercase tracking-wide mb-4" data-testid={`text-footer-${title.toLowerCase().replace(' ', '-')}`}>
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <button 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      data-testid={`link-${link.toLowerCase().replace(/\s/g, '-')}`}
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-medium uppercase tracking-wide mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get exclusive offers and style tips delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="flex-1"
                data-testid="input-newsletter"
              />
              <Button data-testid="button-subscribe">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground" data-testid="text-copyright">
              © 2024 LUXE. All rights reserved.
            </p>
            <div className="flex gap-6">
              <button className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-privacy">
                Privacy Policy
              </button>
              <button className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-terms">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
