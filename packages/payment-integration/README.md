# Payment Integration

支付集成工具包，提供统一的支付网关接口和工具函数。

## 功能特性

- 🎯 **统一接口** - 提供统一的支付网关抽象接口
- 💳 **多支付方式** - 支持支付宝、微信支付、信用卡（Stripe）
- 🛠️ **工具函数** - 提供支付验证、格式化等实用工具
- 📦 **类型安全** - 完整的 TypeScript 类型定义
- 🔌 **易于扩展** - 基于接口设计，易于添加新的支付网关

## 安装

```bash
pnpm add payment-integration
```

## 使用方法

### 基础使用

```typescript
import { AlipayGateway, PaymentRequest } from 'payment-integration';

// 创建支付宝网关实例
const alipayGateway = new AlipayGateway({
  appId: 'your-app-id',
  privateKey: 'your-private-key',
  publicKey: 'your-public-key',
  sandbox: true, // 沙箱环境
});

// 创建支付
const request: PaymentRequest = {
  orderId: 'ORDER123456',
  amount: 100.00, // 100 元
  currency: 'CNY',
  description: '订单支付',
  paymentMethod: 'alipay',
};

const response = await alipayGateway.createPayment(request);
console.log('支付链接:', response.paymentUrl);
```

### 使用其他支付网关

```typescript
import { WeChatGateway, CreditCardGateway } from 'payment-integration';

// 微信支付
const wechatGateway = new WeChatGateway({
  appId: 'your-wechat-app-id',
  mchId: 'your-merchant-id',
  // ... 其他配置
});

// 信用卡支付（Stripe）
const creditCardGateway = new CreditCardGateway({
  appId: 'pk_test_...', // Stripe publishable key
  secretKey: 'sk_test_...', // Stripe secret key
});
```

### 验证支付回调

```typescript
import { PaymentCallback } from 'payment-integration';

const callbackData: PaymentCallback = {
  paymentId: 'payment_123',
  orderId: 'ORDER123456',
  status: 'success',
  amount: 10000,
  timestamp: new Date().toISOString(),
  signature: 'signature_string',
  rawData: { /* 原始回调数据 */ },
};

const verification = await alipayGateway.verifyPayment(callbackData);
if (verification.isValid) {
  console.log('支付验证成功');
}
```

### 使用工具函数

```typescript
import {
  validatePaymentRequest,
  formatPaymentAmount,
  formatAmountDisplay,
  getPaymentStatusText,
} from 'payment-integration';

// 验证支付请求
const errors = validatePaymentRequest(request);
if (errors.length > 0) {
  console.error('验证失败:', errors);
}

// 格式化金额
const amountInCents = formatPaymentAmount(100.50); // 10050
const formatted = formatAmountDisplay(100.50, 'CNY'); // ¥100.50

// 获取状态文本
const statusText = getPaymentStatusText('success'); // '支付成功'
```

## API 文档

### 支付网关接口

所有支付网关都实现了 `IPaymentGateway` 接口：

- `createPayment(request: PaymentRequest): Promise<PaymentResponse>` - 创建支付
- `verifyPayment(callbackData: PaymentCallback): Promise<PaymentVerification>` - 验证支付回调
- `queryPayment(paymentId: string, orderId?: string): Promise<PaymentQueryResult>` - 查询支付状态
- `refund(request: RefundRequest): Promise<RefundResponse>` - 申请退款
- `queryRefund(refundId: string): Promise<RefundResponse>` - 查询退款状态

### 类型定义

主要类型定义请参考 `src/types.ts`：

- `PaymentRequest` - 支付请求
- `PaymentResponse` - 支付响应
- `PaymentStatus` - 支付状态枚举
- `GatewayConfig` - 网关配置
- `PaymentCallback` - 支付回调数据

### 工具函数

主要工具函数请参考 `src/utils.ts`：

- `validatePaymentRequest()` - 验证支付请求
- `formatPaymentAmount()` - 格式化金额（转换为分）
- `parsePaymentAmount()` - 解析金额（从分转换为元）
- `formatAmountDisplay()` - 格式化金额显示
- `getPaymentStatusText()` - 获取状态文本
- `parsePaymentCallback()` - 解析支付回调数据

## 开发说明

### 添加新的支付网关

1. 在 `src/gateways/` 目录下创建新的网关文件
2. 继承 `BasePaymentGateway` 类
3. 实现所有必需的方法
4. 在 `src/gateways/index.ts` 中导出

```typescript
import { BasePaymentGateway } from './base';
import type { PaymentRequest, PaymentResponse, /* ... */ } from '../types';

export class NewPaymentGateway extends BasePaymentGateway {
  readonly name = 'new-payment';

  constructor(config: GatewayConfig) {
    super(config);
    this.validateConfig();
  }

  // 实现所有必需的方法...
}
```

## 注意事项

- ⚠️ **当前实现为框架代码**：支付网关的具体 SDK 集成需要根据实际需求添加相应的依赖包
- 🔐 **安全性**：生产环境请妥善保管密钥和证书，不要在代码中硬编码
- 🌐 **环境配置**：建议使用环境变量管理不同环境的配置
- 📝 **回调验证**：务必验证支付回调的签名，防止伪造请求

## 依赖说明

本包使用 peer dependencies 声明了支付 SDK 依赖：

- `alipay-sdk` - 支付宝 SDK（可选）
- `wechatpay-node-v3` - 微信支付 SDK（可选）
- `stripe` - Stripe SDK（可选）

根据实际使用的支付方式安装相应的 SDK：

```bash
# 使用支付宝
pnpm add alipay-sdk

# 使用微信支付
pnpm add wechatpay-node-v3

# 使用 Stripe
pnpm add stripe
```

## License

MIT
