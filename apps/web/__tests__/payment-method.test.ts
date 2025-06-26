import { describe, it, expect } from 'vitest';
import { paymentMethods } from '../components/payment-method';

describe('Payment Methods', () => {
  it('should export payment methods object', () => {
    expect(paymentMethods).toBeDefined();
    expect(typeof paymentMethods).toBe('object');
  });

  it('should contain payment method keys', () => {
    const keys = Object.keys(paymentMethods);
    expect(keys.length).toBeGreaterThan(0);

    expect(paymentMethods).toHaveProperty('alipay');
    expect(paymentMethods).toHaveProperty('wechat');
    expect(paymentMethods).toHaveProperty('credit-card');
  });

  it('should have correct payment method values', () => {
    expect(paymentMethods.alipay).toBe('支付宝');
    expect(paymentMethods.wechat).toBe('微信');
    expect(paymentMethods['credit-card']).toBe('信用卡');
  });

  it('should have string values for all payment methods', () => {
    Object.values(paymentMethods).forEach(value => {
      expect(typeof value).toBe('string');
      expect(value.trim().length).toBeGreaterThan(0);
    });
  });

  it('should maintain consistent data structure', () => {
    const keys = Object.keys(paymentMethods);
    const values = Object.values(paymentMethods);

    expect(keys.length).toBe(values.length);
    expect(keys.length).toBe(3);
  });
});
