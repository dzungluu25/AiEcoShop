import { apiClient } from './api';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export const orderService = {
  async list(): Promise<Order[]> { return apiClient.get<Order[]>('/orders'); },
  async get(id: string): Promise<Order> { return apiClient.get<Order>(`/orders/${id}`); },
  async updateStatus(id: string, status: string): Promise<Order> { return apiClient.put<Order>(`/orders/${id}/status`, { status }); },
  async exportCsv(): Promise<string> { return apiClient.get<string>('/orders/export'); },
};

