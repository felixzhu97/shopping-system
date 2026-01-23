import { describe, it, expect } from 'vitest';
import {
  validatePaymentRequest,
  formatPaymentAmount,
  parsePaymentAmount,
  formatAmountDisplay,
  getPaymentStatusText,
  isFinalPaymentStatus,
  isSuccessPaymentStatus,
  parsePaymentCallback,
  generatePaymentOrderId,
  validateAmountRange,
} from '../utils';
import type { PaymentRequest, PaymentStatus } from '../types';

describe('PaymentUtils', () => {
  describe('validatePaymentRequest', () => {
    describe('when payment request is valid', () => {
      it('should return empty errors array', () => {
        // Given
        const request: PaymentRequest = {
          orderId: 'ORDER123',
          amount: 100.0,
          paymentMethod: 'alipay',
        };

        // When
        const errors = validatePaymentRequest(request);

        // Then
        expect(errors).toEqual([]);
      });

      it('should validate all payment methods', () => {
        // Given
        const methods = ['alipay', 'wechat', 'credit-card'] as const;

        // When & Then
        methods.forEach(method => {
          const request: PaymentRequest = {
            orderId: 'ORDER123',
            amount: 100.0,
            paymentMethod: method,
          };
          const errors = validatePaymentRequest(request);
          expect(errors).toEqual([]);
        });
      });
    });

    describe('when payment request is invalid', () => {
      it('should return error when orderId is missing', () => {
        // Given
        const request: PaymentRequest = {
          orderId: '',
          amount: 100.0,
          paymentMethod: 'alipay',
        };

        // When
        const errors = validatePaymentRequest(request);

        // Then
        expect(errors).toContain('订单 ID 不能为空');
      });

      it('should return error when amount is zero', () => {
        // Given
        const request: PaymentRequest = {
          orderId: 'ORDER123',
          amount: 0,
          paymentMethod: 'alipay',
        };

        // When
        const errors = validatePaymentRequest(request);

        // Then
        expect(errors).toContain('支付金额必须大于 0');
      });

      it('should return error when amount is negative', () => {
        // Given
        const request: PaymentRequest = {
          orderId: 'ORDER123',
          amount: -10,
          paymentMethod: 'alipay',
        };

        // When
        const errors = validatePaymentRequest(request);

        // Then
        expect(errors).toContain('支付金额必须大于 0');
      });

      it('should return error when paymentMethod is missing', () => {
        // Given
        const request = {
          orderId: 'ORDER123',
          amount: 100.0,
          // paymentMethod is intentionally omitted
        } as unknown as PaymentRequest;

        // When
        const errors = validatePaymentRequest(request);

        // Then
        expect(errors).toContain('支付方式不能为空');
      });

      it('should return error when paymentMethod is invalid', () => {
        // Given
        const request = {
          orderId: 'ORDER123',
          amount: 100.0,
          paymentMethod: 'invalid' as any,
        } as PaymentRequest;

        // When
        const errors = validatePaymentRequest(request);

        // Then
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.includes('支付方式无效'))).toBe(true);
      });
    });
  });

  describe('formatPaymentAmount', () => {
    it('should convert yuan to cents', () => {
      // Given
      const amount = 100.5;

      // When
      const result = formatPaymentAmount(amount);

      // Then
      expect(result).toBe(10050);
    });

    it('should handle integer amounts', () => {
      // Given
      const amount = 100;

      // When
      const result = formatPaymentAmount(amount);

      // Then
      expect(result).toBe(10000);
    });

    it('should round decimal amounts correctly', () => {
      // Given
      const amount = 99.999;

      // When
      const result = formatPaymentAmount(amount);

      // Then
      expect(result).toBe(10000);
    });
  });

  describe('parsePaymentAmount', () => {
    it('should convert cents to yuan', () => {
      // Given
      const amount = 10050;

      // When
      const result = parsePaymentAmount(amount);

      // Then
      expect(result).toBe(100.5);
    });

    it('should handle integer amounts', () => {
      // Given
      const amount = 10000;

      // When
      const result = parsePaymentAmount(amount);

      // Then
      expect(result).toBe(100);
    });
  });

  describe('formatAmountDisplay', () => {
    it('should format CNY amount with symbol', () => {
      // Given
      const amount = 100.5;
      const currency = 'CNY';

      // When
      const result = formatAmountDisplay(amount, currency);

      // Then
      expect(result).toBe('¥100.50');
    });

    it('should format USD amount with symbol', () => {
      // Given
      const amount = 100.5;
      const currency = 'USD';

      // When
      const result = formatAmountDisplay(amount, currency);

      // Then
      expect(result).toBe('$100.50');
    });

    it('should format JPY amount without decimals', () => {
      // Given
      const amount = 100.99;
      const currency = 'JPY';

      // When
      const result = formatAmountDisplay(amount, currency);

      // Then
      expect(result).toBe('¥101');
    });

    it('should default to CNY when currency is not provided', () => {
      // Given
      const amount = 100.5;

      // When
      const result = formatAmountDisplay(amount);

      // Then
      expect(result).toBe('¥100.50');
    });
  });

  describe('getPaymentStatusText', () => {
    it('should return correct text for each status', () => {
      // Given
      const statusMap: Record<PaymentStatus, string> = {
        pending: '待支付',
        processing: '处理中',
        success: '支付成功',
        failed: '支付失败',
        cancelled: '已取消',
        refunded: '已退款',
      };

      // When & Then
      Object.entries(statusMap).forEach(([status, expectedText]) => {
        const result = getPaymentStatusText(status as PaymentStatus);
        expect(result).toBe(expectedText);
      });
    });
  });

  describe('isFinalPaymentStatus', () => {
    it('should return true for final statuses', () => {
      // Given
      const finalStatuses: PaymentStatus[] = ['success', 'failed', 'cancelled', 'refunded'];

      // When & Then
      finalStatuses.forEach(status => {
        expect(isFinalPaymentStatus(status)).toBe(true);
      });
    });

    it('should return false for non-final statuses', () => {
      // Given
      const nonFinalStatuses: PaymentStatus[] = ['pending', 'processing'];

      // When & Then
      nonFinalStatuses.forEach(status => {
        expect(isFinalPaymentStatus(status)).toBe(false);
      });
    });
  });

  describe('isSuccessPaymentStatus', () => {
    it('should return true only for success status', () => {
      // Given
      const status = 'success';

      // When
      const result = isSuccessPaymentStatus(status);

      // Then
      expect(result).toBe(true);
    });

    it('should return false for non-success statuses', () => {
      // Given
      const nonSuccessStatuses: PaymentStatus[] = [
        'pending',
        'processing',
        'failed',
        'cancelled',
        'refunded',
      ];

      // When & Then
      nonSuccessStatuses.forEach(status => {
        expect(isSuccessPaymentStatus(status)).toBe(false);
      });
    });
  });

  describe('parsePaymentCallback', () => {
    it('should parse callback data correctly', () => {
      // Given
      const rawData = {
        payment_id: 'PAY123',
        order_id: 'ORDER123',
        status: 'success',
        amount: 10000,
        timestamp: '2024-01-01T00:00:00Z',
        signature: 'test-signature',
      };

      // When
      const result = parsePaymentCallback(rawData, 'test-gateway');

      // Then
      expect(result.paymentId).toBe('PAY123');
      expect(result.orderId).toBe('ORDER123');
      expect(result.status).toBe('success');
      expect(result.amount).toBe(10000);
      expect(result.signature).toBe('test-signature');
      expect(result.rawData).toBe(rawData);
    });

    it('should map gateway-specific status to standard status', () => {
      // Given
      const alipayData = {
        trade_status: 'TRADE_SUCCESS',
        out_trade_no: 'ORDER123',
        trade_no: 'PAY123',
        total_amount: 100,
      };

      // When
      const result = parsePaymentCallback(alipayData, 'alipay');

      // Then
      expect(result.status).toBe('success');
    });
  });

  describe('generatePaymentOrderId', () => {
    it('should generate order ID with prefix', () => {
      // Given
      const prefix = 'TEST';

      // When
      const result = generatePaymentOrderId(prefix);

      // Then
      expect(result).toMatch(/^TEST\d+[A-Z0-9]+$/);
    });

    it('should generate unique order IDs', () => {
      // Given & When
      const id1 = generatePaymentOrderId();
      const id2 = generatePaymentOrderId();

      // Then
      expect(id1).not.toBe(id2);
    });

    it('should use default prefix when not provided', () => {
      // When
      const result = generatePaymentOrderId();

      // Then
      expect(result).toMatch(/^PAY\d+[A-Z0-9]+$/);
    });
  });

  describe('validateAmountRange', () => {
    it('should return true for valid amounts within range', () => {
      // Given
      const amount = 100;
      const min = 0.01;
      const max = 1000;

      // When
      const result = validateAmountRange(amount, min, max);

      // Then
      expect(result).toBe(true);
    });

    it('should return false for amounts below minimum', () => {
      // Given
      const amount = 0.001;
      const min = 0.01;
      const max = 1000;

      // When
      const result = validateAmountRange(amount, min, max);

      // Then
      expect(result).toBe(false);
    });

    it('should return false for amounts above maximum', () => {
      // Given
      const amount = 2000;
      const min = 0.01;
      const max = 1000;

      // When
      const result = validateAmountRange(amount, min, max);

      // Then
      expect(result).toBe(false);
    });

    it('should use default range when not provided', () => {
      // Given
      const amount = 100;

      // When
      const result = validateAmountRange(amount);

      // Then
      expect(result).toBe(true);
    });
  });
});
