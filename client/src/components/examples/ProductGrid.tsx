import ProductGrid from '../ProductGrid';
import sneakerImg from '@assets/generated_images/white_sneaker_product.png';
import jacketImg from '@assets/generated_images/black_leather_jacket.png';
import coatImg from '@assets/generated_images/beige_trench_coat.png';
import sweaterImg from '@assets/generated_images/grey_wool_sweater.png';

export default function ProductGridExample() {
  const products = [
    { id: '1', name: 'Classic Sneaker', price: 129.99, image: sneakerImg, category: 'Footwear' },
    { id: '2', name: 'Leather Jacket', price: 349.99, image: jacketImg, category: 'Outerwear' },
    { id: '3', name: 'Trench Coat', price: 289.99, image: coatImg, category: 'Outerwear' },
    { id: '4', name: 'Wool Sweater', price: 159.99, image: sweaterImg, category: 'Knitwear' },
    { id: '5', name: 'Classic Sneaker White', price: 129.99, image: sneakerImg, category: 'Footwear' },
    { id: '6', name: 'Premium Jacket', price: 399.99, image: jacketImg, category: 'Outerwear' },
  ];

  return (
    <ProductGrid
      products={products}
      onProductClick={(p) => console.log('Product clicked:', p)}
      onAddToCart={(p) => console.log('Add to cart:', p)}
      onVisualSearch={(p) => console.log('Visual search:', p)}
    />
  );
}
