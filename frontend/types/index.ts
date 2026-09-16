export type UserRole = 'Admin' | 'Dealer' | 'Customer';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Unpublished';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  shippingAddress?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface DealerProfile {
  id: string;
  shopName: string;
  shopDescription?: string;
  shopCategory: string;
  address: string;
  logoUrl?: string;
  avatarUrl?: string;
  isApproved: boolean;
  createdAt: string;
  userFullName?: string;
  userEmail?: string;
  userPhone?: string;
  fullName?: string;
  phone?: string;
  userIsActive?: boolean;
  customerCount?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  displayOrder: number;
}

export interface Product {
  id: string;
  dealerId: string;
  dealerName?: string;
  dealerOwnerName?: string;
  dealerAddress?: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  sku?: string;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  dealer?: DealerProfile;
  category?: Category;
  images?: ProductImage[];
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  priceAtAdd: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  customerId: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName?: string;
  productImageUrl?: string;
  dealerId: string;
  dealerName?: string;
  quantity: number;
  unitPriceAtPurchase: number;
  subtotal: number;
  product?: Product;
  dealer?: DealerProfile;
}

export interface Order {
  id: string;
  customerId: string;
  customerName?: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalDealers: number;
  totalCustomers: number;
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  rejectedProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface AuthResponse {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  shopName?: string;
}


export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  categoryId: string;
  sku?: string;
  images?: { imageUrl: string; displayOrder: number }[];
}

export interface CreateOrderRequest {
  shippingAddress: string;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export interface RejectProductRequest {
  rejectionReason: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  shippingAddress?: string;
  newPassword?: string;
  currentPassword?: string;
}

export interface DealerSalesCustomer {
  customerId: string;
  customerName: string;
  customerEmail: string;
  quantity: number;
  subtotal: number;
  orderDate: string;
}

export interface DealerSalesItem {
  productId: string;
  productName: string;
  productImageUrl?: string;
  unitPrice: number;
  totalQuantitySold: number;
  totalRevenue: number;
  customers: DealerSalesCustomer[];
}

export interface DealerSalesResponse {
  items: DealerSalesItem[];
  totalOrders: number;
  totalProductsSold: number;
  totalRevenue: number;
}
