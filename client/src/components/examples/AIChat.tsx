import { useState } from 'react';
import AIChat from '../AIChat';
import { Button } from '@/components/ui/button';

export default function AIChatExample() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative h-screen">
      <Button onClick={() => setIsOpen(true)}>Open AI Chat</Button>
      <AIChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
