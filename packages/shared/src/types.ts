// -----------Product-----------
// 产品类型
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  originalPrice?: number;
  inStock?: boolean;
}

// -----------Cart-----------
// 购物车项目类型
export interface CartItem {
  productId: string;
  quantity: number;
  name?: string;
  image?: string;
  price?: number;
  description?: string;
  product?: Product;
}

// 购物车类型
export interface Cart {
  items: CartItem[];
}

// -----------User-----------
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  firstName: string;
  lastName: string;
  phone: string;
  // ------Address------
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  // ------Payment------
  paymentMethod: 'alipay' | 'wechat' | 'credit-card';
  cardNumber: string;
  expiration: string;
  cvv: string;
  // ------RegisteredAt------
  registeredAt: Date;
  lastLoginAt: Date;
}

// -----------Order-----------
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

// -----------ApiResponse-----------
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
