# 04. ফ্রন্টএন্ড-ব্যাকএন্ড সংযোগ ও এপিআই কলিং আর্কিটেকচার (Frontend Integration)

---

### ১. সংযোগ আর্কিটেকচার ওভারভিউ (Overview)

আমাদের অ্যাপ্লিকেশনটি একটি আধুনিক **Decoupled Architecture** অনুসরণ করে। ফ্রন্টএন্ড (Next.js 14) এবং ব্যাকএন্ড (.NET 9.0) দুটি সম্পূর্ণ স্বাধীন প্রসেসে রান করে এবং স্ট্যান্ডার্ড **HTTP REST API (JSON)** এর মাধ্যমে নিজেদের মধ্যে ডেটা আদান-প্রদান করে।

```
┌───────────────────────────────────────────────┐
│ NEXT.JS 14 FRONTEND (CLIENT)                  │
│ Port: 3000 (React Server & Client Components) │
│ - UI Buttons, Forms, Dashboard, Cart          │
└───────────────────────┬───────────────────────┘
                        │
                        ▼  Axios HTTP Calls
┌───────────────────────────────────────────────┐
│ AXIOS API CLIENT (frontend/services/api.ts)   │
│ - Base URL: http://localhost:5001/api         │
│ - Request Interceptor: Injects Bearer Token   │
│ - Response Interceptor: Auto Token Refresh    │
└───────────────────────┬───────────────────────┘
                        │
                        ▼  HTTP REST Requests (JSON)
                        │  (Over Port 5001 with CORS Headers)
┌───────────────────────────────────────────────┐
│ ASP.NET CORE 9.0 WEB API                      │
│ - Kestrel Web Server                          │
│ - Exception Handling, JWT Auth, CORS          │
│ - Controllers & Application Services          │
└───────────────────────┬───────────────────────┘
                        │
                        ▼  Npgsql Database Connection
┌───────────────────────────────────────────────┐
│ SUPABASE CLOUD POSTGRESQL                     │
└───────────────────────────────────────────────┘
```

---

### ২. Axios ক্লায়েন্ট কনফিগারেশন (`frontend/services/api.ts`)

ফ্রন্টএন্ডে সমস্ত HTTP কমিউনিকেশন সেন্ট্রালাইজড করার জন্য **Axios** লাইব্রেরি কনফিগার করা হয়েছে:

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000;

export const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

### ৩. Axios ইন্টারসেপ্টর ও টোকেন ম্যানেজমেন্ট (Interceptors Deep Dive)

ইন্টারসেপ্টর (Interceptor) হলো এমন একটি মেকানিজম যা রিকোয়েস্ট সার্ভারে যাওয়ার ঠিক আগে এবং রেসপন্স কম্পোনেন্টে পৌঁছানোর ঠিক আগে ডেটা পরীক্ষা ও পরিবর্তন করতে পারে।

#### ক. Request Interceptor (অটোমেটিক Bearer Token ইনজেকশন)
যখনই ইউজার কোনো সুরক্ষিত API কল করে (যেমন: অর্ডার দেওয়া, কার্ট আপডেট, ডিলার ড্যাশবোর্ড দেখা), তখন এই ইন্টারসেপ্টর ব্রাউজারের `localStorage` থেকে অ্যাক্সেস টোকেন বের করে স্বয়ংক্রিয়ভাবে HTTP হেডারে যোগ করে:

```typescript
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        // .NET ব্যাকএন্ডের JWT হ্যান্ডলারের জন্য Authorization হেডার সেট করা হচ্ছে
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);
```

#### খ. Response Interceptor (সাইলেন্ট টোকেন রিফ্রেশ ও অটো রিকানেক্ট)
JWT টোকেনের একটি নির্দিষ্ট মেয়াদ (Expiry time) থাকে। মেয়াদ শেষ হলে ব্যাকএন্ড **401 Unauthorized** পাঠায়। 
আমাদের রেসপন্স ইন্টারসেপ্টর ইউজারকে লগআউট না করিয়ে ব্যাকগ্রাউন্ডে নিরবচ্ছিন্নভাবে (Silently) নতুন টোকেন সংগ্রহ করে মূল রিকোয়েস্টটি পুনরায় রান করে:

```typescript
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // যদি এরর কোড 401 হয় এবং এই রিকোয়েস্টটি পূর্বে রিট্রাই না করা হয়ে থাকে
    if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
      originalRequest._retry = true; // অসীম লুপ (Infinite Loop) প্রতিরোধে ফ্ল্যাগ সেট
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // ব্যাকএন্ডের রিফ্রেশ এন্ডপয়েন্টে রিকোয়েস্ট
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { token } = response.data;

          // নতুন টোকেন সেভ করা
          localStorage.setItem('accessToken', token);

          // ব্যর্থ হওয়া মূল রিকোয়েস্টের হেডারে নতুন টোকেন বসিয়ে পুনরায় সার্ভারে পাঠানো
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }
      } catch {
        // যদি রিফ্রেশ টোকেনও এক্সপায়ার হয়ে যায়, তবে সেশন ক্লিয়ার করে লগইন পেজে রিডাইরেক্ট
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);
```

