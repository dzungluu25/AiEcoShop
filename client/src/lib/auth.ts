import { apiClient, setAuthToken, clearAuthToken } from './api';

export interface User {
  id: string;
  email: string;
  fullname: string;
  role?: string;
  metadata?: {
    creationTime: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignUpData {
  email: string;
  password: string;
  fullname: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    setAuthToken(response.token);
    return response;
  },

  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signin', data);
    setAuthToken(response.token);
    return response;
  },

  async signOut(): Promise<void> {
    try {
      await apiClient.post('/auth/signout');
    } finally {
      clearAuthToken();
    }
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/password-reset', { email });
  },
};
