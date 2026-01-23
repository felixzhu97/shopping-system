import type { Product, CartItem, OrderStatus, PaymentMethod } from 'types';

/**
 * 价格计算选项
 */
export interface PricingOptions {
  /** 税率（0-1之间的小数，例如 0.13 表示 13%） */
  taxRate?: number;
  /** 免运费阈值 */
  freeShippingThreshold?: number;
  /** 运费金额 */
  shippingRate?: number;
  /** 优惠券 */
  coupon?: Coupon;
}

/**
 * 优惠券类型
 */
export interface Coupon {
  /** 优惠券代码 */
  code: string;
  /** 折扣类型：'percentage' 百分比折扣，'fixed' 固定金额折扣 */
  type: 'percentage' | 'fixed';
  /** 折扣值：百分比（0-100）或固定金额 */
  value: number;
  /** 最小订单金额（可选） */
  minAmount?: number;
  /** 最大折扣金额（可选，仅用于百分比折扣） */
  maxDiscount?: number;
}

/**
 * 价格计算结果
 */
export interface PricingResult {
  /** 小计（商品总价） */
  subtotal: number;
  /** 折扣金额 */
  discount: number;
  /** 税费 */
  tax: number;
  /** 运费 */
  shipping: number;
  /** 总计 */
  total: number;
}

/**
 * 验证选项
 */
export interface ValidationOptions {
  /** 最小长度 */
  minLength?: number;
  /** 最大长度 */
  maxLength?: number;
  /** 自定义正则表达式 */
  pattern?: RegExp;
  /** 是否必填 */
  required?: boolean;
}

/**
 * 密码验证选项
 */
export interface PasswordValidationOptions extends ValidationOptions {
  /** 是否需要大写字母 */
  requireUppercase?: boolean;
  /** 是否需要小写字母 */
  requireLowercase?: boolean;
  /** 是否需要数字 */
  requireNumber?: boolean;
  /** 是否需要特殊字符 */
  requireSpecialChar?: boolean;
}

/**
 * 格式化选项
 */
export interface FormatOptions {
  /** 小数位数 */
  decimals?: number;
  /** 是否使用千分位分隔符 */
  useGrouping?: boolean;
  /** 最小值 */
  minimumFractionDigits?: number;
  /** 最大值 */
  maximumFractionDigits?: number;
}

/**
 * 地址验证结果
 */
export interface AddressValidationResult {
  /** 是否有效 */
  isValid: boolean;
  /** 错误消息 */
  errors?: string[];
}

/**
 * 库存操作结果
 */
export interface StockOperationResult {
  /** 是否成功 */
  success: boolean;
  /** 操作后的库存数量 */
  stock?: number;
  /** 错误消息 */
  error?: string;
}

/**
 * 产品工具函数参数
 */
export interface ProductImageOptions {
  /** 默认图片URL（当产品没有图片时使用） */
  defaultImage?: string;
  /** 是否包含主图片 */
  includeMainImage?: boolean;
}

// 重新导出 shared 包中的类型，方便使用
export type { Product, CartItem, OrderStatus, PaymentMethod };