import type { Product } from 'shared';
import type { StockOperationResult } from './types';

/**
 * 检查库存是否充足
 * @param product 商品
 * @param quantity 需要购买的数量
 * @returns 是否充足
 */
export function checkStock(product: Product, quantity: number): boolean {
  if (quantity <= 0) {
    return false;
  }

  // 优先使用 inStock 字段
  if (product.inStock !== undefined) {
    if (!product.inStock) {
      return false;
    }
  }

  // 检查库存数量
  const availableStock = product.stock ?? 0;
  return availableStock >= quantity;
}

/**
 * 扣减库存
 * @param product 商品
 * @param quantity 扣减数量
 * @returns 操作结果
 */
export function deductStock(product: Product, quantity: number): StockOperationResult {
  if (quantity <= 0) {
    return {
      success: false,
      error: '扣减数量必须大于0',
    };
  }

  // 检查库存是否充足
  if (!checkStock(product, quantity)) {
    return {
      success: false,
      error: '库存不足',
    };
  }

  const currentStock = product.stock ?? 0;
  const newStock = currentStock - quantity;

  // 更新商品库存
  product.stock = newStock;
  product.inStock = newStock > 0;

  return {
    success: true,
    stock: newStock,
  };
}

/**
 * 恢复库存
 * @param product 商品
 * @param quantity 恢复数量
 * @returns 操作结果
 */
export function restoreStock(product: Product, quantity: number): StockOperationResult {
  if (quantity <= 0) {
    return {
      success: false,
      error: '恢复数量必须大于0',
    };
  }

  const currentStock = product.stock ?? 0;
  const newStock = currentStock + quantity;

  // 更新商品库存
  product.stock = newStock;
  product.inStock = true;

  return {
    success: true,
    stock: newStock,
  };
}

/**
 * 判断商品是否有库存
 * @param product 商品
 * @returns 是否有库存
 */
export function isInStock(product: Product): boolean {
  // 优先使用 inStock 字段
  if (product.inStock !== undefined) {
    return product.inStock;
  }

  // 检查库存数量
  const stock = product.stock ?? 0;
  return stock > 0;
}