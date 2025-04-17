# MongoDB MCP架构文档

本文档描述了购物系统中的MongoDB MCP (Model-Controller-Provider) 架构实现，以及数据访问层的设计。

## 架构概述

我们采用了MCP架构模式来组织与数据库相关的代码，包括：

- **模型层 (Model)**: 定义数据结构和文档模式
- **控制器层 (Controller)**: 处理业务逻辑和请求处理
- **提供者层 (Provider)**: 负责数据访问和数据库操作

这种架构使应用具有良好的可维护性、可测试性和松耦合特性。

## 数据库连接管理

系统使用了集中化的数据库连接管理，位于 `apps/api/src/db/mongodb.ts` 文件中。该模块提供了以下功能：

- 数据库连接建立与管理
- 连接状态跟踪
- 优雅关闭连接的处理
- 错误处理与重试逻辑

核心功能包括：

- `connectDB()`: 建立与MongoDB的连接
- `disconnectDB()`: 关闭数据库连接
- `getConnectionStatus()`: 获取当前连接状态
- `getConnection()`: 获取Mongoose连接实例

## 通用仓库模式

为了简化数据访问，我们实现了一个通用仓库类 `Repository<T, K>`，位于 `apps/api/src/db/repository.ts`。

该类提供了与数据库交互的标准方法：

- `create(data: K): Promise<T>`: 创建新文档
- `findById(id: string): Promise<T | null>`: 根据ID查找文档
- `findOne(filter: FilterQuery<T>): Promise<T | null>`: 根据条件查找单个文档
- `findAll(filter?: FilterQuery<T>): Promise<T[]>`: 查找所有符合条件的文档
- `update(id: string, updateData: UpdateQuery<T>): Promise<T | null>`: 更新文档
- `delete(id: string): Promise<T | null>`: 删除文档
- `findWithPagination(...)`: 分页查询
- `count(filter?: FilterQuery<T>): Promise<number>`: 统计文档数量
- `aggregate(pipeline: any[]): Promise<any[]>`: 执行聚合操作

## 专用仓库实现

我们为每个数据模型创建了专门的仓库类，它们继承自通用Repository并添加了特定的业务方法：

### 用户仓库 (UserRepository)

位于 `apps/api/src/db/repositories/user.repository.ts`，提供了用户数据的访问方法：

- `findByUsername(username: string)`: 根据用户名查找用户
- `findByEmail(email: string)`: 根据电子邮件查找用户
- `findAdmins()`: 查找所有管理员用户
- `findRegularUsers()`: 查找所有普通用户

### 产品仓库 (ProductRepository)

位于 `apps/api/src/db/repositories/product.repository.ts`，提供了产品数据的访问方法：

- `findByCategory(category: string)`: 根据类别查找产品
- `findByPriceRange(minPrice: number, maxPrice: number)`: 查找价格区间内的产品
- `findInStock()`: 查找有库存的产品
- `updateStock(productId: string, quantity: number)`: 更新产品库存
- `searchProducts(keyword: string)`: 搜索产品

### 购物车仓库 (CartRepository)

位于 `apps/api/src/db/repositories/cart.repository.ts`，提供了购物车数据的访问方法：

- `findByUserId(userId: string)`: 根据用户ID查找购物车
- `addItem(userId: string, item: CartItem)`: 添加商品到购物车
- `updateItemQuantity(userId: string, productId: string, quantity: number)`: 更新购物车商品数量
- `removeItem(userId: string, productId: string)`: 从购物车移除商品
- `clearCart(userId: string)`: 清空购物车

### 订单仓库 (OrderRepository)

位于 `apps/api/src/db/repositories/order.repository.ts`，提供了订单数据的访问方法：

- `findByUserId(userId: string)`: 根据用户ID查找订单
- `findByStatus(status: string)`: 根据订单状态查找订单
- `updateStatus(orderId: string, status: string)`: 更新订单状态
- `getUserOrderStats(userId: string)`: 获取用户订单统计
- `getOrderAmountByDate(startDate: Date, endDate: Date)`: 获取按日期分组的订单金额统计
- `getRecentOrders(limit?: number)`: 获取最近的订单

## 使用方法

所有仓库实例可以通过中央导出点 `apps/api/src/db/repositories/index.ts` 导入：

```typescript
import {
  userRepository,
  productRepository,
  cartRepository,
  orderRepository,
} from '../db/repositories';

// 示例：使用产品仓库查找产品
async function getProductsByCategory(category: string) {
  const products = await productRepository.findByCategory(category);
  return products;
}

// 示例：创建新订单
async function createOrder(userId: string, items: CartItem[], totalAmount: number) {
  const orderData = {
    userId,
    items,
    totalAmount,
    status: 'pending',
  };

  const newOrder = await orderRepository.create(orderData);
  return newOrder;
}
```

## 错误处理

所有仓库方法都包含了统一的错误处理：

1. 每个操作都在 try/catch 块中执行
2. 捕获的错误会被记录到控制台
3. 错误会被抛出以便上层处理
4. 所有错误日志包含了特定仓库和操作的上下文信息

## 未来扩展

该架构设计可以支持以下未来扩展：

1. 添加缓存层以提高性能
2. 实现数据验证层
3. 添加更复杂的查询构建器
4. 支持分布式事务处理
5. 集成日志记录和性能监控
