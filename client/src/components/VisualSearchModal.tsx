import { useState, useCallback, useRef } from "react";
import { Upload, X, Camera, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ProductCard, { type Product } from "./ProductCard";
import { aiService, type VisualSearchResult } from "@/lib/ai";
import { useToast } from "@/hooks/use-toast";

interface VisualSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductClick?: (product: Product) => void;
}

export default function VisualSearchModal({ isOpen, onClose, onProductClick }: VisualSearchModalProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const runVisualSearch = async (imageUrl: string) => {
    setIsSearching(true);
    try {
      const res: VisualSearchResult[] = await aiService.visualSearch({ imageUrl, limit: 9 });
      const mapped: Product[] = res.map(r => ({
        id: r.product.id,
        name: r.product.name,
        price: r.product.price,
        image: r.product.image,
        category: 'Similar',
      }));
      setResults(mapped);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedImage(dataUrl);
        try {
          const { imageUrl } = await aiService.uploadImageForSearch(file);
          await runVisualSearch(imageUrl);
        } catch {
          setIsSearching(false);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedImage(dataUrl);
        try {
          const { imageUrl } = await aiService.uploadImageForSearch(file);
          await runVisualSearch(imageUrl);
        } catch {
          setIsSearching(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setIsSearching(false);
    setResults([]);
    setCameraError(null);
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      setCameraError('Camera access denied. Please allow camera access to use this feature.');
      toast({
        title: "Camera access denied",
        description: "Please allow camera access in your browser settings to use this feature.",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setUploadedImage(dataUrl);
      
      // Stop camera stream
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraActive(false);
      
      // Process the captured image
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          try {
            const { imageUrl } = await aiService.uploadImageForSearch(file);
            await runVisualSearch(imageUrl);
          } catch (error) {
            toast({
              title: "Image processing failed",
              description: "There was an error processing your photo. Please try again.",
              variant: "destructive",
            });
          }
        }
      }, 'image/jpeg');
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
    setIsCameraActive(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Visual Search
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {!uploadedImage ? (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              data-testid="dropzone-visual-search"
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Upload an image to find similar products</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Drag and drop an image here, or click to browse
              </p>
              <div className="flex justify-center gap-3">
                <Button asChild data-testid="button-upload-file">
                  <label>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                  </label>
                </Button>
                <Button variant="outline" data-testid="button-use-camera" onClick={startCamera}>
                  <Camera className="h-4 w-4 mr-2" />
                  Use Camera
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {isCameraActive ? (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-md mx-auto rounded-lg"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button onClick={capturePhoto}>
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Cancel
                    </Button>
                  </div>
                  {cameraError && (
                    <p className="text-sm text-destructive text-center">{cameraError}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-48 h-48 object-cover rounded-lg"
                      data-testid="img-uploaded"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -top-2 -right-2"
                      onClick={handleReset}
                      data-testid="button-remove-image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                <div className="flex-1">
                  {isSearching ? (
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      <Sparkles className="h-5 w-5 animate-pulse text-primary" />
                      <p className="text-sm" data-testid="text-searching">
                        Searching for similar products...
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold mb-2" data-testid="text-results-title">
                        Found {results.length} similar items
                      </h3>
                      <p className="text-sm text-muted-foreground">
                    These products match your uploaded image based on style, color, and design.
                  </p>
                </div>
              )}
                </div>
                </div>
              )}
              
              {!isSearching && (
                <div className="grid grid-cols-3 gap-4">
                  {results.map((product, index) => (
                    <div key={product.id} data-testid={`result-${index}`}>
                      <div className="aspect-square rounded-lg mb-2 overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-sm font-semibold text-primary">${product.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
