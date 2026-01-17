import type { CartItem } from 'shared';
import type { Coupon, PricingOptions, PricingResult } from './types';

/**
 * 计算折扣金额和百分比
 * @param originalPrice 原价
 * @param discountPrice 折扣价
 * @returns 折扣金额和百分比
 */
export function calculateDiscount(
  originalPrice: number,
  discountPrice: number
): { amount: number; percentage: number } {
  if (originalPrice <= 0) {
    return { amount: 0, percentage: 0 };
  }

  if (discountPrice >= originalPrice) {
    return { amount: 0, percentage: 0 };
  }

  const amount = originalPrice - discountPrice;
  const percentage = Math.round((amount / originalPrice) * 100);

  return { amount, percentage };
}

/**
 * 计算税费
 * @param subtotal 小计金额
 * @param taxRate 税率（0-1之间的小数，例如 0.13 表示 13%）
 * @returns 税费金额
 */
export function calculateTax(subtotal: number, taxRate: number = 0.13): number {
  if (subtotal <= 0 || taxRate < 0) {
    return 0;
  }

  return Math.round(subtotal * taxRate * 100) / 100;
}

/**
 * 计算运费
 * @param subtotal 小计金额
 * @param freeShippingThreshold 免运费阈值（默认 200）
 * @param shippingRate 运费金额（默认 15）
 * @returns 运费金额
 */
export function calculateShipping(
  subtotal: number,
  freeShippingThreshold: number = 200,
  shippingRate: number = 15
): number {
  if (subtotal <= 0) {
    return 0;
  }

  if (subtotal >= freeShippingThreshold) {
    return 0;
  }

  return shippingRate;
}

/**
 * 应用优惠券
 * @param subtotal 小计金额
 * @param coupon 优惠券
 * @returns 折扣金额
 */
export function applyCoupon(subtotal: number, coupon: Coupon): number {
  if (subtotal <= 0) {
    return 0;
  }

  // 检查最小订单金额
  if (coupon.minAmount && subtotal < coupon.minAmount) {
    return 0;
  }

  let discount = 0;

  if (coupon.type === 'percentage') {
    // 百分比折扣
    discount = (subtotal * coupon.value) / 100;
    // 应用最大折扣限制
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.type === 'fixed') {
    // 固定金额折扣
    discount = coupon.value;
    // 折扣不能超过订单金额
    if (discount > subtotal) {
      discount = subtotal;
    }
  }

  return Math.round(discount * 100) / 100;
}

/**
 * 计算订单总价
 * @param items 购物车商品列表
 * @param options 价格计算选项
 * @returns 价格计算结果
 */
export function calculateTotal(
  items: CartItem[],
  options: PricingOptions = {}
): PricingResult {
  const {
    taxRate = 0.13,
    freeShippingThreshold = 200,
    shippingRate = 15,
    coupon,
  } = options;

  // 计算小计
  const subtotal = items.reduce((total, item) => {
    const price = item.product?.price || item.price || 0;
    return total + price * item.quantity;
  }, 0);

  // 应用优惠券
  const discount = coupon ? applyCoupon(subtotal, coupon) : 0;

  // 计算税费（基于折扣后的金额）
  const taxableAmount = subtotal - discount;
  const tax = calculateTax(taxableAmount, taxRate);

  // 计算运费（基于折扣后的金额）
  const shipping = calculateShipping(taxableAmount, freeShippingThreshold, shippingRate);

  // 计算总计
  const total = taxableAmount + tax + shipping;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}