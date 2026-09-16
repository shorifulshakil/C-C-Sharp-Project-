import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  DealerProfile,
  PaginatedResponse,
  CreateProductRequest,
  CreateOrderRequest,
  UpdateUserStatusRequest,
  RejectProductRequest,
  UpdateProfileRequest,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7001/api';
const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000;

export const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { token } = response.data;
          localStorage.setItem('accessToken', token);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
  updateProfile: (data: UpdateProfileRequest) => api.put<User>('/auth/me', data),
};

export const dealerApi = {
  getProfile: () => api.get('/dealers/profile'),
  updateProfile: (data: Partial<DealerProfile>) => api.put('/dealers/profile', data),
  getProducts: (params?: { status?: string; page?: number; pageSize?: number }) =>
    api.get('/dealers/products', { params }),
  getProduct: (id: string) => api.get(`/dealers/products/${id}`),
  createProduct: (data: CreateProductRequest) => api.post('/dealers/products', data),
  updateProduct: (id: string, data: Partial<CreateProductRequest>) =>
    api.put(`/dealers/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/dealers/products/${id}`),
  getOrders: (params?: { page?: number; pageSize?: number }) =>
    api.get('/dealers/orders', { params }),
  updateOrderStatus: (id: string, status: string) =>
    api.put(`/dealers/orders/${id}/status`, { status }),
  getSales: () => api.get('/dealers/sales'),
};

export const publicApi = {
  getProducts: (params?: Record<string, string | number | undefined>) =>
    api.get('/products', { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  getCategories: () => api.get('/categories'),
  getDealerPublicProfile: (id: string) => api.get(`/dealers/${id}/public-profile`),
};

export const customerApi = {
  getCart: () => api.get('/cart'),
  addToCart: (productId: string, quantity: number) => api.post('/cart/items', { productId, quantity }),
  updateCartItem: (id: string, quantity: number) => api.put(`/cart/items/${id}`, { quantity }),
  removeCartItem: (id: string) => api.delete(`/cart/items/${id}`),
  createOrder: (data: CreateOrderRequest) => api.post('/orders', data),
  getOrders: (params?: { page?: number; pageSize?: number }) => api.get('/orders', { params }),
  getOrder: (id: string) => api.get(`/orders/${id}`),
};

export const adminApi = {
  getUsers: (params?: { role?: string; isActive?: boolean; search?: string; page?: number; pageSize?: number }) =>
    api.get('/admin/users', { params }),
  updateUserStatus: (id: string, data: UpdateUserStatusRequest) =>
    api.put(`/admin/users/${id}/status`, data),
  getDealers: (params?: { search?: string; category?: string; page?: number; pageSize?: number }) =>
    api.get('/admin/dealers', { params }),
  getDealer: (id: string) => api.get(`/admin/dealers/${id}`),
  getDealerCustomers: (dealerId: string) => api.get(`/admin/dealers/${dealerId}/customers`),
  createDealer: (data: { shopName: string; shopDescription?: string; shopCategory: string; address: string; logoUrl?: string; isApproved: boolean; email: string; password: string; fullName: string; phone?: string }) =>
    api.post('/admin/dealers', data),
  updateDealer: (id: string, data: { shopName?: string; shopDescription?: string; shopCategory?: string; address?: string; logoUrl?: string; isApproved?: boolean; email?: string; password?: string; fullName?: string; phone?: string }) =>
    api.put(`/admin/dealers/${id}`, data),
  deleteDealer: (id: string) => api.delete(`/admin/dealers/${id}`),
  approveDealer: (id: string) => api.put(`/admin/dealers/${id}/approve`),
  clearDemoData: () => api.post('/admin/clear-demo-data'),
  getPendingProducts: (params?: { page?: number; pageSize?: number }) =>
    api.get('/admin/products/pending', { params }),
  approveProduct: (id: string) => api.put(`/admin/products/${id}/approve`),
  rejectProduct: (id: string, data: RejectProductRequest) =>
    api.put(`/admin/products/${id}/reject`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  getCategories: (params?: { page?: number; pageSize?: number }) =>
    api.get('/admin/categories', { params }),
  createCategory: (data: { name: string; description?: string; parentCategoryId?: string }) =>
    api.post('/admin/categories', data),
  updateCategory: (id: string, data: { name?: string; description?: string; parentCategoryId?: string }) =>
    api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
  getStats: () => api.get('/admin/stats'),
};
