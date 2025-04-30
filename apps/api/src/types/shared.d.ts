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
    // ------Id------
    id: string;
    // ------UserInfo------
    fullName: string;
    email: string;
    role: 'user' | 'admin';
    firstName: string;
    lastName: string;
    phone: string;
    address: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
    };
    payment: {
      paymentMethod: 'alipay' | 'wechat' | 'credit-card';
      cardNumber?: string;
      expiration?: string;
      cvv?: string;
    };
    // ------RegisteredAt------
    registeredAt: Date;
    lastLoginAt: Date;
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
    // ------User------
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    // ------Address------
    address: string;
    city: string;
    province: string;
    postalCode: string;
    // ------Payment------
    paymentMethod: 'alipay' | 'wechat' | 'credit-card';
    cardNumber: string;
    expiration: string;
    cvv: string;
  }
}
