# 目录结构对比：当前 vs 整洁架构

## API 应用目录结构对比

### 当前结构

```
apps/api/src/
├── controllers/          # ❌ 包含业务逻辑
│   ├── productController.ts
│   ├── userController.ts
│   ├── cartController.ts
│   └── orderController.ts
├── models/               # ❌ 基础设施代码与业务混合
│   ├── Product.ts
│   ├── User.ts
│   ├── Cart.ts
│   └── Order.ts
├── routes/               # ✅ 路由定义（保持不变）
│   ├── products.ts
│   ├── users.ts
│   ├── cart.ts
│   └── orders.ts
├── middleware/           # ✅ 中间件（保持不变）
│   └── adminAuth.ts
├── services/             # ⚠️ 空目录，未使用
├── types/                # ⚠️ 类型定义分散
│   ├── shared.d.ts
│   └── declarations.d.ts
├── scripts/              # ✅ 脚本（保持不变）
├── index.ts              # ✅ 入口文件
└── lambda.ts             # ✅ Lambda 入口
```

### 整洁架构结构

```
apps/api/src/
├── domain/                          # 🆕 领域层（核心业务逻辑）
│   ├── entities/                    # 业务实体
│   │   ├── Product.ts               # 纯业务对象，无框架依赖
│   │   ├── User.ts
│   │   ├── Order.ts
│   │   └── Cart.ts
│   ├── value-objects/                # 值对象
│   │   ├── Money.ts                 # 价格、金额等
│   │   ├── Email.ts                 # 邮箱验证逻辑
│   │   └── Address.ts               # 地址验证逻辑
│   ├── repositories/                 # 仓储接口（抽象）
│   │   ├── IProductRepository.ts    # 定义接口，不依赖实现
│   │   ├── IUserRepository.ts
│   │   ├── IOrderRepository.ts
│   │   └── ICartRepository.ts
│   └── services/                     # 领域服务接口
│       ├── IAuthService.ts
│       └── IPaymentService.ts
│
├── application/                      # 🆕 应用层（用例）
│   ├── use-cases/                    # 用例实现
│   │   ├── product/
│   │   │   ├── GetProductsUseCase.ts
│   │   │   ├── GetProductByIdUseCase.ts
│   │   │   ├── CreateProductUseCase.ts
│   │   │   ├── UpdateProductUseCase.ts
│   │   │   └── DeleteProductUseCase.ts
│   │   ├── user/
│   │   │   ├── RegisterUserUseCase.ts
│   │   │   ├── LoginUserUseCase.ts
│   │   │   └── ResetPasswordUseCase.ts
│   │   ├── cart/
│   │   │   ├── AddToCartUseCase.ts
│   │   │   ├── RemoveFromCartUseCase.ts
│   │   │   └── GetCartUseCase.ts
│   │   └── order/
│   │       ├── CreateOrderUseCase.ts
│   │       ├── GetOrderUseCase.ts
│   │       └── UpdateOrderStatusUseCase.ts
│   ├── dto/                          # 数据传输对象
│   │   ├── product/
│   │   │   ├── CreateProductDto.ts
│   │   │   └── UpdateProductDto.ts
│   │   ├── user/
│   │   │   ├── RegisterUserDto.ts
│   │   │   └── LoginUserDto.ts
│   │   └── order/
│   │       └── CreateOrderDto.ts
│   └── interfaces/                   # 应用层接口
│       ├── ILogger.ts
│       └── IEventBus.ts
│
├── infrastructure/                   # 🔄 基础设施层（重构）
│   ├── persistence/                  # 持久化实现
│   │   ├── mongodb/
│   │   │   ├── repositories/         # 仓储实现
│   │   │   │   ├── ProductRepository.ts  # 实现 IProductRepository
│   │   │   │   ├── UserRepository.ts
│   │   │   │   ├── OrderRepository.ts
│   │   │   │   └── CartRepository.ts
│   │   │   ├── models/               # MongoDB 模型（原 models/）
│   │   │   │   ├── ProductModel.ts
│   │   │   │   ├── UserModel.ts
│   │   │   │   ├── OrderModel.ts
│   │   │   │   └── CartModel.ts
│   │   │   └── mappers/              # 实体与模型映射
│   │   │       ├── ProductMapper.ts
│   │   │       ├── UserMapper.ts
│   │   │       ├── OrderMapper.ts
│   │   │       └── CartMapper.ts
│   │   └── database/
│   │       └── connection.ts
│   ├── http/                         # HTTP 实现
│   │   ├── express/
│   │   │   ├── controllers/          # 控制器（薄层，原 controllers/）
│   │   │   │   ├── ProductController.ts  # 只负责 HTTP 请求/响应
│   │   │   │   ├── UserController.ts
│   │   │   │   ├── CartController.ts
│   │   │   │   └── OrderController.ts
│   │   │   ├── routes/               # 路由（原 routes/）
│   │   │   │   ├── productRoutes.ts
│   │   │   │   ├── userRoutes.ts
│   │   │   │   ├── cartRoutes.ts
│   │   │   │   └── orderRoutes.ts
│   │   │   ├── middleware/           # 中间件（原 middleware/）
│   │   │   │   ├── authMiddleware.ts
│   │   │   │   ├── errorMiddleware.ts
│   │   │   │   └── validationMiddleware.ts
│   │   │   └── validators/           # 请求验证
│   │   │       ├── productValidators.ts
│   │   │       ├── userValidators.ts
│   │   │       └── orderValidators.ts
│   │   └── server.ts
│   ├── services/                     # 外部服务实现
│   │   ├── AuthService.ts            # 实现 IAuthService
│   │   ├── PaymentService.ts
│   │   └── EmailService.ts
│   └── logging/
│       └── Logger.ts                 # 实现 ILogger
│
├── presentation/                     # 🆕 表示层（可选）
│   └── serializers/
│       ├── ProductSerializer.ts
│       ├── UserSerializer.ts
│       └── ErrorSerializer.ts
│
├── shared/                           # 🔄 共享代码（重构）
│   ├── errors/                       # 错误定义
│   │   ├── DomainError.ts
│   │   ├── ValidationError.ts
│   │   └── NotFoundError.ts
│   ├── types/                        # 共享类型（原 types/）
│   └── utils/                        # 工具函数
│
├── config/                           # 🆕 配置
│   ├── database.ts
│   ├── server.ts
│   └── environment.ts
│
├── scripts/                          # ✅ 脚本（保持不变）
├── index.ts                          # ✅ 入口文件
└── lambda.ts                         # ✅ Lambda 入口
```

