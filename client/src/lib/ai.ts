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
    // TODO: Replace with actual AI endpoint when available
    // For now, return mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: "I'd be happy to help you find the perfect items! Based on your request, here are some curated recommendations that match your style.",
          recommendations: [],
        });
      }, 1000);
    });
  },

  async visualSearch(request: VisualSearchRequest): Promise<VisualSearchResult[]> {
    // TODO: Replace with actual visual search endpoint when available
    // For now, return mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 1500);
    });
  },

  async uploadImageForSearch(file: File): Promise<{ imageUrl: string }> {
    // Upload to storage endpoint
    const response = await apiClient.uploadFile<{ url: string }>('/storage/temp', file, 'search');
    return { imageUrl: response.url };
  },
};
