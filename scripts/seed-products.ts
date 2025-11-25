import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000/api';

interface Product {
  name: string;
  brand: string;
  description: string;
  price: number;
  maxQuantity: number;
  image: string;
  slug: string;
  keywords: string[];
  sizes: number[];
  availableColors: string[];
  isFeatured: boolean;
  isRecommended: boolean;
}

const products: Product[] = [
  {
    name: 'Premium Silk Dress',
    brand: 'Luxe Collections',
    description: 'Elegant evening dress in premium silk with sophisticated draping.',
    price: 299.99,
    maxQuantity: 25,
    image: 'https://via.placeholder.com/400x400?text=Silk+Dress',
    slug: 'premium-silk-dress',
    keywords: ['dress', 'evening', 'silk', 'elegant'],
    sizes: [2, 4, 6, 8, 10, 12],
    availableColors: ['#000000', '#FFFFFF', '#8B0000'],
    isFeatured: true,
    isRecommended: false,
  },
  {
    name: 'Cashmere Cardigan',
    brand: 'Wool & Cashmere Co',
    description: 'Luxurious cashmere cardigan for ultimate comfort and style.',
    price: 249.99,
    maxQuantity: 30,
    image: 'https://via.placeholder.com/400x400?text=Cashmere+Cardigan',
    slug: 'cashmere-cardigan',
    keywords: ['cardigan', 'cashmere', 'sweater', 'comfort'],
    sizes: [2, 4, 6, 8, 10, 12],
    availableColors: ['#FFFACD', '#D3D3D3', '#8B4513'],
    isFeatured: false,
    isRecommended: true,
  },
  {
    name: 'Designer Handbag',
    brand: 'Signature Styles',
    description: 'Timeless designer handbag in premium leather with gold accents.',
    price: 399.99,
    maxQuantity: 15,
    image: 'https://via.placeholder.com/400x400?text=Designer+Handbag',
    slug: 'designer-handbag',
    keywords: ['handbag', 'leather', 'designer', 'accessories'],
    sizes: [],
    availableColors: ['#000000', '#8B4513', '#D2B48C'],
    isFeatured: true,
    isRecommended: true,
  },
  {
    name: 'Athletic Performance Shoes',
    brand: 'SportTech',
    description: 'High-performance athletic shoes with advanced cushioning technology.',
    price: 179.99,
    maxQuantity: 50,
    image: 'https://via.placeholder.com/400x400?text=Athletic+Shoes',
    slug: 'athletic-performance-shoes',
    keywords: ['shoes', 'athletic', 'performance', 'sports'],
    sizes: [5, 6, 7, 8, 9, 10, 11, 12, 13],
    availableColors: ['#000000', '#FF6347', '#0000FF'],
    isFeatured: false,
    isRecommended: true,
  },
  {
    name: 'Classic White T-Shirt',
    brand: 'Essential Basics',
    description: 'Premium quality white t-shirt, perfect for any occasion.',
    price: 49.99,
    maxQuantity: 100,
    image: 'https://via.placeholder.com/400x400?text=White+TShirt',
    slug: 'classic-white-tshirt',
    keywords: ['tshirt', 'white', 'classic', 'essential'],
    sizes: [2, 4, 6, 8, 10, 12],
    availableColors: ['#FFFFFF'],
    isFeatured: false,
    isRecommended: false,
  },
  {
    name: 'Denim Shorts',
    brand: 'Urban Wear',
    description: 'Comfortable and stylish denim shorts for summer.',
    price: 69.99,
    maxQuantity: 60,
    image: 'https://via.placeholder.com/400x400?text=Denim+Shorts',
    slug: 'denim-shorts',
    keywords: ['shorts', 'denim', 'summer', 'casual'],
    sizes: [2, 4, 6, 8, 10, 12],
    availableColors: ['#1E90FF', '#708090'],
    isFeatured: false,
    isRecommended: false,
  },
  {
    name: 'Wool Blazer',
    brand: 'Professional Attire',
    description: 'Sharp wool blazer perfect for business or casual smart wear.',
    price: 199.99,
    maxQuantity: 20,
    image: 'https://via.placeholder.com/400x400?text=Wool+Blazer',
    slug: 'wool-blazer',
    keywords: ['blazer', 'wool', 'professional', 'business'],
    sizes: [2, 4, 6, 8, 10, 12],
    availableColors: ['#000000', '#2F4F4F', '#8B7355'],
    isFeatured: true,
    isRecommended: false,
  },
  {
    name: 'Leather Boots',
    brand: 'Boot Masters',
    description: 'Classic leather boots with comfortable support and timeless style.',
    price: 229.99,
    maxQuantity: 35,
    image: 'https://via.placeholder.com/400x400?text=Leather+Boots',
    slug: 'leather-boots',
    keywords: ['boots', 'leather', 'classic', 'footwear'],
    sizes: [5, 6, 7, 8, 9, 10, 11, 12],
    availableColors: ['#8B4513', '#000000', '#654321'],
    isFeatured: false,
    isRecommended: true,
  },
  {
    name: 'Floral Summer Dress',
    brand: 'Casual Chic',
    description: 'Light and breezy floral dress perfect for warm summer days.',
    price: 89.99,
    maxQuantity: 40,
    image: 'https://via.placeholder.com/400x400?text=Floral+Dress',
    slug: 'floral-summer-dress',
    keywords: ['dress', 'floral', 'summer', 'casual'],
    sizes: [2, 4, 6, 8, 10, 12],
    availableColors: ['#FF69B4', '#FFB6C1', '#FFF8DC'],
    isFeatured: false,
    isRecommended: false,
  },
  {
    name: 'Sunglasses Collection',
    brand: 'Vision Style',
    description: 'Trendy sunglasses with UV protection and premium frames.',
    price: 129.99,
    maxQuantity: 50,
    image: 'https://via.placeholder.com/400x400?text=Sunglasses',
    slug: 'sunglasses-collection',
    keywords: ['sunglasses', 'eyewear', 'accessories', 'fashion'],
    sizes: [],
    availableColors: ['#000000', '#8B0000', '#FFD700'],
    isFeatured: false,
    isRecommended: false,
  },
  {
    name: 'Elegant Scarf',
    brand: 'Accessory Elegance',
    description: 'Luxurious scarves in various styles and patterns.',
    price: 79.99,
    maxQuantity: 45,
    image: 'https://via.placeholder.com/400x400?text=Elegant+Scarf',
    slug: 'elegant-scarf',
    keywords: ['scarf', 'accessory', 'elegant', 'fashion'],
    sizes: [],
    availableColors: ['#FFB6C1', '#87CEEB', '#DEB887'],
    isFeatured: false,
    isRecommended: false,
  },
  {
    name: 'Premium Denim Jacket',
    brand: 'Denim Legends',
    description: 'Classic denim jacket that never goes out of style.',
    price: 149.99,
    maxQuantity: 35,
    image: 'https://via.placeholder.com/400x400?text=Denim+Jacket',
    slug: 'premium-denim-jacket',
    keywords: ['jacket', 'denim', 'classic', 'casual'],
    sizes: [2, 4, 6, 8, 10, 12],
    availableColors: ['#1E90FF', '#4169E1'],
    isFeatured: true,
    isRecommended: false,
  },
];

async function seedProducts() {
  console.log('🌱 Starting to seed products...\n');

  for (let i = 0; i < products.length; i++) {
    try {
      // Generate product key
      const keyResponse = await fetch(`${API_BASE_URL}/products/generate-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const keyData = await keyResponse.json() as { key: string };
      const productId = keyData.key;

      // Create product
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products[i]),
      });

      if (response.ok) {
        const created = await response.json() as { name: string };
        console.log(`✓ Created: ${created.name}`);
      } else {
        console.error(`✗ Failed to create ${products[i].name}`);
      }
    } catch (error) {
      console.error(`✗ Error creating ${products[i].name}:`, error);
    }
  }

  console.log('\n✅ Seeding complete!');
}

seedProducts().catch(console.error);
