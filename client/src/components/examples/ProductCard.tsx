import ProductCard from '../ProductCard';
import productImage from '@assets/generated_images/white_sneaker_product.png';

export default function ProductCardExample() {
  const product = {
    id: '1',
    name: 'Classic Sneaker',
    price: 129.99,
    image: productImage,
    category: 'Footwear'
  };

  return (
    <div className="w-80">
      <ProductCard
        product={product}
        onQuickView={(p) => console.log('Quick view:', p)}
        onAddToCart={(p) => console.log('Add to cart:', p)}
        onVisualSearch={(p) => console.log('Visual search:', p)}
      />
    </div>
  );
}
