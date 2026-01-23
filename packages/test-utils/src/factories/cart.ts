import { CartItem, Product } from 'types';
import { createProduct } from './product';

export interface CartItemFactoryOptions {
  productId?: string;
  quantity?: number;
  product?: Product;
  name?: string;
  image?: string;
  price?: number;
  description?: string;
}

let cartItemCounter = 0;

function generateProductId() {
  return `prod-${++cartItemCounter}`;
}

/**
 * Cart 数据工厂
 */
export const createCartItem = {
  /**
   * 创建完整的购物车项目对象
   */
  create: (overrides: CartItemFactoryOptions = {}): CartItem => {
    const productId = overrides.productId || generateProductId();
    const product = overrides.product || createProduct.create({ id: productId });

    return {
      productId,
      quantity: overrides.quantity ?? 1,
      product,
      name: overrides.name || product.name,
      image: overrides.image || product.image,
      price: overrides.price ?? product.price,
      description: overrides.description || product.description,
    };
  },

  /**
   * 批量创建购物车项目
   */
  createMany: (count: number, overrides: CartItemFactoryOptions = {}): CartItem[] => {
    return Array.from({ length: count }, (_, index) => {
      const baseIndex = cartItemCounter;
      cartItemCounter++;
      return createCartItem.create({
        ...overrides,
        productId: overrides.productId || generateProductId(),
      });
    });
  },

  /**
   * 创建部分购物车项目对象（用于更新操作）
   */
  createPartial: (overrides: Partial<CartItemFactoryOptions> = {}): Partial<CartItem> => {
    return {
      ...(overrides.quantity !== undefined && { quantity: overrides.quantity }),
      ...(overrides.name && { name: overrides.name }),
      ...(overrides.image && { image: overrides.image }),
      ...(overrides.price !== undefined && { price: overrides.price }),
      ...(overrides.description && { description: overrides.description }),
      ...(overrides.product && { product: overrides.product }),
    };
  },

  /**
   * 创建最小购物车项目对象（仅必需字段）
   */
  createMinimal: (overrides: Partial<CartItemFactoryOptions> = {}): CartItem => {
    const productId = overrides.productId || generateProductId();
    return {
      productId,
      quantity: overrides.quantity ?? 1,
    };
  },

  /**
   * 创建多个数量的购物车项目
   */
  createWithQuantity: (quantity: number, overrides: CartItemFactoryOptions = {}): CartItem => {
    return createCartItem.create({
      ...overrides,
      quantity,
    });
  },
};
