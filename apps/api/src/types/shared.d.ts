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
    fullName: string;
    email: string;
    role: 'user' | 'admin';
    firstName: string;
    lastName: string;
    phone: string;
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
  }
}
