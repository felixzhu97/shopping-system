export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  modelKey?: string;
  category: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  originalPrice?: number;
  inStock?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  name?: string;
  image?: string;
  price?: number;
  description?: string;
  product?: Product;
}

export interface Cart {
  items: CartItem[];
}

export type UserRole = 'user' | 'admin';

export interface User {
  id?: string;
  password?: string;
  role?: UserRole;
  token?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  paymentMethod: PaymentMethod;
}

export interface UserRegister
  extends Pick<User, 'email' | 'password' | 'firstName' | 'lastName' | 'phone'> {}

export interface UserLogin {
  emailOrPhone: string;
  password: string;
}

export interface UserResetPassword {
  emailOrPhone: string;
  newPassword: string;
}

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

export type PaymentMethod = 'alipay' | 'wechat' | 'credit-card';

export interface Payment {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  paymentMethod: PaymentMethod;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface ErrorResponse {
  message: string;
  fields?: string[];
}
