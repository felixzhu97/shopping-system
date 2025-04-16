// 产品类型
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

// 购物车项目类型
export interface CartItem {
  productId: string;
  quantity: number;
}

// 购物车类型
export interface Cart {
  items: CartItem[];
}
