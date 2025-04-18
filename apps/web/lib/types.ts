export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description?: string;
  image?: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  stock?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}
