# 整洁架构重构建议

## 概述

本文档基于 Robert C. Martin 的整洁架构（Clean Architecture）原则，为购物系统项目提供目录结构优化建议。

## 整洁架构核心原则

1. **依赖规则**：依赖关系只能从外层指向内层，内层不依赖外层
2. **关注点分离**：业务逻辑与框架、数据库、UI 分离
3. **可测试性**：业务逻辑可以独立于框架进行测试
4. **可维护性**：易于理解和修改

## 当前架构问题分析

### API 应用（apps/api）

**问题：**

- 控制器直接访问模型，业务逻辑在控制器中
- 缺少服务层（Services Layer）
- 缺少领域层（Domain Layer）
- 缺少用例层（Use Cases）
- 基础设施代码（数据库、HTTP）与业务逻辑混合

**当前结构：**

```
apps/api/src/
├── controllers/     # 包含业务逻辑
├── models/          # 数据库模型（基础设施）
├── routes/          # 路由定义
├── middleware/      # 中间件
└── types/           # 类型定义
```

### Web 应用（apps/web）

**问题：**

- Store 层直接调用 API，缺少领域层抽象
- 业务逻辑分散在组件和 Store 中
- 缺少用例层

**当前结构：**

```
apps/web/
├── app/             # Next.js 页面
├── components/      # UI 组件
├── lib/
│   ├── api/         # API 调用
│   ├── store/       # 状态管理（包含业务逻辑）
│   └── hooks/       # React Hooks
```

## 推荐的目录结构

### API 应用重构方案

```
apps/api/src/
├── domain/                          # 领域层（最内层）
│   ├── entities/                    # 实体
│   │   ├── Product.ts
│   │   ├── User.ts
│   │   ├── Order.ts
│   │   └── Cart.ts
│   ├── value-objects/                # 值对象
│   │   ├── Money.ts
│   │   ├── Email.ts
│   │   └── Address.ts
│   ├── repositories/                 # 仓储接口（抽象）
│   │   ├── IProductRepository.ts
│   │   ├── IUserRepository.ts
│   │   ├── IOrderRepository.ts
│   │   └── ICartRepository.ts
│   └── services/                     # 领域服务接口
│       ├── IAuthService.ts
│       └── IPaymentService.ts
│
├── application/                      # 应用层（用例层）
│   ├── use-cases/                    # 用例
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
│   │   ├── user/
│   │   ├── cart/
│   │   └── order/
│   └── interfaces/                   # 应用层接口
│       ├── ILogger.ts
│       └── IEventBus.ts
│
├── infrastructure/                   # 基础设施层（最外层）
│   ├── persistence/                  # 持久化实现
│   │   ├── mongodb/
│   │   │   ├── repositories/
│   │   │   │   ├── ProductRepository.ts
│   │   │   │   ├── UserRepository.ts
│   │   │   │   ├── OrderRepository.ts
│   │   │   │   └── CartRepository.ts
│   │   │   ├── models/               # MongoDB 模型
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
│   │   │   ├── controllers/          # 控制器（薄层）
│   │   │   │   ├── ProductController.ts
│   │   │   │   ├── UserController.ts
│   │   │   │   ├── CartController.ts
│   │   │   │   └── OrderController.ts
│   │   │   ├── routes/
│   │   │   │   ├── productRoutes.ts
│   │   │   │   ├── userRoutes.ts
│   │   │   │   ├── cartRoutes.ts
│   │   │   │   └── orderRoutes.ts
│   │   │   ├── middleware/
│   │   │   │   ├── authMiddleware.ts
│   │   │   │   ├── errorMiddleware.ts
│   │   │   │   └── validationMiddleware.ts
│   │   │   └── validators/           # 请求验证
│   │   │       ├── productValidators.ts
│   │   │       ├── userValidators.ts
│   │   │       └── orderValidators.ts
│   │   └── server.ts
│   ├── services/                     # 外部服务实现
│   │   ├── AuthService.ts
│   │   ├── PaymentService.ts
│   │   └── EmailService.ts
│   └── logging/
│       └── Logger.ts
│
├── presentation/                     # 表示层（可选，用于 API 响应格式化）
│   └── serializers/
│       ├── ProductSerializer.ts
│       ├── UserSerializer.ts
│       └── ErrorSerializer.ts
│
├── shared/                           # 共享代码
│   ├── errors/                       # 错误定义
│   │   ├── DomainError.ts
│   │   ├── ValidationError.ts
│   │   └── NotFoundError.ts
│   ├── types/                        # 共享类型
│   └── utils/                        # 工具函数
│
├── config/                           # 配置
│   ├── database.ts
│   ├── server.ts
│   └── environment.ts
│
├── index.ts                          # 应用入口
└── lambda.ts                         # Lambda 入口
```

### Web 应用重构方案