## Web 应用目录结构对比

### 当前结构

```
apps/web/
├── app/                              # Next.js App Router
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   └── ...
├── components/                       # ❌ UI 组件与业务逻辑混合
│   ├── ui/                           # 基础组件
│   └── [71 files]                    # 功能组件
├── lib/
│   ├── api/                          # ❌ API 调用直接暴露
│   │   ├── products.ts
│   │   ├── users.ts
│   │   └── ...
│   ├── store/                        # ❌ Store 包含业务逻辑
│   │   ├── productStore.ts
│   │   ├── cartStore.ts
│   │   └── ...
│   ├── hooks/                        # ✅ Hooks（保持不变）
│   ├── locales/                      # ✅ 国际化（保持不变）
│   └── utils/                        # ✅ 工具函数（保持不变）
└── mocks/                            # ✅ Mock 数据（保持不变）
```

### 整洁架构结构

```
apps/web/
├── app/                              # ✅ Next.js App Router（保持不变）
│   ├── (routes)/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── ...
│   ├── layout.tsx
│   └── globals.css
│
├── domain/                           # 🆕 领域层
│   ├── entities/                     # 业务实体
│   │   ├── Product.ts                # 纯 TypeScript 类
│   │   ├── User.ts
│   │   ├── Order.ts
│   │   └── Cart.ts
│   ├── value-objects/                 # 值对象
│   │   └── Money.ts
│   └── repositories/                  # 仓储接口（抽象）
│       ├── IProductRepository.ts     # 定义接口
│       ├── IUserRepository.ts
│       └── IOrderRepository.ts
│
├── application/                      # 🆕 应用层
│   ├── use-cases/                     # 用例实现
│   │   ├── product/
│   │   │   ├── GetProductsUseCase.ts
│   │   │   └── GetProductByIdUseCase.ts
│   │   ├── cart/
│   │   │   ├── AddToCartUseCase.ts
│   │   │   └── RemoveFromCartUseCase.ts
│   │   └── order/
│   │       └── CreateOrderUseCase.ts
│   ├── stores/                        # 🔄 状态管理（基于用例）
│   │   ├── productStore.ts            # 调用用例，不直接调用 API
│   │   ├── cartStore.ts
│   │   └── orderStore.ts
│   └── dto/                           # 数据传输对象
│       ├── product/
│       └── order/
│
├── infrastructure/                    # 🆕 基础设施层
│   ├── api/                           # API 客户端实现
│   │   ├── http/
│   │   │   ├── client.ts              # HTTP 客户端配置
│   │   │   └── repositories/          # 仓储实现（原 lib/api/）
│   │   │       ├── ProductRepository.ts  # 实现 IProductRepository
│   │   │       ├── UserRepository.ts
│   │   │       └── OrderRepository.ts
│   │   └── adapters/                  # API 适配器
│   │       └── ApiResponseAdapter.ts
│   ├── storage/                       # 本地存储
│   │   └── LocalStorageAdapter.ts
│   └── analytics/                     # 分析服务
│       └── PostHogAdapter.ts          # 原 lib/posthog.ts
│
├── presentation/                      # 🔄 表示层（原 components/）
│   ├── components/
│   │   ├── ui/                        # 基础 UI 组件（原 components/ui/）
│   │   ├── features/                  # 功能组件（原 components/）
│   │   │   ├── product/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   └── ProductList.tsx
│   │   │   ├── cart/
│   │   │   │   └── CartItem.tsx
│   │   │   └── order/
│   │   │       └── OrderSummary.tsx
│   │   └── layouts/                   # 布局组件
│   ├── hooks/                         # 🔄 React Hooks（原 lib/hooks/）
│   │   ├── useProduct.ts              # 调用用例
│   │   ├── useCart.ts
│   │   └── useOrder.ts
│   └── providers/                     # Context Providers
│       ├── AuthProvider.tsx
│       └── ThemeProvider.tsx
│
├── shared/                            # 🔄 共享代码
│   ├── types/                         # 类型定义（原 lib/types/）
│   ├── constants/                     # 常量
│   └── utils/                         # 工具函数（原 lib/utils/）
│
├── lib/                               # 🔄 配置和工具
│   ├── i18n.ts                        # ✅ 国际化（保持不变）
│   └── config.ts
│
└── mocks/                             # ✅ Mock 数据（保持不变）
```

