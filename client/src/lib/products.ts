import { apiClient } from './api';

export interface BackendProduct {
  id: string;
  name: string;
  brand?: string;
  description: string;
  price: number;
  maxQuantity: number;
  stock: number;
  image: string;
  imgUrl: string;
  slug: string;
  status: string;
  keywords: string[];
  sizes?: number[];
  availableColors?: string[];
  isFeatured: boolean;
  isRecommended: boolean;
  name_lower: string;
  dateAdded: string;
}

export interface FrontendProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  brand?: string;
  description?: string;
  stock?: number;
  sizes?: string[];
  colors?: string[];
  isFeatured?: boolean;
}

export interface ProductDetail extends FrontendProduct {
  images: string[];
  description: string;
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
}

function transformProduct(product: BackendProduct): FrontendProduct {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image || product.imgUrl,
    category: product.brand || 'General',
    brand: product.brand,
    description: product.description,
    stock: product.stock,
    sizes: product.sizes?.map(s => s.toString()),
    colors: product.availableColors,
    isFeatured: product.isFeatured,
  };
}

function transformProductDetail(product: BackendProduct): ProductDetail {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image || product.imgUrl,
    images: [product.image || product.imgUrl],
    category: product.brand || 'General',
    brand: product.brand,
    description: product.description,
    stock: product.stock,
    sizes: product.sizes?.map(s => `Size ${s}`),
    colors: product.availableColors,
    inStock: product.stock > 0,
  };
}

export const productService = {
  async getAllProducts(params?: { lastKey?: string; limit?: number }): Promise<FrontendProduct[]> {
    const queryParams = new URLSearchParams();
    if (params?.lastKey) queryParams.append('lastKey', params.lastKey);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const products = await apiClient.get<BackendProduct[]>(endpoint);
    return products.map(transformProduct);
  },

  async getProductById(id: string): Promise<ProductDetail> {
    const product = await apiClient.get<BackendProduct>(`/products/${id}`);
    return transformProductDetail(product);
  },

  async searchProducts(query: string, limit?: number): Promise<FrontendProduct[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (limit) queryParams.append('limit', limit.toString());
    
    const products = await apiClient.get<BackendProduct[]>(`/products/search?${queryParams.toString()}`);
    return products.map(transformProduct);
  },

  async getFeaturedProducts(): Promise<FrontendProduct[]> {
    const products = await apiClient.get<BackendProduct[]>('/products/featured');
    return products.map(transformProduct);
  },

  async getRecommendedProducts(): Promise<FrontendProduct[]> {
    const products = await apiClient.get<BackendProduct[]>('/products/recommended');
    return products.map(transformProduct);
  },

  async createProduct(data: Partial<BackendProduct>): Promise<BackendProduct> {
    const id = await apiClient.post<{ key: string }>('/products/generate-key', {});
    return apiClient.post<BackendProduct>(`/products/${id.key}`, data);
  },

  async updateProduct(id: string, data: Partial<BackendProduct>): Promise<BackendProduct> {
    return apiClient.put<BackendProduct>(`/products/${id}`, data);
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};