```
apps/web/
├── app/                              # Next.js App Router
│   ├── (routes)/                     # 路由页面
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── ...
│   ├── layout.tsx
│   └── globals.css
│
├── domain/                           # 领域层
│   ├── entities/                     # 实体
│   │   ├── Product.ts
│   │   ├── User.ts
│   │   ├── Order.ts
│   │   └── Cart.ts
│   ├── value-objects/                # 值对象
│   │   └── Money.ts
│   └── repositories/                 # 仓储接口
│       ├── IProductRepository.ts
│       ├── IUserRepository.ts
│       └── IOrderRepository.ts
│
├── application/                      # 应用层
│   ├── use-cases/                    # 用例
│   │   ├── product/
│   │   │   ├── GetProductsUseCase.ts
│   │   │   └── GetProductByIdUseCase.ts
│   │   ├── cart/
│   │   │   ├── AddToCartUseCase.ts
│   │   │   └── RemoveFromCartUseCase.ts
│   │   └── order/
│   │       └── CreateOrderUseCase.ts
│   ├── stores/                       # 状态管理（基于用例）
│   │   ├── productStore.ts
│   │   ├── cartStore.ts
│   │   └── orderStore.ts
│   └── dto/                          # 数据传输对象
│
├── infrastructure/                   # 基础设施层
│   ├── api/                          # API 客户端实现
│   │   ├── http/
│   │   │   ├── client.ts
│   │   │   └── repositories/
│   │   │       ├── ProductRepository.ts
│   │   │       ├── UserRepository.ts
│   │   │       └── OrderRepository.ts
│   │   └── adapters/                 # API 适配器
│   ├── storage/                      # 本地存储
│   │   └── LocalStorageAdapter.ts
│   └── analytics/                    # 分析服务
│       └── PostHogAdapter.ts
│
├── presentation/                     # 表示层
│   ├── components/                   # UI 组件
│   │   ├── ui/                       # 基础 UI 组件
│   │   ├── features/                 # 功能组件
│   │   │   ├── product/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   └── ProductList.tsx
│   │   │   ├── cart/
│   │   │   │   └── CartItem.tsx
│   │   │   └── order/
│   │   │       └── OrderSummary.tsx
│   │   └── layouts/                  # 布局组件
│   ├── hooks/                        # React Hooks
│   │   ├── useProduct.ts
│   │   ├── useCart.ts
│   │   └── useOrder.ts
│   └── providers/                    # Context Providers
│       ├── AuthProvider.tsx
│       └── ThemeProvider.tsx
│
├── shared/                           # 共享代码
│   ├── types/                        # 类型定义
│   ├── constants/                    # 常量
│   └── utils/                        # 工具函数
│
└── lib/                              # 配置和工具
    ├── i18n.ts
    └── config.ts
```

## 重构步骤建议

### 阶段 1：API 应用重构

1. **创建领域层**

   - 提取实体（Entity）
   - 定义值对象（Value Object）
   - 定义仓储接口（Repository Interface）

2. **创建应用层**

   - 实现用例（Use Case）
   - 定义 DTO
   - 实现用例测试

3. **重构基础设施层**

   - 实现仓储（Repository Implementation）
   - 重构控制器为薄层
   - 添加依赖注入容器

4. **迁移现有代码**
   - 逐步将业务逻辑从控制器移到用例
   - 将数据库操作移到仓储实现

### 阶段 2：Web 应用重构

1. **创建领域层**

   - 定义实体和值对象
   - 定义仓储接口

2. **创建应用层**

   - 实现用例
   - 重构 Store 使用用例

3. **重构基础设施层**

   - 实现 API 仓储
   - 添加适配器模式

4. **重构表示层**
   - 组件只负责 UI 渲染
   - 通过 Hooks 调用用例

## 依赖注入建议

### API 应用

使用依赖注入容器（如 `inversify` 或 `tsyringe`）：

```typescript
// config/container.ts
import { Container } from 'inversify';
import { IProductRepository } from '../domain/repositories/IProductRepository';
import { ProductRepository } from '../infrastructure/persistence/mongodb/repositories/ProductRepository';
import { GetProductsUseCase } from '../application/use-cases/product/GetProductsUseCase';

const container = new Container();

// 绑定仓储
container.bind<IProductRepository>('IProductRepository').to(ProductRepository);

// 绑定用例
container.bind<GetProductsUseCase>('GetProductsUseCase').to(GetProductsUseCase);

export { container };
```

### Web 应用

使用 React Context 或 Zustand 中间件实现依赖注入：

```typescript
// infrastructure/di/container.ts
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { ProductRepository } from '../api/http/repositories/ProductRepository';

class Container {
  private productRepository: IProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  getProductRepository(): IProductRepository {
    return this.productRepository;
  }
}

export const container = new Container();
```

## 测试策略

### 领域层测试

- 单元测试，不依赖外部框架
- 测试业务规则和验证逻辑

### 应用层测试

- 使用 Mock 仓储测试用例
- 测试用例的业务流程

### 基础设施层测试

- 集成测试
- 测试与外部服务的交互

## 迁移注意事项

1. **渐进式重构**：不要一次性重构所有代码，按模块逐步迁移
2. **保持向后兼容**：在重构过程中保持 API 接口不变
3. **充分测试**：每个重构步骤都要有测试覆盖
4. **文档更新**：及时更新架构文档和开发指南

## 预期收益

1. **可测试性提升**：业务逻辑可以独立测试
2. **可维护性提升**：代码结构清晰，易于理解
3. **可扩展性提升**：易于添加新功能
4. **框架解耦**：业务逻辑不依赖特定框架
5. **团队协作**：清晰的层次结构便于团队协作

## 参考资源

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
