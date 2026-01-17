import type { PaymentMethod } from 'shared';

// -----------Payment Status-----------
// 支付状态枚举
export type PaymentStatus = 
  | 'pending'      // 待支付
  | 'processing'   // 处理中
  | 'success'      // 支付成功
  | 'failed'       // 支付失败
  | 'cancelled'    // 已取消
  | 'refunded';    // 已退款

// -----------Payment Request-----------
// 支付请求接口
export interface PaymentRequest {
  // 订单信息
  orderId: string;
  amount: number;              // 支付金额（单位：分）
  currency?: string;           // 货币类型，默认 'CNY'
  description?: string;        // 订单描述
  
  // 用户信息
  userId?: string;
  customerName?: string;       // 客户名称
  customerPhone?: string;      // 客户电话
  customerEmail?: string;      // 客户邮箱
  
  // 支付方式
  paymentMethod: PaymentMethod;
  
  // 支付网关特定参数
  gatewayParams?: Record<string, any>;
  
  // 回调地址
  returnUrl?: string;          // 前端返回地址
  notifyUrl?: string;          // 后端通知地址
}

// -----------Payment Response-----------
// 支付响应接口
export interface PaymentResponse {
  // 支付信息
  paymentId: string;           // 支付 ID（第三方支付平台的订单号）
  orderId: string;             // 订单 ID
  status: PaymentStatus;       // 支付状态
  
  // 支付结果
  amount: number;              // 支付金额
  currency: string;            // 货币类型
  paidAt?: Date;               // 支付时间
  
  // 网关响应
  gatewayResponse?: Record<string, any>;  // 网关原始响应数据
  
  // 支付链接（用于跳转支付）
  paymentUrl?: string;         // 支付链接
  qrCode?: string;             // 二维码（用于扫码支付）
  
  // 错误信息
  errorCode?: string;          // 错误代码
  errorMessage?: string;       // 错误消息
}

// -----------Payment Verification-----------
// 支付验证结果
export interface PaymentVerification {
  isValid: boolean;            // 验证是否通过
  paymentId: string;           // 支付 ID
  orderId: string;             // 订单 ID
  status: PaymentStatus;       // 支付状态
  amount: number;              // 支付金额
  verifiedAt: Date;            // 验证时间
  errorMessage?: string;       // 错误信息
}

// -----------Refund Request-----------
// 退款请求接口
export interface RefundRequest {
  paymentId: string;           // 原支付 ID
  orderId: string;             // 订单 ID
  amount?: number;             // 退款金额（不填则全额退款）
  reason?: string;             // 退款原因
  notifyUrl?: string;          // 退款通知地址
}

// -----------Refund Response-----------
// 退款响应接口
export interface RefundResponse {
  refundId: string;            // 退款 ID
  paymentId: string;           // 原支付 ID
  orderId: string;             // 订单 ID
  amount: number;              // 退款金额
  status: PaymentStatus;       // 退款状态
  refundedAt?: Date;           // 退款时间
  gatewayResponse?: Record<string, any>;  // 网关原始响应
  errorCode?: string;
  errorMessage?: string;
}

// -----------Gateway Config-----------
// 支付网关配置接口
export interface GatewayConfig {
  // 通用配置
  appId: string;               // 应用 ID
  appKey?: string;             // 应用密钥
  secretKey?: string;          // 密钥
  publicKey?: string;          // 公钥
  privateKey?: string;         // 私钥
  
  // 环境配置
  sandbox?: boolean;           // 是否沙箱环境
  apiUrl?: string;             // API 地址
  
  // 回调配置
  returnUrl?: string;          // 返回地址
  notifyUrl?: string;          // 通知地址
  
  // 其他配置
  [key: string]: any;          // 允许其他配置项
}

// -----------Payment Callback-----------
// 支付回调数据
export interface PaymentCallback {
  paymentId: string;           // 支付 ID
  orderId: string;             // 订单 ID
  status: PaymentStatus;       // 支付状态
  amount: number;              // 支付金额
  timestamp: string;           // 时间戳
  signature?: string;          // 签名（用于验证）
  rawData: Record<string, any>; // 原始回调数据
}

// -----------Payment Query-----------
// 支付查询结果
export interface PaymentQueryResult {
  paymentId: string;
  orderId: string;
  status: PaymentStatus;
  amount: number;
  paidAt?: Date;
  gatewayResponse?: Record<string, any>;
}
