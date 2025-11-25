import { apiClient } from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  productContext?: string[];
}

export interface ChatResponse {
  message: string;
  recommendations?: Array<{
    productId: string;
    reason: string;
    product?: {
      id: string;
      name: string;
      price: number;
      image: string;
    };
  }>;
}

export interface VisualSearchRequest {
  imageUrl?: string;
  imageFile?: File;
  limit?: number;
}

export interface VisualSearchResult {
  productId: string;
  similarity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

export const aiService = {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    return apiClient.post<ChatResponse>('/ai/chat', request);
  },

  async visualSearch(request: VisualSearchRequest): Promise<VisualSearchResult[]> {
    const payload: Record<string, unknown> = {};
    if (request.imageUrl) payload.imageUrl = request.imageUrl;
    if (request.limit) payload.limit = request.limit;
    return apiClient.post<VisualSearchResult[]>('/ai/visual-search', payload);
  },

  async uploadImageForSearch(file: File): Promise<{ imageUrl: string }> {
    // Upload to storage endpoint
    const response = await apiClient.uploadFile<{ url: string }>('/storage/temp', file, 'search');
    return { imageUrl: response.url };
  },
};
