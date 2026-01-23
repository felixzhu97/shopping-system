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
  id?: string;
  password?: string;
  role?: UserRole;
  token?: string;
  // -------用户信息-------
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  // -------收货地址-------
  address: string;
  city: string;
  province: string;
  postalCode: string;
  // -------支付信息-------
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

// -----------Payment-----------
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

// -----------ApiResponse-----------
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface ErrorResponse {
  message: string;
  fields?: string[];
}
