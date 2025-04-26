export type { Product, CartItem } from 'shared';

export interface Order {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  createdAt: string;
  shippingAddress: {
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
}
