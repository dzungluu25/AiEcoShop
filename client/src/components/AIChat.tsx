import { useState } from "react";
import { Send, X, Sparkles, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { aiService, type ChatMessage } from "@/lib/ai";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChat({ isOpen, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI stylist. I can help you find the perfect outfit, suggest items based on your style, or help you with virtual try-on. What are you looking for today?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  const suggestedPrompts = [
    "Show me casual outfits",
    "I need a formal look",
    "What's trending?",
    "Help me match this"
  ];

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    const chatMessages: ChatMessage[] = [...messages, userMessage].map(m => ({
      role: m.type === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    aiService.chat({ messages: chatMessages })
      .then(res => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: res.message,
        };
        setMessages(prev => [...prev, aiResponse]);

        if (res.recommendations && res.recommendations.length > 0) {
          const productMessages: Message[] = res.recommendations.map((r, idx) => ({
            id: `${Date.now() + 2 + idx}`,
            type: 'ai',
            content: r.reason,
            product: r.product,
          }));
          setMessages(prev => [...prev, ...productMessages]);
        }
      })
      .catch(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: "Sorry, I couldn't process that right now. Please try again.",
        };
        setMessages(prev => [...prev, aiResponse]);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-background border-l shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold" data-testid="text-ai-title">AI Stylist</h3>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          data-testid="button-close-chat"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'ai' && (
                <Avatar className="h-8 w-8 bg-primary flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={`flex flex-col gap-2 max-w-[80%]`}>
                <div
                  className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  }`}
                  data-testid={`message-${message.type}-${message.id}`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>

                {message.product && (
                  <Card className="p-3 hover-elevate cursor-pointer" data-testid={`product-card-${message.product.id}`}>
                    <div className="flex gap-3">
                      <img
                        src={message.product.image}
                        alt={message.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{message.product.name}</p>
                        <p className="text-sm font-semibold text-primary">
                          ${message.product.price}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {message.type === 'user' && (
                <Avatar className="h-8 w-8 bg-secondary flex-shrink-0">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-3">
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt) => (
            <Badge
              key={prompt}
              variant="secondary"
              className="cursor-pointer hover-elevate active-elevate-2"
              onClick={() => setInputValue(prompt)}
              data-testid={`badge-prompt-${prompt.toLowerCase().replace(/\s/g, '-')}`}
            >
              {prompt}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            data-testid="button-upload-image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1"
            data-testid="input-chat-message"
          />
          <Button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
