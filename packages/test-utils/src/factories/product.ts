import { Product } from 'types';

export interface ProductFactoryOptions {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  originalPrice?: number;
  inStock?: boolean;
}

const categories = ['electronics', 'clothing', 'home', 'books', 'food'];
const categoryNames = {
  electronics: '电子产品',
  clothing: '服装',
  home: '家居厨房',
  books: '图书',
  food: '食品',
};

let productCounter = 0;

function generateProductId() {
  return `prod-${++productCounter}`;
}

function generateProductName(category?: string, index?: number) {
  const idx = index ?? productCounter;
  const categoryName = category ? categoryNames[category as keyof typeof categoryNames] || category : '商品';
  return `${categoryName} ${idx + 1}`;
}

/**
 * Product 数据工厂
 */
export const createProduct = {
  /**
   * 创建完整的产品对象
   */
  create: (overrides: ProductFactoryOptions = {}): Product => {
    const id = overrides.id || generateProductId();
    const category = overrides.category || categories[0];

    return {
      id,
      name: overrides.name || generateProductName(category),
      description: overrides.description || `这是${overrides.name || generateProductName(category)}的描述`,
      price: overrides.price ?? 99.99,
      image: overrides.image || `https://example.com/images/${id}.jpg`,
      category,
      stock: overrides.stock ?? 100,
      rating: overrides.rating ?? 4.5,
      reviewCount: overrides.reviewCount ?? 123,
      originalPrice: overrides.originalPrice,
      inStock: overrides.inStock ?? true,
    };
  },

  /**
   * 批量创建产品
   */
  createMany: (count: number, overrides: ProductFactoryOptions = {}): Product[] => {
    return Array.from({ length: count }, (_, index) => {
      const baseIndex = productCounter;
      productCounter++;
      return createProduct.create({
        ...overrides,
        id: overrides.id || generateProductId(),
        name: overrides.name || generateProductName(overrides.category, baseIndex),
      });
    });
  },

  /**
   * 创建部分产品对象（用于更新操作）
   */
  createPartial: (overrides: Partial<ProductFactoryOptions> = {}): Partial<Product> => {
    return {
      ...(overrides.name && { name: overrides.name }),
      ...(overrides.description && { description: overrides.description }),
      ...(overrides.price !== undefined && { price: overrides.price }),
      ...(overrides.image && { image: overrides.image }),
      ...(overrides.category && { category: overrides.category }),
      ...(overrides.stock !== undefined && { stock: overrides.stock }),
      ...(overrides.rating !== undefined && { rating: overrides.rating }),
      ...(overrides.reviewCount !== undefined && { reviewCount: overrides.reviewCount }),
      ...(overrides.originalPrice !== undefined && { originalPrice: overrides.originalPrice }),
      ...(overrides.inStock !== undefined && { inStock: overrides.inStock }),
    };
  },

  /**
   * 创建最小产品对象（仅必需字段）
   */
  createMinimal: (overrides: Partial<ProductFactoryOptions> = {}): Product => {
    return createProduct.create({
      ...overrides,
      rating: undefined,
      reviewCount: undefined,
      originalPrice: undefined,
      inStock: undefined,
    });
  },

  /**
   * 按类别创建产品
   */
  createByCategory: (category: string, overrides: ProductFactoryOptions = {}): Product => {
    return createProduct.create({
      ...overrides,
      category,
    });
  },

  /**
   * 创建缺货产品
   */
  createOutOfStock: (overrides: ProductFactoryOptions = {}): Product => {
    return createProduct.create({
      ...overrides,
      stock: 0,
      inStock: false,
    });
  },

  /**
   * 创建低价产品
   */
  createLowPrice: (overrides: ProductFactoryOptions = {}): Product => {
    return createProduct.create({
      ...overrides,
      price: 9.99,
    });
  },

  /**
   * 创建高价产品
   */
  createHighPrice: (overrides: ProductFactoryOptions = {}): Product => {
    return createProduct.create({
      ...overrides,
      price: 999.99,
    });
  },
};
