import { apiClient } from './api';

export interface CartItemPayload {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
}

export interface QuoteResponse {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  codeApplied?: string;
}

export const cartService = {
  async getCart(): Promise<CartItemPayload[]> {
    return apiClient.get<CartItemPayload[]>('/cart');
  },
  async setCart(items: CartItemPayload[]): Promise<CartItemPayload[]> {
    return apiClient.post<CartItemPayload[]>('/cart', items);
  },
  async upsertItem(item: CartItemPayload): Promise<CartItemPayload[]> {
    return apiClient.put<CartItemPayload[]>('/cart/item', item);
  },
  async removeItem(productId: string): Promise<CartItemPayload[]> {
    return apiClient.delete<CartItemPayload[]>(`/cart/item/${productId}`);
  },
  async quote(): Promise<QuoteResponse> {
    return apiClient.post<QuoteResponse>('/cart/quote', {});
  },
  async applyCoupon(code: string): Promise<QuoteResponse> {
    return apiClient.post<QuoteResponse>('/cart/apply-coupon', { code });
  },
};

