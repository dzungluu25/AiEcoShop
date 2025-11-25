import { useState } from 'react';
import ShoppingCart from '../ShoppingCart';
import { Button } from '@/components/ui/button';
import sneakerImg from '@assets/generated_images/white_sneaker_product.png';
import jacketImg from '@assets/generated_images/black_leather_jacket.png';

export default function ShoppingCartExample() {
  const [isOpen, setIsOpen] = useState(true);

  const mockItems = [
    {
      id: '1',
      name: 'Classic Sneaker',
      price: 129.99,
      image: sneakerImg,
      quantity: 1,
      size: 'US 9'
    },
    {
      id: '2',
      name: 'Leather Jacket',
      price: 349.99,
      image: jacketImg,
      quantity: 1,
      size: 'M'
    }
  ];

  return (
    <div className="relative h-screen">
      <Button onClick={() => setIsOpen(true)}>Open Cart</Button>
      <ShoppingCart 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        items={mockItems}
      />
    </div>
  );
}
