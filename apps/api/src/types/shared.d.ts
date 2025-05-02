/**
 * 共享模块类型声明文件
 */
declare module 'shared' {
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

  export interface CartItem {
    productId: string;
    quantity: number;
    product?: Product;
  }

  export interface Cart {
    items: CartItem[];
  }

  export interface User {
    id: string;
    email: string;
    role: 'user' | 'admin';
    firstName: string;
    lastName: string;
    phone: string;
    // 收货地址
    address: string;
    city: string;
    province: string;
    postalCode: string;
    // 支付信息
    paymentMethod: 'alipay' | 'wechat' | 'credit-card';
    cardNumber: string;
    expiration: string;
    cvv: string;
  }

  export interface UserLogin {
    emailOrPhone: string;
    password: string;
  }

  export interface UserRegister
    extends Pick<User, 'email' | 'password' | 'firstName' | 'lastName' | 'phone'> {}

  export interface UserResetPassword {
    emailOrPhone: string;
    newPassword: string;
  }

  export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Payment {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    paymentMethod: 'alipay' | 'wechat' | 'credit-card';
    cardNumber: string;
    expiration: string;
    cvv: string;
  }
}

export interface ErrorResponse {
  message: string;
  field?: string;
}