## 关键改进点

### 1. 依赖方向

**当前：**

```
Controller → Model (直接依赖)
```

**整洁架构：**

```
Controller → UseCase → Repository Interface → Repository Implementation → Model
```

### 2. 业务逻辑位置

**当前：**

- 业务逻辑在 Controller 中
- 业务逻辑在 Store 中

**整洁架构：**

- 业务逻辑在 UseCase 中
- 业务逻辑在 Domain Entity 中
- Controller/Store 只负责协调

### 3. 测试策略

**当前：**

- 需要启动数据库才能测试业务逻辑
- 需要启动 HTTP 服务器才能测试

**整洁架构：**

- 业务逻辑可以独立测试（Mock Repository）
- 不需要数据库或 HTTP 服务器

### 4. 框架解耦

**当前：**

- 业务逻辑依赖 Express
- 业务逻辑依赖 MongoDB/Mongoose

**整洁架构：**

- 业务逻辑是纯 TypeScript
- 可以轻松切换框架（如从 Express 切换到 Fastify）
- 可以轻松切换数据库（如从 MongoDB 切换到 PostgreSQL）

## 迁移优先级

### 高优先级（核心业务）

1. **Product 模块**

   - 最常用，影响最大
   - 业务逻辑相对简单

2. **User 模块**
   - 认证授权核心
   - 安全性要求高

### 中优先级

3. **Cart 模块**

   - 依赖 Product 和 User
   - 业务逻辑中等复杂度

4. **Order 模块**
   - 依赖 Cart
   - 业务逻辑较复杂

### 低优先级（辅助功能）

5. **配置和工具**
6. **日志和监控**

## 代码示例对比

### 当前 Controller（包含业务逻辑）

```typescript
// apps/api/src/controllers/productController.ts
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) {
      // 业务逻辑：处理类别格式差异
      if (category.toLowerCase() === 'home-kitchen') {
        query = { $or: [...] };
      } else {
        query = { category: new RegExp(category, 'i') };
      }
    }
    // 直接访问数据库
    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: '获取产品列表失败' });
  }
};
```

### 整洁架构 Controller（薄层）

```typescript
// apps/api/src/infrastructure/http/express/controllers/ProductController.ts
export class ProductController {
  constructor(
    private getProductsUseCase: GetProductsUseCase,
    private getProductByIdUseCase: GetProductByIdUseCase
  ) {}

  async getAllProducts(req: Request, res: Response) {
    try {
      const { category } = req.query;
      const products = await this.getProductsUseCase.execute({
        category: category as string,
      });
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
```

### 整洁架构 UseCase（业务逻辑）

```typescript
// apps/api/src/application/use-cases/product/GetProductsUseCase.ts
export class GetProductsUseCase {
  constructor(
    private productRepository: IProductRepository,
    private logger: ILogger
  ) {}

  async execute(query: { category?: string }): Promise<Product[]> {
    // 业务逻辑：处理类别格式差异
    const categoryFilter = this.normalizeCategory(query.category);

    const products = await this.productRepository.findByCategory(categoryFilter);

    this.logger.info(`Found ${products.length} products`);
    return products;
  }

  private normalizeCategory(category?: string): string | undefined {
    if (!category) return undefined;

    if (category.toLowerCase() === 'home-kitchen') {
      return 'Home & Kitchen';
    }
    return category;
  }
}
```
