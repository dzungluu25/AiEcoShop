import React, { useState } from "react";
import { Send, X, Sparkles, Image as ImageIcon, Mic, Volume2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { aiService, type ChatMessage } from "@/lib/ai";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

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
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const suggestedPrompts = [
    "Show me casual outfits",
    "I need a formal look",
    "What's trending?",
    "Help me match this"
  ];

  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported] = useState<boolean>(typeof window !== 'undefined' && (!!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition));
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [voiceLang, setVoiceLang] = useState('en-US');
  const [voiceRate, setVoiceRate] = useState(1);
  const [voicePitch, setVoicePitch] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState<string>('');

  // Load available voices and keep list updated without causing re-render loops
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const update = () => {
      const vs = window.speechSynthesis.getVoices();
      setVoices(vs);
    };
    // Attach listener and fetch initial
    (window.speechSynthesis as any).onvoiceschanged = update;
    update();
    return () => {
      (window.speechSynthesis as any).onvoiceschanged = null;
    };
  }, []);

  React.useEffect(() => {
    if (!voiceName && voices.length > 0) {
      setVoiceName(voices[0].name);
    }
  }, [voices, voiceName]);

  const startVoice = () => {
    if (!voiceSupported || isListening) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = voiceLang;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let finalText = '';
    const t0 = performance.now();
    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += transcript;
        setInputValue(transcript);
      }
    };
    rec.onend = () => {
      setIsListening(false);
      const dt = performance.now() - t0;
      apiClient.post('/ai/metrics/events', { type: 'voice_latency', value: dt }).catch(() => {});
      if (finalText.trim().length > 0) {
        setInputValue(finalText.trim());
        handleSend();
      }
    };
    rec.onerror = () => { setIsListening(false); apiClient.post('/ai/metrics/events', { type: 'voice_error' }).catch(() => {}); };
    setIsListening(true);
    rec.start();
  };

  const speak = (text: string) => {
    if (!ttsEnabled) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voiceLang;
    u.rate = Math.min(2, Math.max(0.5, voiceRate));
    u.pitch = Math.min(2, Math.max(0, voicePitch));
    const v = voices.find(v => v.name === voiceName);
    if (v) u.voice = v;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const handleSend = () => {
    if (!inputValue.trim() || isSending) return;

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

    setIsSending(true);
    aiService.chat({ messages: chatMessages })
      .then(res => {
        apiClient.post('/ai/metrics/events', { type: 'chat_message' }).catch(() => {});
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: res.message,
        };
        setMessages(prev => [...prev, aiResponse]);
        speak(res.message);

        if (res.recommendations && res.recommendations.length > 0) {
          apiClient.post('/ai/metrics/events', { type: 'recommendations' }).catch(() => {});
          const productMessages: Message[] = res.recommendations.map((r, idx) => ({
            id: `${Date.now() + 2 + idx}`,
            type: 'ai',
            content: r.reason,
            product: r.product,
          }));
          setMessages(prev => [...prev, ...productMessages]);
        }
        if ((res as any).orderStatus) {
          const status = (res as any).orderStatus;
          const statusMsg: Message = {
            id: (Date.now() + 3).toString(),
            type: 'ai',
            content: `Order ${status.orderId}: ${status.status}, ETA ${status.eta}`,
          };
          setMessages(prev => [...prev, statusMsg]);
          apiClient.post('/ai/metrics/events', { type: 'order_status' }).catch(() => {});
          speak(statusMsg.content);
        }
      })
      .catch(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: "Sorry, I couldn't process that right now. Please try again.",
        };
        setMessages(prev => [...prev, aiResponse]);
      })
      .finally(() => setIsSending(false));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const { imageUrl } = await aiService.uploadImageForSearch(file);
      
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: `I uploaded an image for visual search`
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Perform visual search
      const results = await aiService.visualSearch({ imageUrl, limit: 3 });
      
      if (results.length > 0) {
        const productMessages: Message[] = results.map((r, idx) => ({
          id: `${Date.now() + idx}`,
          type: 'ai',
          content: `I found this similar product: ${r.product.name}`,
          product: r.product,
        }));
        setMessages(prev => [...prev, ...productMessages]);
      } else {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: "I couldn't find similar products for your image. Try uploading a clearer image or ask me to help you find something specific.",
        };
        setMessages(prev => [...prev, aiResponse]);
      }
      
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
            disabled={isUploading}
            asChild
          >
            <label className="cursor-pointer">
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={!voiceSupported || isListening}
            onClick={startVoice}
            aria-label="Start voice input"
            data-testid="button-voice"
          >
            {isListening ? (
              <div className="animate-pulse"><Mic className="h-4 w-4" /></div>
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTtsEnabled(v => !v)}
            aria-label="Toggle voice playback"
            data-testid="button-tts"
          >
            <Volume2 className={`h-4 w-4 ${ttsEnabled ? '' : 'opacity-40'}`} />
          </Button>
          {/* Voice configuration */}
          <select className="border rounded px-2 text-sm" value={voiceLang} onChange={(e) => setVoiceLang(e.target.value)} aria-label="Voice language">
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="vi-VN">Vietnamese</option>
          </select>
          <select className="border rounded px-2 text-sm" value={voiceName} onChange={(e) => setVoiceName(e.target.value)} aria-label="Voice">
            {voices.map(v => (<option key={v.name} value={v.name}>{v.name}</option>))}
          </select>
          <input type="range" min={0.5} max={2} step={0.1} value={voiceRate} onChange={(e) => setVoiceRate(parseFloat(e.target.value))} aria-label="Voice rate" />
          <input type="range" min={0} max={2} step={0.1} value={voicePitch} onChange={(e) => setVoicePitch(parseFloat(e.target.value))} aria-label="Voice pitch" />
          <div className="relative flex-1 min-w-0 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              aria-label="Chat input"
              className="w-full pl-10 pr-12 rounded-full bg-background border transition-all duration-200 ease-out focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
              data-testid="input-chat-message"
            />
          </div>
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
