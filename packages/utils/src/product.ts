import type { Product } from 'shared';
import type { ProductImageOptions } from './types';

/**
 * 计算折扣百分比
 * @param originalPrice 原价
 * @param currentPrice 现价
 * @returns 折扣百分比，如果没有折扣则返回 null
 */
export function calculateDiscountPercentage(
  originalPrice: number | undefined,
  currentPrice: number
): number | null {
  if (!originalPrice || originalPrice <= 0) {
    return null;
  }

  if (currentPrice >= originalPrice) {
    return null;
  }

  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return Math.round(discount);
}

/**
 * 获取产品所有图片
 * @param product 产品
 * @param options 选项
 * @returns 图片URL数组
 */
export function getProductImages(
  product: Product,
  options: ProductImageOptions = {}
): string[] {
  const { defaultImage, includeMainImage = true } = options;
  const images: string[] = [];

  // 添加主图片
  if (includeMainImage && product.image) {
    images.push(product.image);
  }

  // 添加其他图片（如果产品有 images 属性）
  // 注意：当前 Product 类型中没有 images 字段，但为了扩展性保留此逻辑
  if ('images' in product && Array.isArray((product as any).images)) {
    const additionalImages = (product as any).images.filter(
      (img: string) => img && img !== product.image
    );
    images.push(...additionalImages);
  }

  // 如果没有图片且提供了默认图片，使用默认图片
  if (images.length === 0 && defaultImage) {
    images.push(defaultImage);
  }

  return images;
}

/**
 * 判断产品是否在促销
 * @param product 产品
 * @returns 是否在促销
 */
export function isProductOnSale(product: Product): boolean {
  if (!product.originalPrice || product.originalPrice <= 0) {
    return false;
  }

  return product.price < product.originalPrice;
}

/**
 * 获取产品的折扣信息
 * @param product 产品
 * @returns 折扣信息对象，如果没有折扣则返回 null
 */
export function getProductDiscount(product: Product): {
  percentage: number;
  amount: number;
} | null {
  if (!isProductOnSale(product)) {
    return null;
  }

  const percentage = calculateDiscountPercentage(product.originalPrice, product.price);
  const amount = (product.originalPrice || 0) - product.price;

  if (percentage === null) {
    return null;
  }

  return {
    percentage,
    amount: Math.round(amount * 100) / 100,
  };
}

/**
 * 获取产品的主图片
 * @param product 产品
 * @param defaultImage 默认图片URL
 * @returns 图片URL
 */
export function getProductMainImage(product: Product, defaultImage?: string): string {
  if (product.image) {
    return product.image;
  }

  return defaultImage || '';
}

/**
 * 检查产品是否有评分
 * @param product 产品
 * @returns 是否有评分
 */
export function hasProductRating(product: Product): boolean {
  return product.rating !== undefined && product.rating !== null && product.rating > 0;
}

/**
 * 获取产品的平均评分（四舍五入到一位小数）
 * @param product 产品
 * @returns 平均评分，如果没有评分则返回 null
 */
export function getProductAverageRating(product: Product): number | null {
  if (!hasProductRating(product) || product.rating === undefined) {
    return null;
  }

  return Math.round(product.rating * 10) / 10;
}