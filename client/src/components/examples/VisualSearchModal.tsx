import { useState } from 'react';
import VisualSearchModal from '../VisualSearchModal';
import { Button } from '@/components/ui/button';

export default function VisualSearchModalExample() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Visual Search</Button>
      <VisualSearchModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        onProductClick={(p) => console.log('Product clicked:', p)}
      />
    </div>
  );
}
