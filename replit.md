# AI E-commerce Frontend

Premium B2C e-commerce frontend featuring AI-powered shopping assistance, visual search, and seamless backend integration.

## Project Overview

This is a modern e-commerce frontend built with React, TypeScript, and Tailwind CSS that connects to a Java Spring Boot backend. The application provides a premium shopping experience with cutting-edge AI features.

## Key Features

### Core Functionality
- **Product Catalog**: Dynamic product listing fetched from backend API
- **Real-time Search**: Debounced search with instant results dropdown
- **Shopping Cart**: Persistent cart using localStorage
- **User Authentication**: JWT-based auth with sign-up/sign-in flows

### AI Features
- **AI Personal Shopper**: Chat-based shopping assistant (placeholder for backend AI endpoint)
- **Visual Search**: Image-based product discovery (placeholder for backend AI endpoint)

## Architecture

### Backend Integration
- **API Base URL**: `http://localhost:3000/api` (configurable via `VITE_API_BASE_URL`)
- **Authentication**: JWT Bearer tokens stored in localStorage
- **Data Fetching**: TanStack Query (React Query) for efficient caching and state management

### API Services

#### Authentication (`client/src/lib/auth.ts`)
- `signUp(data)` - Create new user account
- `signIn(data)` - Login with email/password
- `signOut()` - Logout and clear token
- `getCurrentUser()` - Get authenticated user info

#### Products (`client/src/lib/products.ts`)
- `getAllProducts(params)` - Fetch paginated product list
- `getProductById(id)` - Get single product details
- `searchProducts(query, limit)` - Search products by query
- `getFeaturedProducts()` - Get featured products
- `getRecommendedProducts()` - Get recommended products

#### AI Services (`client/src/lib/ai.ts`)
- `chat(request)` - AI personal shopper chat
- `visualSearch(request)` - Image-based product search
- `uploadImageForSearch(file)` - Upload image for visual search

### Data Transformation

The frontend transforms backend product data to match UI requirements:

**Backend Schema** → **Frontend Schema**
- `id` (int) → `id` (string)
- `imgUrl` → `image`
- `stock` → `maxQuantity`
- `metaKeywords` (comma-separated) → `keywords` (array)
- `brand` → `category` (primary grouping)
- `availableColors` → `colors`
- `sizes` (int array) → `sizes` (string array with "Size X" format)

## Design System

### Typography
- **Headings**: Playfair Display (serif, elegant)
- **Body**: Inter (sans-serif, modern)

### Color Scheme
Premium e-commerce aesthetic with carefully selected brand colors defined in `client/src/index.css`:
- Primary: Deep purple (#6B46C1)
- Accent: Warm amber
- Background: Light neutrals with dark mode support

### Components
All UI components use shadcn/ui for consistency:
- Buttons, Cards, Dialogs
- Forms with react-hook-form + zod validation
- Toast notifications for user feedback

## Project Structure

```
client/src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── Header.tsx       # Navigation with search
│   ├── Hero.tsx         # Hero section
│   ├── ProductCard.tsx  # Product display
│   ├── ProductGrid.tsx  # Product listing
│   ├── AIChat.tsx       # AI assistant
│   ├── AuthModal.tsx    # Login/signup
│   ├── ShoppingCart.tsx # Cart sidebar
│   └── VisualSearchModal.tsx # Image search
├── lib/
│   ├── api.ts          # API client
│   ├── auth.ts         # Auth service
│   ├── products.ts     # Product service
│   └── ai.ts           # AI service
├── pages/
│   └── Home.tsx        # Main page
└── App.tsx             # Root component
```

## Recent Changes (Nov 25, 2025)

### Backend Integration
- Connected all product listings to backend API
- Implemented JWT authentication flow
- Added real-time search with debouncing
- Set up shopping cart persistence
- Created data transformation layer for backend compatibility

### API Integration
- Created `apiClient` for centralized HTTP requests
- Implemented auth token management (localStorage)
- Added error handling for API failures
- Set up TanStack Query for data fetching

## Running the Project

The application is configured to run with:
```bash
npm run dev
```

This starts both the Express server (backend proxy) and Vite dev server (frontend) on port 5000.

### Prerequisites

1. **Backend must be running** on `http://localhost:3000`
   - Java Spring Boot backend with sample data
   - See: https://github.com/dzungluu25/ecommerce_backend

2. **Environment Variables**
   - `VITE_API_BASE_URL=http://localhost:3000/api` (already configured)

## User Experience Notes

### First-Time Users
- Can browse products without authentication
- Must sign up/sign in to access cart and checkout features
- JWT token persists across browser sessions

### Shopping Flow
1. Browse products on homepage
2. Use search to find specific items
3. Click "Add to Cart" on product cards
4. View cart via shopping bag icon
5. Proceed to checkout (requires authentication)

### AI Features
- **AI Chat**: Click sparkle icon to open personal shopper
- **Visual Search**: Click camera icon on any product to search by image

## Development Notes

### API Error Handling
All API calls include error handling with user-friendly toast notifications. Network errors are caught and displayed appropriately.

### State Management
- **Global State**: TanStack Query for server state
- **Local State**: React hooks for UI state
- **Persistence**: localStorage for cart and auth token

### Future Enhancements
- Connect AI endpoints when backend services are ready
- Add product detail pages
- Implement checkout flow
- Add order history
- User profile management

## Testing

The application includes data-testid attributes on all interactive elements for end-to-end testing:
- `button-cart` - Shopping cart button
- `button-ai-assistant` - AI chat button
- `button-account` - Account/auth button
- `input-search` - Search input
- `input-signin-email`, `input-signin-password` - Sign in form
- `input-signup-email`, `input-signup-password`, `input-signup-fullname` - Sign up form

## Notes

- Frontend-only implementation connecting to existing backend
- Mock AI responses until backend AI endpoints are available
- Shopping cart stored in browser localStorage (could be moved to backend)
- All generated images stored in `attached_assets/generated_images/`
