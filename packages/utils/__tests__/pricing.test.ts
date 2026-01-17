import { describe, it, expect } from 'vitest';
import {
  calculateDiscount,
  calculateTax,
  calculateShipping,
  applyCoupon,
  calculateTotal,
} from '../src/pricing';
import type { CartItem, Product } from 'shared';
import type { Coupon } from '../src/types';

describe('Pricing Utils', () => {
  describe('calculateDiscount()', () => {
    it('should calculate discount amount and percentage correctly', () => {
      // Given
      const originalPrice = 100;
      const discountPrice = 80;

      // When
      const result = calculateDiscount(originalPrice, discountPrice);

      // Then
      expect(result.amount).toBe(20);
      expect(result.percentage).toBe(20);
    });

    it('should return zero when original price is zero', () => {
      // Given
      const originalPrice = 0;
      const discountPrice = 80;

      // When
      const result = calculateDiscount(originalPrice, discountPrice);

      // Then
      expect(result.amount).toBe(0);
      expect(result.percentage).toBe(0);
    });

    it('should return zero when discount price is greater than or equal to original price', () => {
      // Given
      const originalPrice = 100;
      const discountPrice = 100;

      // When
      const result = calculateDiscount(originalPrice, discountPrice);

      // Then
      expect(result.amount).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });

  describe('calculateTax()', () => {
    it('should calculate tax correctly', () => {
      // Given & When & Then
      expect(calculateTax(100, 0.13)).toBe(13);
      expect(calculateTax(100, 0.06)).toBe(6);
    });

    it('should return zero when amount is zero', () => {
      // Given & When & Then
      expect(calculateTax(0, 0.13)).toBe(0);
    });

    it('should use default tax rate when not provided', () => {
      // Given & When & Then
      expect(calculateTax(100)).toBe(13);
    });
  });

  describe('calculateShipping()', () => {
    it('should charge shipping when subtotal is below threshold', () => {
      // Given & When & Then
      expect(calculateShipping(100, 200, 15)).toBe(15);
    });

    it('should provide free shipping when subtotal reaches threshold', () => {
      // Given & When & Then
      expect(calculateShipping(200, 200, 15)).toBe(0);
      expect(calculateShipping(250, 200, 15)).toBe(0);
    });

    it('should return zero when amount is zero', () => {
      // Given & When & Then
      expect(calculateShipping(0, 200, 15)).toBe(0);
    });
  });

  describe('applyCoupon()', () => {
    it('should apply percentage coupon correctly', () => {
      // Given
      const coupon: Coupon = {
        code: 'SAVE10',
        type: 'percentage',
        value: 10,
      };

      // When
      const result = applyCoupon(100, coupon);

      // Then
      expect(result).toBe(10);
    });

    it('should apply fixed amount coupon correctly', () => {
      // Given
      const coupon: Coupon = {
        code: 'SAVE20',
        type: 'fixed',
        value: 20,
      };

      // When
      const result = applyCoupon(100, coupon);

      // Then
      expect(result).toBe(20);
    });

    it('should check minimum order amount', () => {
      // Given
      const coupon: Coupon = {
        code: 'SAVE10',
        type: 'percentage',
        value: 10,
        minAmount: 200,
      };

      // When & Then
      expect(applyCoupon(100, coupon)).toBe(0);
      expect(applyCoupon(200, coupon)).toBe(20);
    });

    it('should apply maximum discount limit', () => {
      // Given
      const coupon: Coupon = {
        code: 'SAVE50',
        type: 'percentage',
        value: 50,
        maxDiscount: 30,
      };

      // When
      const result = applyCoupon(100, coupon);

      // Then
      expect(result).toBe(30);
    });

    it('should ensure fixed discount does not exceed order amount', () => {
      // Given
      const coupon: Coupon = {
        code: 'SAVE200',
        type: 'fixed',
        value: 200,
      };

      // When
      const result = applyCoupon(100, coupon);

      // Then
      expect(result).toBe(100);
    });
  });

  describe('calculateTotal()', () => {
    const mockProduct: Product = {
      id: '1',
      name: 'Test Product',
      description: 'Test',
      price: 100,
      image: 'test.jpg',
      category: 'test',
      stock: 10,
    };

    const mockItems: CartItem[] = [
      {
        productId: '1',
        quantity: 2,
        product: mockProduct,
      },
    ];

    it('should calculate order total correctly', () => {
      // Given
      const items = mockItems;

      // When
      const result = calculateTotal(items);

      // Then
      expect(result.subtotal).toBe(200);
      expect(result.discount).toBe(0);
      expect(result.tax).toBe(26);
      expect(result.shipping).toBe(0); // 200 >= 200, free shipping
      expect(result.total).toBe(226);
    });

    it('should apply coupon correctly', () => {
      // Given
      const items = mockItems;
      const coupon: Coupon = {
        code: 'SAVE10',
        type: 'percentage',
        value: 10,
      };

      // When
      const result = calculateTotal(items, { coupon });

      // Then
      expect(result.subtotal).toBe(200);
      expect(result.discount).toBe(20);
      expect(result.tax).toBe(23.4); // (200 - 20) * 0.13
      // After discount: 180, which is below 200 threshold, so shipping is 15
      expect(result.shipping).toBe(15);
      expect(result.total).toBe(218.4); // 180 + 23.4 + 15
    });

    it('should handle shipping for small orders correctly', () => {
      // Given
      const smallItem: CartItem[] = [
        {
          productId: '1',
          quantity: 1,
          product: { ...mockProduct, price: 50 },
        },
      ];

      // When
      const result = calculateTotal(smallItem);

      // Then
      expect(result.subtotal).toBe(50);
      expect(result.shipping).toBe(15);
      expect(result.tax).toBe(6.5);
      expect(result.total).toBe(71.5);
    });
  });
});