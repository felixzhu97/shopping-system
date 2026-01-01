import { type TextProps, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

// 产品模型
export interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  category?: string;
  stock?: number;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 购物车商品模型
export interface CartItem {
  productId: string;
  quantity: number;
  name?: string;
  image?: string;
  price?: number;
  description?: string;
  product?: Product;
}

// 产品辅助方法
export const ProductHelpers = {
  getAllImages: (product: Product): string[] => {
    const allImages: string[] = [];
    if (product.image) {
      allImages.push(product.image);
    }
    if (product.images && product.images.length > 0) {
      allImages.push(...product.images);
    }
    return allImages;
  },

  hasStock: (product: Product): boolean => {
    return product.inStock ?? (product.stock ?? 0) > 0;
  },

  discountPercentage: (product: Product): number | null => {
    if (!product.originalPrice || product.originalPrice <= product.price) {
      return null;
    }
    return Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );
  },
};

// 购物车商品辅助方法
export const CartItemHelpers = {
  subtotal: (item: CartItem): number => {
    const productPrice = item.product?.price ?? item.price ?? 0;
    return productPrice * item.quantity;
  },
};
