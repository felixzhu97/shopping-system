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
 * 支付网关基础接口
 * 所有支付网关实现都应遵循此接口
 */
export interface IPaymentGateway {
  /**
   * 获取网关名称
   */
  readonly name: string;

  /**
   * 创建支付
   * @param request 支付请求
   * @returns 支付响应
   */
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;

  /**
   * 验证支付回调
   * @param callbackData 回调数据
   * @returns 验证结果
   */
  verifyPayment(callbackData: PaymentCallback): Promise<PaymentVerification>;

  /**
   * 查询支付状态
   * @param paymentId 支付 ID
   * @param orderId 订单 ID（可选）
   * @returns 支付查询结果
   */
  queryPayment(paymentId: string, orderId?: string): Promise<PaymentQueryResult>;

  /**
   * 申请退款
   * @param request 退款请求
   * @returns 退款响应
   */
  refund(request: RefundRequest): Promise<RefundResponse>;

  /**
   * 查询退款状态
   * @param refundId 退款 ID
   * @returns 退款查询结果
   */
  queryRefund(refundId: string): Promise<RefundResponse>;
}

/**
 * 支付网关抽象基类
 * 提供通用的实现逻辑
 */
export abstract class BasePaymentGateway implements IPaymentGateway {
  abstract readonly name: string;
  protected config: GatewayConfig;

  constructor(config: GatewayConfig) {
    this.config = config;
  }

  abstract createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  abstract verifyPayment(callbackData: PaymentCallback): Promise<PaymentVerification>;
  abstract queryPayment(paymentId: string, orderId?: string): Promise<PaymentQueryResult>;
  abstract refund(request: RefundRequest): Promise<RefundResponse>;
  abstract queryRefund(refundId: string): Promise<RefundResponse>;

  /**
   * 验证配置
   */
  protected validateConfig(): void {
    if (!this.config.appId) {
      throw new Error(`[${this.name}] 配置错误: appId 不能为空`);
    }
  }

  /**
   * 生成支付 ID（如果网关没有返回）
   */
  protected generatePaymentId(orderId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${this.name}_${orderId}_${timestamp}_${random}`;
  }

  /**
   * 格式化金额（转换为分）
   */
  protected formatAmount(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * 解析金额（从分转换为元）
   */
  protected parseAmount(amount: number): number {
    return amount / 100;
  }
}
