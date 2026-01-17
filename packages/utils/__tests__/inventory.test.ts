import { describe, it, expect } from 'vitest';
import { checkStock, deductStock, restoreStock, isInStock } from '../src/inventory';
import type { Product } from 'shared';

describe('Inventory Utils', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test',
    price: 100,
    image: 'test.jpg',
    category: 'test',
    stock: 10,
    inStock: true,
  };

  describe('checkStock()', () => {
    it('should check if stock is sufficient', () => {
      // Given & When & Then
      expect(checkStock(mockProduct, 5)).toBe(true);
      expect(checkStock(mockProduct, 10)).toBe(true);
      expect(checkStock(mockProduct, 11)).toBe(false);
    });

    it('should reject zero or negative quantity', () => {
      // Given & When & Then
      expect(checkStock(mockProduct, 0)).toBe(false);
      expect(checkStock(mockProduct, -1)).toBe(false);
    });

    it('should prioritize inStock field', () => {
      // Given
      const outOfStockProduct = { ...mockProduct, inStock: false };

      // When & Then
      expect(checkStock(outOfStockProduct, 1)).toBe(false);
    });

    it('should handle product without stock field', () => {
      // Given
      const productWithoutStock = { ...mockProduct, stock: undefined };

      // When & Then
      expect(checkStock(productWithoutStock, 1)).toBe(false);
    });
  });

  describe('deductStock()', () => {
    it('should successfully deduct stock', () => {
      // Given
      const product = { ...mockProduct };

      // When
      const result = deductStock(product, 5);

      // Then
      expect(result.success).toBe(true);
      expect(result.stock).toBe(5);
      expect(product.stock).toBe(5);
      expect(product.inStock).toBe(true);
    });

    it('should reject zero or negative quantity', () => {
      // Given
      const product = { ...mockProduct };

      // When
      const result = deductStock(product, 0);

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toBe('扣减数量必须大于0');
    });

    it('should reject when stock is insufficient', () => {
      // Given
      const product = { ...mockProduct };

      // When
      const result = deductStock(product, 11);

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toBe('库存不足');
    });

    it('should update inStock status', () => {
      // Given
      const product = { ...mockProduct, stock: 1 };

      // When
      const result = deductStock(product, 1);

      // Then
      expect(result.success).toBe(true);
      expect(product.inStock).toBe(false);
    });
  });

  describe('restoreStock()', () => {
    it('should successfully restore stock', () => {
      // Given
      const product = { ...mockProduct, stock: 5 };

      // When
      const result = restoreStock(product, 3);

      // Then
      expect(result.success).toBe(true);
      expect(result.stock).toBe(8);
      expect(product.stock).toBe(8);
      expect(product.inStock).toBe(true);
    });

    it('should reject zero or negative quantity', () => {
      // Given
      const product = { ...mockProduct };

      // When
      const result = restoreStock(product, 0);

      // Then
      expect(result.success).toBe(false);
      expect(result.error).toBe('恢复数量必须大于0');
    });

    it('should update inStock status to true', () => {
      // Given
      const product = { ...mockProduct, stock: 0, inStock: false };

      // When
      const result = restoreStock(product, 5);

      // Then
      expect(result.success).toBe(true);
      expect(product.inStock).toBe(true);
    });
  });

  describe('isInStock()', () => {
    it('should prioritize inStock field', () => {
      // Given & When & Then
      expect(isInStock({ ...mockProduct, inStock: true })).toBe(true);
      expect(isInStock({ ...mockProduct, inStock: false })).toBe(false);
    });

    it('should check stock field', () => {
      // Given & When & Then
      expect(isInStock({ ...mockProduct, inStock: undefined, stock: 10 })).toBe(true);
      expect(isInStock({ ...mockProduct, inStock: undefined, stock: 0 })).toBe(false);
    });

    it('should handle product without stock field', () => {
      // Given & When & Then
      expect(isInStock({ ...mockProduct, inStock: undefined, stock: undefined })).toBe(false);
    });
  });
});
