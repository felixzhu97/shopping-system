export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

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

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}
