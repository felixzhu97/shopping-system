import { Product as SharedProduct } from 'shared';

// 重新导出shared包中的Product类型
export type Product = SharedProduct;

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}
