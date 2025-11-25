# Design Guidelines: AI-Powered Ecommerce Platform

## Design Approach
**Reference-Based Approach** drawing from premium ecommerce platforms (Shopify stores, Farfetch, SSENSE, ASOS) combined with modern SaaS interfaces (Linear, Notion) for the AI features. This dual inspiration creates a shopping experience that feels both luxurious and technologically sophisticated.

**Key Design Principles:**
- Product-first visual hierarchy with generous imagery
- Clean, editorial typography that doesn't compete with products
- Seamless integration of AI features without overwhelming the shopping experience
- Frictionless interaction patterns for browse-to-purchase flow

## Typography System

**Font Families:**
- Primary: Inter or DM Sans (body text, UI elements)
- Accent: Playfair Display or Crimson Pro (product titles, hero headlines)

**Type Scale:**
- Hero headlines: text-5xl to text-7xl, font-light
- Section titles: text-3xl to text-4xl, font-normal
- Product names: text-xl to text-2xl, font-medium
- Body text: text-base, font-normal, leading-relaxed
- UI labels: text-sm, font-medium, tracking-wide uppercase
- Price displays: text-2xl, font-semibold

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, and 24
- Component padding: p-4 to p-8
- Section spacing: py-16 to py-24
- Card gaps: gap-6 to gap-8
- Product grid gaps: gap-4 to gap-6

**Container Strategy:**
- Page wrapper: max-w-7xl mx-auto px-4
- Product grids: Full width with contained inner grid
- AI features: max-w-4xl for chat, max-w-6xl for visual search
- Product details: max-w-screen-xl

## Component Library

### Navigation
**Main Header:**
- Sticky navigation with minimal height (h-16 to h-20)
- Logo left, centered search bar, icons right (AI assistant, cart, account)
- Category navigation as horizontal list below header or mega-menu on hover
- Search bar with icon, expands on focus with autocomplete dropdown

**AI Personal Shopper Button:**
- Fixed bottom-right floating action button (w-14 h-14 rounded-full)
- Pulsing indicator when assistant has new suggestions
- Opens slide-in panel from right (w-full md:w-96)

### Homepage Structure

**Hero Section (60vh to 80vh):**
- Full-bleed lifestyle product imagery showcasing featured collection
- Overlaid headline and CTA with backdrop-blur-md treatment
- Split layout option: 60/40 image-to-content ratio
- Subtle parallax scroll effect on hero image

**Featured Collections (3-column grid lg:, 2-column md:, 1-column base):**
- Large square cards with product imagery
- Hover state: subtle zoom on image, overlay with "Shop Collection" CTA

**How It Works Section:**
- 3-column grid explaining AI features
- Icon + Title + Description pattern
- Visual demonstrations of try-on and personal shopper

### Product Catalog

**Grid Layout:**
- 4 columns (xl:), 3 columns (lg:), 2 columns (md:), 1 column (base)
- Masonry grid for varied image heights
- Product card: Image (aspect-square or aspect-[3/4]), Title, Price, Quick add button

**Filtering Sidebar:**
- Fixed left sidebar (w-64) on desktop, slide-in drawer on mobile
- Collapsible filter groups (Category, Price Range, Size, Brand)
- Applied filters displayed as dismissible chips above products

**Product Card Interactions:**
- Hover: Quick view button overlay, "Add to cart" appears
- Visual search icon overlay (camera icon) on hover
- Wishlist heart icon (top-right corner)

### Product Detail Page

**Layout Structure:**
- Two-column split (1:1 ratio on desktop)
- Left: Image gallery with thumbnail strip + main image (aspect-[3/4])
- Right: Product info, size selector, quantity, add-to-cart, AI try-on button

**Image Gallery:**
- Main image with thumbnail carousel below
- Click to open fullscreen lightbox
- Pinch-to-zoom on mobile

**AI Try-On Integration:**
- "See it on you" button below size selector
- Opens modal with upload interface or live camera feed
- Split view: uploaded image left, product overlay right

### Visual Search Interface

**Search Modal:**
- Full-screen overlay with centered upload area (max-w-2xl)
- Drag-and-drop zone with image preview
- Results displayed as grid below with similarity scores
- "Find similar" action on any product

### AI Personal Shopper Chat

**Chat Panel (slide-in from right, w-full md:w-96):**
- Chat header with avatar and "AI Stylist" title
- Message thread with user/AI message bubbles
- Product recommendation cards within chat (compact version)
- Input field with send button and image upload option
- Suggested prompts as chips below input

**Message Styling:**
- User messages: right-aligned, compact bubbles
- AI messages: left-aligned with avatar
- Product cards: clickable with image, name, price

### Shopping Cart

**Slide-in Cart Panel:**
- Right-side panel (w-full md:w-96)
- Cart items: thumbnail + details + quantity selector + remove
- Sticky footer with subtotal and checkout button
- Empty state with suggested products

### Footer
- 4-column grid (lg:), 2-column (md:), stacked (base)
- Shop categories, customer service, about, social links
- Newsletter signup with inline form
- Trust badges (secure checkout, free returns)
- Minimal height with generous internal padding (py-12 to py-16)

## Interactions & Animations

**Micro-interactions (use sparingly):**
- Add to cart: subtle scale pulse on button
- Product card hover: smooth 1.05 scale on image (duration-300)
- Cart icon: bounce when item added
- AI chat: typing indicator dots animation

**Page Transitions:**
- Fade in content on scroll (intersection observer)
- Smooth scroll behavior for anchor links

## Images

**Hero Section:**
- Large lifestyle hero image showcasing curated collection or seasonal campaign
- High-quality fashion photography with models or styled product shots
- Dimensions: Full viewport width, 60-80vh height

**Product Images:**
- Professional product photography on clean backgrounds
- Multiple angles per product (minimum 3-4 images)
- Lifestyle shots mixed with product-only shots

**AI Feature Demonstrations:**
- Screenshot mockups of try-on results
- Example visual search comparisons
- Chat interface previews with product recommendations

**Category/Collection Cards:**
- Lifestyle imagery for each collection
- Consistent aspect ratios (square or 3:4)

This design creates a premium shopping experience where AI features enhance rather than overshadow the core product discovery and purchasing flow.