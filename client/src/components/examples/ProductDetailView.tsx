import ProductDetailView from '../ProductDetailView';
import sneakerImg from '@assets/generated_images/white_sneaker_product.png';

export default function ProductDetailViewExample() {
  const product = {
    id: '1',
    name: 'Classic White Sneaker',
    price: 129.99,
    images: [sneakerImg, sneakerImg, sneakerImg],
    category: 'Footwear',
    description: 'Elevate your casual style with these premium white sneakers. Crafted from genuine leather with a minimalist design, these shoes combine comfort and sophistication. Perfect for everyday wear.',
    sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
    inStock: true
  };

  return (
    <ProductDetailView
      product={product}
      onAddToCart={(p, size) => console.log('Add to cart:', p, size)}
      onTryOn={() => console.log('Try on clicked')}
    />
  );
}
