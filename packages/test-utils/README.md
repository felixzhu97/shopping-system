# @shopping-system/test-utils

用于购物系统项目的测试工具包，提供全面的测试工具，包括 Mock 工具、测试数据工厂、测试辅助函数和 React 测试工具。

## 安装

该包已经在 monorepo 中配置。在其他包中使用时，确保在 `package.json` 中添加依赖：

```json
{
  "devDependencies": {
    "@shopping-system/test-utils": "workspace:*"
  }
}
```

## 使用方法

### Mock 工具

```typescript
import { setupBrowserMocks, mockNextRouter } from '@shopping-system/test-utils';

beforeEach(() => {
  setupBrowserMocks();
  mockNextRouter({ pathname: '/products' });
});
```

### 测试数据工厂

```typescript
import { createUser, createProduct, createCartItem, createOrder } from '@shopping-system/test-utils';

// 创建单个对象
const user = createUser.create({ role: 'admin' });
const product = createProduct.create({ category: 'electronics' });

// 批量创建
const products = createProduct.createMany(5, { category: 'electronics' });

// 创建部分对象（用于更新操作）
const partialUser = createUser.createPartial({ firstName: 'Jane' });
```

### 测试辅助函数

```typescript
import { createMockReq, createMockRes, delay, flushPromises } from '@shopping-system/test-utils';

// 创建请求/响应对象
const req = createMockReq({ body: { name: 'test' } });
const res = createMockRes();

// 异步工具
await delay(100);
await flushPromises();
```

### React 测试工具

```typescript
import { renderWithProviders, renderHookWithProviders } from '@shopping-system/test-utils/react';

// 使用自定义渲染器
const { container } = renderWithProviders(<MyComponent />, {
  providers: [MyProvider],
  initialState: { cart: { items: [] } }
});

// 使用 Hook 渲染器
const { result } = renderHookWithProviders(() => useMyHook(), {
  providers: [MyProvider]
});
```

### 测试环境设置

```typescript
import { setupWebTests, setupApiTests } from '@shopping-system/test-utils';

// 在 vitest.setup.ts 中
setupWebTests(); // 或 setupApiTests()
```

## 模块说明

### Mocks (`src/mocks/`)
- `browser.ts` - 浏览器 API Mock
- `nextjs.ts` - Next.js Router 和 Navigation Mock
- `http.ts` - HTTP 请求/响应 Mock
- `react-i18next.ts` - React i18next Mock
- `zustand.ts` - Zustand Store Mock

### Factories (`src/factories/`)
- `user.ts` - 用户数据工厂
- `product.ts` - 产品数据工厂
- `cart.ts` - 购物车数据工厂
- `order.ts` - 订单数据工厂

### Helpers (`src/helpers/`)
- `request-response.ts` - 请求/响应对象创建器
- `async.ts` - 异步测试工具
- `assertions.ts` - 断言扩展

### React (`src/react/`)
- `render.tsx` - 自定义渲染器
- `queries.ts` - 查询工具扩展
- `hooks.ts` - Hook 测试工具

### Setup (`src/setup/`)
- `vitest-web.ts` - Web 应用的 Vitest 设置
- `vitest-api.ts` - API 应用的 Vitest 设置

## License

MIT
