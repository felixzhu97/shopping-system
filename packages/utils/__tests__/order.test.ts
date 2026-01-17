import { describe, it, expect } from 'vitest';
import {
  generateOrderNumber,
  validateOrderStatus,
  getNextOrderStatus,
  canCancelOrder,
  getOrderStatusLabel,
  isOrderCompleted,
} from '../src/order';
import type { Order, OrderStatus } from 'shared';

describe('Order Utils', () => {
  describe('generateOrderNumber()', () => {
    it('should generate valid order number', () => {
      // Given & When
      const orderNumber = generateOrderNumber();

      // Then
      expect(orderNumber).toMatch(/^ORD-\d+-\d{4}$/);
    });

    it('should support custom prefix', () => {
      // Given
      const prefix = 'TEST';

      // When
      const orderNumber = generateOrderNumber(prefix);

      // Then
      expect(orderNumber).toMatch(/^TEST-\d+-\d{4}$/);
    });

    it('should generate unique order numbers', () => {
      // Given & When
      const orderNumber1 = generateOrderNumber();
      const orderNumber2 = generateOrderNumber();

      // Then
      expect(orderNumber1).not.toBe(orderNumber2);
    });
  });

  describe('validateOrderStatus()', () => {
    it('should validate valid order statuses', () => {
      // Given & When & Then
      expect(validateOrderStatus('pending')).toBe(true);
      expect(validateOrderStatus('processing')).toBe(true);
      expect(validateOrderStatus('shipped')).toBe(true);
      expect(validateOrderStatus('delivered')).toBe(true);
      expect(validateOrderStatus('cancelled')).toBe(true);
    });

    it('should reject invalid order statuses', () => {
      // Given & When & Then
      expect(validateOrderStatus('invalid')).toBe(false);
      expect(validateOrderStatus('')).toBe(false);
    });
  });

  describe('getNextOrderStatus()', () => {
    it('should return next order status', () => {
      // Given & When & Then
      expect(getNextOrderStatus('pending')).toBe('processing');
      expect(getNextOrderStatus('processing')).toBe('shipped');
      expect(getNextOrderStatus('shipped')).toBe('delivered');
    });

    it('should return null for final statuses', () => {
      // Given & When & Then
      expect(getNextOrderStatus('delivered')).toBe(null);
      expect(getNextOrderStatus('cancelled')).toBe(null);
    });
  });

  describe('canCancelOrder()', () => {
    it('should allow canceling pending orders', () => {
      // Given & When & Then
      expect(canCancelOrder('pending')).toBe(true);

      // Given
      const order: Order = {
        id: '1',
        userId: '1',
        items: [],
        totalAmount: 100,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // When & Then
      expect(canCancelOrder(order)).toBe(true);
    });

    it('should allow canceling processing orders', () => {
      // Given & When & Then
      expect(canCancelOrder('processing')).toBe(true);
    });

    it('should not allow canceling shipped orders', () => {
      // Given & When & Then
      expect(canCancelOrder('shipped')).toBe(false);
    });

    it('should not allow canceling delivered orders', () => {
      // Given & When & Then
      expect(canCancelOrder('delivered')).toBe(false);
    });

    it('should not allow canceling cancelled orders', () => {
      // Given & When & Then
      expect(canCancelOrder('cancelled')).toBe(false);
    });
  });

  describe('getOrderStatusLabel()', () => {
    it('should return correct Chinese labels', () => {
      // Given & When & Then
      expect(getOrderStatusLabel('pending')).toBe('待处理');
      expect(getOrderStatusLabel('processing')).toBe('处理中');
      expect(getOrderStatusLabel('shipped')).toBe('已发货');
      expect(getOrderStatusLabel('delivered')).toBe('已送达');
      expect(getOrderStatusLabel('cancelled')).toBe('已取消');
    });
  });

  describe('isOrderCompleted()', () => {
    it('should identify completed orders', () => {
      // Given & When & Then
      expect(isOrderCompleted('delivered')).toBe(true);
      expect(isOrderCompleted('cancelled')).toBe(true);
    });

    it('should identify incomplete orders', () => {
      // Given & When & Then
      expect(isOrderCompleted('pending')).toBe(false);
      expect(isOrderCompleted('processing')).toBe(false);
      expect(isOrderCompleted('shipped')).toBe(false);
    });

    it('should support order object', () => {
      // Given
      const completedOrder: Order = {
        id: '1',
        userId: '1',
        items: [],
        totalAmount: 100,
        status: 'delivered',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // When & Then
      expect(isOrderCompleted(completedOrder)).toBe(true);

      // Given
      const pendingOrder: Order = {
        ...completedOrder,
        status: 'pending',
      };

      // When & Then
      expect(isOrderCompleted(pendingOrder)).toBe(false);
    });
  });
});
