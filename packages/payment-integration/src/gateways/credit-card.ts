import { BasePaymentGateway } from './base';
import type {
  PaymentRequest,
  PaymentResponse,
  PaymentVerification,
  RefundRequest,
  RefundResponse,
  PaymentQueryResult,
  GatewayConfig,
  PaymentCallback,
} from '../types';

/**
 * 信用卡支付网关（基于 Stripe）
 *
 * 注意：这是基础实现框架，实际使用时需要集成 Stripe SDK
 * 参考：https://stripe.com/docs/api
 */
export class CreditCardGateway extends BasePaymentGateway {
  readonly name = 'credit-card';

  constructor(config: GatewayConfig) {
    super(config);
    this.validateConfig();
  }

  /**
   * 创建信用卡支付
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // TODO: 集成 Stripe SDK
      // const Stripe = require('stripe');
      // const stripe = new Stripe(this.config.secretKey, {
      //   apiVersion: '2023-10-16',
      // });

      // 生成支付参数
      const paymentId = this.generatePaymentId(request.orderId);
      const amount = this.formatAmount(request.amount);

      // TODO: 创建 Stripe Payment Intent
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: amount,
      //   currency: request.currency?.toLowerCase() || 'usd',
      //   description: request.description || 'Order payment',
      //   metadata: {
      //     order_id: request.orderId,
      //     user_id: request.userId || '',
      //   },
      //   payment_method_types: ['card'],
      // });

      // 临时实现（占位符）
      return {
        paymentId,
        orderId: request.orderId,
        status: 'pending',
        amount: request.amount,
        currency: request.currency || 'USD',
        gatewayResponse: {
          gateway: 'stripe',
          client_secret: `pi_${paymentId}_secret`, // Stripe 返回的客户端密钥
        },
      };
    } catch (error) {
      throw new Error(
        `[CreditCard] 创建支付失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 验证信用卡支付回调（Webhook）
   */
  async verifyPayment(callbackData: PaymentCallback): Promise<PaymentVerification> {
    try {
      // TODO: 验证 Stripe Webhook 签名
      // const stripe = new Stripe(this.config.secretKey);
      // const event = stripe.webhooks.constructEvent(
      //   callbackData.rawData.body,
      //   callbackData.rawData.signature,
      //   this.config.webhookSecret
      // );

      // 临时实现（占位符）
      const isValid = !!callbackData.signature;

      return {
        isValid,
        paymentId: callbackData.paymentId,
        orderId: callbackData.orderId,
        status: callbackData.status,
        amount: callbackData.amount,
        verifiedAt: new Date(),
        errorMessage: isValid ? undefined : '签名验证失败',
      };
    } catch (error) {
      return {
        isValid: false,
        paymentId: callbackData.paymentId,
        orderId: callbackData.orderId,
        status: 'failed',
        amount: callbackData.amount,
        verifiedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : '验证失败',
      };
    }
  }

  /**
   * 查询信用卡支付状态
   */
  async queryPayment(paymentId: string, orderId?: string): Promise<PaymentQueryResult> {
    try {
      // TODO: 查询 Stripe Payment Intent
      // const stripe = new Stripe(this.config.secretKey);
      // const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

      // 临时实现（占位符）
      return {
        paymentId,
        orderId: orderId || '',
        status: 'pending',
        amount: 0,
        gatewayResponse: {
          gateway: 'stripe',
        },
      };
    } catch (error) {
      throw new Error(
        `[CreditCard] 查询支付失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 申请信用卡退款
   */
  async refund(request: RefundRequest): Promise<RefundResponse> {
    try {
      // TODO: 创建 Stripe Refund
      // const stripe = new Stripe(this.config.secretKey);
      // const refund = await stripe.refunds.create({
      //   payment_intent: request.paymentId,
      //   amount: request.amount,
      //   reason: request.reason ? 'requested_by_customer' : undefined,
      //   metadata: {
      //     order_id: request.orderId,
      //     reason: request.reason || '',
      //   },
      // });

      const refundId = `stripe_refund_${Date.now()}`;

      // 临时实现（占位符）
      return {
        refundId,
        paymentId: request.paymentId,
        orderId: request.orderId,
        amount: request.amount || 0,
        status: 'processing',
        gatewayResponse: {
          gateway: 'stripe',
        },
      };
    } catch (error) {
      throw new Error(
        `[CreditCard] 申请退款失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 查询信用卡退款状态
   */
  async queryRefund(refundId: string): Promise<RefundResponse> {
    try {
      // TODO: 查询 Stripe Refund
      // const stripe = new Stripe(this.config.secretKey);
      // const refund = await stripe.refunds.retrieve(refundId);

      // 临时实现（占位符）
      return {
        refundId,
        paymentId: '',
        orderId: '',
        amount: 0,
        status: 'processing',
        gatewayResponse: {
          gateway: 'stripe',
        },
      };
    } catch (error) {
      throw new Error(
        `[CreditCard] 查询退款失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }
}
