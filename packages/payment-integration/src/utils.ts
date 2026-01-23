import type { PaymentRequest, PaymentStatus, PaymentCallback } from './types';

/**
 * 验证支付请求
 * @param request 支付请求
 * @returns 验证错误信息数组，空数组表示验证通过
 */
export function validatePaymentRequest(request: PaymentRequest): string[] {
  const errors: string[] = [];

  if (!request.orderId) {
    errors.push('订单 ID 不能为空');
  }

  if (!request.amount || request.amount <= 0) {
    errors.push('支付金额必须大于 0');
  }

  if (!request.paymentMethod) {
    errors.push('支付方式不能为空');
  }

  const validPaymentMethods = ['alipay', 'wechat', 'credit-card'];
  if (!validPaymentMethods.includes(request.paymentMethod)) {
    errors.push(`支付方式无效，支持的支付方式: ${validPaymentMethods.join(', ')}`);
  }

  return errors;
}

/**
 * 格式化支付金额（转换为分）
 * @param amount 金额（元）
 * @returns 金额（分）
 */
export function formatPaymentAmount(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * 解析支付金额（从分转换为元）
 * @param amount 金额（分）
 * @returns 金额（元）
 */
export function parsePaymentAmount(amount: number): number {
  return amount / 100;
}

/**
 * 格式化金额显示（添加货币符号）
 * @param amount 金额
 * @param currency 货币类型
 * @returns 格式化后的金额字符串
 */
export function formatAmountDisplay(amount: number, currency: string = 'CNY'): string {
  const currencySymbols: Record<string, string> = {
    CNY: '¥',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  };

  const symbol = currencySymbols[currency] || currency;
  const formattedAmount = amount.toFixed(2);

  if (currency === 'JPY') {
    // 日元不显示小数
    return `${symbol}${Math.round(amount)}`;
  }

  return `${symbol}${formattedAmount}`;
}

/**
 * 获取支付状态的中文描述
 * @param status 支付状态
 * @returns 状态描述
 */
export function getPaymentStatusText(status: PaymentStatus): string {
  const statusMap: Record<PaymentStatus, string> = {
    pending: '待支付',
    processing: '处理中',
    success: '支付成功',
    failed: '支付失败',
    cancelled: '已取消',
    refunded: '已退款',
  };

  return statusMap[status] || '未知状态';
}

/**
 * 判断支付状态是否为最终状态
 * @param status 支付状态
 * @returns 是否为最终状态
 */
export function isFinalPaymentStatus(status: PaymentStatus): boolean {
  return ['success', 'failed', 'cancelled', 'refunded'].includes(status);
}

/**
 * 判断支付状态是否为成功状态
 * @param status 支付状态
 * @returns 是否为成功状态
 */
export function isSuccessPaymentStatus(status: PaymentStatus): boolean {
  return status === 'success';
}

/**
 * 解析支付回调数据（从原始数据中提取标准格式）
 * @param rawData 原始回调数据
 * @param gateway 支付网关名称
 * @returns 标准化的支付回调数据
 */
export function parsePaymentCallback(
  rawData: Record<string, any>,
  gateway: string
): PaymentCallback {
  // 不同网关的回调数据格式不同，这里提供通用的解析逻辑
  // 实际使用时需要根据具体网关的文档进行解析

  const commonFields = {
    paymentId: rawData.payment_id || rawData.transaction_id || rawData.trade_no || rawData.id || '',
    orderId: rawData.order_id || rawData.out_trade_no || rawData.orderId || '',
    status: mapGatewayStatusToStandardStatus(
      rawData.status || rawData.trade_status || rawData.payment_status,
      gateway
    ) as PaymentStatus,
    amount: rawData.amount || rawData.total_amount || rawData.amount_total || 0,
    timestamp: rawData.timestamp || rawData.create_time || rawData.created || new Date().toISOString(),
    signature: rawData.signature || rawData.sign || rawData.sig,
    rawData,
  };

  return commonFields;
}

/**
 * 将网关特定的状态映射为标准支付状态
 * @param gatewayStatus 网关状态
 * @param gateway 网关名称
 * @returns 标准支付状态
 */
function mapGatewayStatusToStandardStatus(
  gatewayStatus: string | undefined,
  gateway: string
): PaymentStatus {
  if (!gatewayStatus) {
    return 'pending';
  }

  const statusStr = gatewayStatus.toLowerCase();

  // 支付宝状态映射
  if (gateway === 'alipay') {
    const alipayStatusMap: Record<string, PaymentStatus> = {
      'wait_buyer_pay': 'pending',
      'trade_closed': 'cancelled',
      'trade_success': 'success',
      'trade_finished': 'success',
    };
    return alipayStatusMap[statusStr] || 'pending';
  }

  // 微信支付状态映射
  if (gateway === 'wechat') {
    const wechatStatusMap: Record<string, PaymentStatus> = {
      'notpay': 'pending',
      'success': 'success',
      'closed': 'cancelled',
      'refund': 'refunded',
    };
    return wechatStatusMap[statusStr] || 'pending';
  }

  // Stripe 状态映射
  if (gateway === 'credit-card' || gateway === 'stripe') {
    const stripeStatusMap: Record<string, PaymentStatus> = {
      'requires_payment_method': 'pending',
      'requires_confirmation': 'processing',
      'requires_action': 'processing',
      'processing': 'processing',
      'succeeded': 'success',
      'canceled': 'cancelled',
      'requires_capture': 'processing',
    };
    return stripeStatusMap[statusStr] || 'pending';
  }

  // 通用映射（先检查精确匹配）
  if (statusStr === 'success' || statusStr === 'paid') {
    return 'success';
  }
  
  if (statusStr.includes('success')) {
    return 'success';
  }
  if (statusStr.includes('fail') || statusStr === 'failed') {
    return 'failed';
  }
  if (statusStr.includes('cancel') || statusStr === 'cancelled') {
    return 'cancelled';
  }
  if (statusStr.includes('refund')) {
    return 'refunded';
  }
  if (statusStr.includes('process')) {
    return 'processing';
  }

  return 'pending';
}

/**
 * 生成支付订单号（可选工具函数）
 * @param prefix 前缀
 * @returns 订单号
 */
export function generatePaymentOrderId(prefix: string = 'PAY'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

/**
 * 验证金额范围
 * @param amount 金额
 * @param min 最小金额（默认 0.01）
 * @param max 最大金额（默认 1000000）
 * @returns 是否有效
 */
export function validateAmountRange(
  amount: number,
  min: number = 0.01,
  max: number = 1000000
): boolean {
  return amount >= min && amount <= max;
}
