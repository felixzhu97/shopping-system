import { describe, it, expect, beforeEach } from 'vitest';
import { BasePaymentGateway } from '../../gateways/base';
import type { GatewayConfig, PaymentRequest, PaymentStatus } from '../../types';

// 创建一个测试用的网关实现
class TestGateway extends BasePaymentGateway {
  readonly name = 'test-gateway';

  constructor(config: GatewayConfig) {
    super(config);
    this.validateConfig();
  }

  async createPayment(request: PaymentRequest) {
    return {
      paymentId: this.generatePaymentId(request.orderId),
      orderId: request.orderId,
      status: 'pending' as PaymentStatus,
      amount: request.amount,
      currency: request.currency || 'CNY',
    };
  }

  async verifyPayment(callbackData: any) {
    return {
      isValid: true,
      paymentId: callbackData.paymentId,
      orderId: callbackData.orderId,
      status: callbackData.status,
      amount: callbackData.amount,
      verifiedAt: new Date(),
    };
  }

  async queryPayment(paymentId: string, orderId?: string) {
    return {
      paymentId,
      orderId: orderId || '',
      status: 'pending' as PaymentStatus,
      amount: 0,
    };
  }

  async refund(request: any) {
    return {
      refundId: 'refund-123',
      paymentId: request.paymentId,
      orderId: request.orderId,
      amount: request.amount || 0,
      status: 'processing' as PaymentStatus,
    };
  }

  async queryRefund(refundId: string) {
    return {
      refundId,
      paymentId: '',
      orderId: '',
      amount: 0,
      status: 'processing' as PaymentStatus,
    };
  }
}

describe('BasePaymentGateway', () => {
  let gateway: TestGateway;
  let config: GatewayConfig;

  beforeEach(() => {
    // Given
    config = {
      appId: 'test-app-id',
      appKey: 'test-app-key',
    };
    gateway = new TestGateway(config);
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      // Then
      expect(gateway.name).toBe('test-gateway');
      expect((gateway as any).config).toEqual(config);
    });
  });

  describe('validateConfig', () => {
    it('should throw error when appId is missing', () => {
      // Given
      const invalidConfig: GatewayConfig = {
        appId: '',
      };

      // When & Then
      expect(() => new TestGateway(invalidConfig)).toThrow(/appId 不能为空/);
    });
  });

  describe('generatePaymentId', () => {
    it('should generate payment ID with gateway name and order ID', () => {
      // Given
      const orderId = 'ORDER123';

      // When
      const paymentId = (gateway as any).generatePaymentId(orderId);

      // Then
      expect(paymentId).toContain('test-gateway');
      expect(paymentId).toContain(orderId);
      expect(paymentId).toMatch(/test-gateway_ORDER123_\d+_[a-z0-9]+/);
    });

    it('should generate unique payment IDs', () => {
      // Given
      const orderId = 'ORDER123';

      // When
      const id1 = (gateway as any).generatePaymentId(orderId);
      const id2 = (gateway as any).generatePaymentId(orderId);

      // Then
      expect(id1).not.toBe(id2);
    });
  });

  describe('formatAmount', () => {
    it('should convert yuan to cents', () => {
      // Given
      const amount = 100.5;

      // When
      const result = (gateway as any).formatAmount(amount);

      // Then
      expect(result).toBe(10050);
    });
  });

  describe('parseAmount', () => {
    it('should convert cents to yuan', () => {
      // Given
      const amount = 10050;

      // When
      const result = (gateway as any).parseAmount(amount);

      // Then
      expect(result).toBe(100.5);
    });
  });

  describe('createPayment', () => {
    it('should create payment with generated payment ID', async () => {
      // Given
      const request: PaymentRequest = {
        orderId: 'ORDER123',
        amount: 100.0,
        paymentMethod: 'alipay',
      };

      // When
      const result = await gateway.createPayment(request);

      // Then
      expect(result.paymentId).toBeDefined();
      expect(result.orderId).toBe('ORDER123');
      expect(result.amount).toBe(100.0);
      expect(result.status).toBe('pending');
    });
  });
});