> **শিক্ষকের জন্য গুরুত্বপূর্ণ পয়েন্ট**: কেন Response Interceptor-এ `_retry` ফ্ল্যাগ ব্যবহার করা হয়েছে?
> **উত্তর**: যদি ইউজারের রিফ্রেশ টোকেনটিও ইনভ্যালিড হয়ে থাকে, তবে বারবার 401 এরর আসতে থাকবে এবং ব্রাউজার ইনফিনিট লুপে পড়ে সার্ভার ক্র্যাশ করাতে পারে। `_retry = true` নিশ্চিত করে একটি ব্যর্থ রিকোয়েস্ট সর্বোচ্চ একবারই রিট্রাই হবে।

---

### ৪. মডুলার সার্ভিস স্ট্রাকচার (Modular API Services)

কোড পরিচ্ছন্ন ও রিইউজেবল রাখতে ফ্রন্টএন্ডে ফিচারভিত্তিক API অবজেক্ট তৈরি করা হয়েছে:

```typescript
// ১. অথেনটিকেশন ও প্রোফাইল
export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
  updateProfile: (data: UpdateProfileRequest) => api.put<User>('/auth/me', data),
};

// ২. ডিলার পোর্টাল
export const dealerApi = {
  getProfile: () => api.get('/dealers/profile'),
  getProducts: (params?: { status?: string; page?: number; pageSize?: number }) =>
    api.get('/dealers/products', { params }),
  createProduct: (data: CreateProductRequest) => api.post('/dealers/products', data),
  getOrders: (params?: { page?: number; pageSize?: number }) => api.get('/dealers/orders', { params }),
  updateOrderStatus: (id: string, status: string) =>
    api.put(`/dealers/orders/${id}/status`, { status }),
  getSales: () => api.get('/dealers/sales'),
};

// ৩. পাবলিক স্টোরফ্রন্ট
export const publicApi = {
  getProducts: (params?: Record<string, string | number | undefined>) =>
    api.get('/products', { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  getCategories: () => api.get('/categories'),
};

// ৪. কাস্টমার কার্ট ও অর্ডার
export const customerApi = {
  getCart: () => api.get('/cart'),
  addToCart: (productId: string, quantity: number) => api.post('/cart/items', { productId, quantity }),
  createOrder: (data: CreateOrderRequest) => api.post('/orders', data),
  getOrders: (params?: { page?: number; pageSize?: number }) => api.get('/orders', { params }),
};

// ৫. এডমিন ম্যানেজমেন্ট
export const adminApi = {
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getDealers: (params?: any) => api.get('/admin/dealers', { params }),
  approveDealer: (id: string) => api.put(`/admin/dealers/${id}/approve`),
  getPendingProducts: (params?: any) => api.get('/admin/products/pending', { params }),
  approveProduct: (id: string) => api.put(`/admin/products/${id}/approve`),
  rejectProduct: (id: string, data: any) => api.put(`/admin/products/${id}/reject`, data),
  getStats: () => api.get('/admin/stats'),
};
```

---

### ৫. এন্ড-টু-এন্ড ডাটা এক্সিকিউশন সিকোয়েন্স (End-to-End Sequence Trace)

একটি বাস্তব উদাহরণের মাধ্যমে ফ্রন্টএন্ড থেকে ব্যাকএন্ড ডাটাবেস পর্যন্ত সম্পূর্ণ প্রবাহটি নিচে দেখানো হলো (যেমন: কাস্টমার যখন **"Place Order"** বাটনে ক্লিক করে):

```
1. [User Interaction]
   Customer clicks "Place Order" button in Checkout UI component (`app/checkout/page.tsx`).
        │
2. [Frontend Call]
   Component triggers `customerApi.createOrder({ shippingAddress: "..." })`.
        │
3. [Axios Request Interceptor]
   Interceptor extracts JWT `accessToken` from `localStorage`.
   Attaches `Authorization: Bearer eyJhbGciOi...` header.
        │
4. [Network Dispatch]
   HTTP POST sent to `http://localhost:5001/api/orders`.
        │
5. [Kestrel & ASP.NET Core Middleware Pipeline]
   - ExceptionHandlingMiddleware wraps the context.
   - UseCors checks origin `http://localhost:3000` (Passed).
   - UseAuthentication decodes JWT, verifies signature, extracts Customer GUID & Role.
   - UseAuthorization checks `[Authorize(Roles = "Customer")]` (Passed).
        │
6. [Controller Dispatch]
   `OrderController.CreateOrder` invoked with parsed `OrderRequest` body.
        │
7. [Application Service Logic]
   `OrderService.CreateAsync` executes:
   - Fetches Customer Cart & verifies items exist.
   - Checks Product stock and approval status.
   - Decrements product stock quantity atomically.
   - Creates Order & OrderItems records with snapshot pricing.
   - Clears cart items.
        │
8. [Database Persistence]
   `_unitOfWork.SaveChangesAsync()` commits the transaction into Supabase PostgreSQL.
        │
9. [HTTP Response]
   Controller returns `201 Created` with JSON `OrderResponse`.
        │
10. [Frontend State Update]
    Axios resolves promise -> React updates order state -> Router redirects user to `/orders/[id]` success page.
```
