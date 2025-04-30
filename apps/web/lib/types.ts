export type { Product, CartItem } from 'shared';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  paymentMethod: 'credit-card' | 'alipay' | 'wechat';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name?: string;
  image?: string;
  price?: number;
  quantity: number;
  product?: import('shared').Product;
}
