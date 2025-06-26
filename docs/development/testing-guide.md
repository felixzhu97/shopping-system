# 测试指南

## 概述

本项目使用 Vitest 和 React Testing Library 进行单元测试，确保代码质量和功能的正确性。

## 测试规范

### 测试框架

- **API 项目**: Vitest
- **Web 项目**: Vitest + React Testing Library
- **测试覆盖率要求**: 80%以上

### 文件组织

```
apps/api/src/
├── __tests__/
│   ├── controllers/
│   │   ├── userController.test.ts
│   │   ├── productController.test.ts
│   │   ├── cartController.test.ts
│   │   └── orderController.test.ts
│   └── models/
│       ├── User.test.ts
│       ├── Product.test.ts
│       ├── Cart.test.ts
│       └── Order.test.ts

apps/web/
├── __tests__/
│   ├── components/
│   │   ├── navbar.test.tsx
│   │   ├── footer.test.tsx
│   │   └── product-card.test.tsx
│   └── pages/
│       └── index.test.tsx
```

### 命名规范

- 测试文件: `xxx.test.ts` 或 `xxx.test.tsx`
- 测试描述: 使用英文描述
- 测试分组: 使用 `describe` 进行逻辑分组

## 运行测试

### 基本命令

#### API 测试

```bash
# 运行所有测试
cd apps/api && pnpm test

# 监视模式
cd apps/api && pnpm test:watch

# 生成覆盖率报告
cd apps/api && pnpm test:coverage
```

#### Web 测试

```bash
# 运行所有测试
cd apps/web && pnpm test

# 监视模式
cd apps/web && pnpm test:watch

# 生成覆盖率报告
cd apps/web && pnpm test:coverage
```

#### 全项目测试

```bash
# 从根目录运行所有测试
pnpm test

# 运行特定应用的测试
pnpm test --filter api
pnpm test --filter web
```

## 测试编写指南

### API 控制器测试示例

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { register, login } from '../../controllers/userController';
import User from '../../models/User';

// Mock dependencies
vi.mock('../../models/User');

const mockUser = User as any;

describe('User Controller', () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = { body: {}, params: {} };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockReq.body = userData;
      mockUser.findOne = vi.fn().mockResolvedValue(null);

      const mockSave = vi.fn().mockResolvedValue({
        _id: 'user-id',
        ...userData,
        role: 'user',
      });

      mockUser.mockImplementation(() => ({ save: mockSave }));

      await register(mockReq, mockRes);

      expect(mockUser.findOne).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userData.email,
          role: 'user',
        })
      );
    });

    it('should return error if email already exists', async () => {
      mockReq.body = { email: 'existing@example.com' };
      mockUser.findOne = vi.fn().mockResolvedValue({ _id: 'existing-user' });

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '邮箱或手机号已被使用',
      });
    });
  });
});
```

### React 组件测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../components/navbar';

describe('Navbar Component', () => {
  it('should render navigation links', () => {
    render(<Navbar />);

    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('产品')).toBeInTheDocument();
    expect(screen.getByText('购物车')).toBeInTheDocument();
  });

  it('should handle user login state', async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const loginButton = screen.getByText('登录');
    await user.click(loginButton);

    // 测试登录后的状态变化
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });
});
```

## 模拟 (Mocking) 指南

### 模拟数据库模型

```typescript
vi.mock('../../models/User', () => ({
  default: {
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));
```

### 模拟外部依赖

```typescript
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn().mockReturnValue('mock-token'),
  verify: vi.fn().mockReturnValue({ id: 'user-id' }),
}));
```

### 模拟环境变量

```typescript
vi.mock('../index', () => ({
  getJwtSecret: vi.fn(() => 'test-secret'),
}));
```

## 覆盖率配置

### 覆盖率阈值

- 代码行覆盖率: 80%
- 函数覆盖率: 80%
- 分支覆盖率: 80%
- 语句覆盖率: 80%

### 覆盖率排除文件

- 配置文件 (vitest.config.ts, next.config.mjs)
- 构建产物 (dist/, .next/)
- 类型定义文件 (\*.d.ts)
- Storybook 文件 (\*.stories.tsx)
- 脚本文件 (scripts/)

## CI/CD 集成

测试在 GitHub Actions 中自动运行：

1. **推送/拉取请求时**: 运行完整测试套件
2. **部署前**: 必须通过所有测试
3. **覆盖率报告**: 自动上传到 Codecov

### 工作流文件

- `.github/workflows/test.yml` - 独立测试工作流
- `.github/workflows/deploy-test.yml` - 部署前测试

## 最佳实践

### 测试编写原则

1. **AAA 模式**: Arrange, Act, Assert
2. **单一职责**: 每个测试只验证一个功能点
3. **独立性**: 测试之间不应相互依赖
4. **可读性**: 使用清晰的测试描述

### Mock 使用原则

1. **最小化 Mock**: 只 Mock 必要的外部依赖
2. **重置状态**: 每个测试后重置 Mock 状态
3. **验证调用**: 验证 Mock 函数的调用参数和次数

### 测试数据管理

1. **工厂函数**: 使用工厂函数创建测试数据
2. **常量提取**: 将测试常量提取到专门的文件
3. **随机数据**: 使用库生成随机测试数据

## 故障排除

### 常见问题

#### 1. Mock 不生效

```typescript
// 确保 Mock 在导入之前
vi.mock('./module');
import { function } from './module';
```

#### 2. 异步测试超时

```typescript
// 增加超时时间
it('should handle async operation', async () => {
  // test code
}, 10000); // 10秒超时
```

#### 3. DOM 测试失败

```typescript
// 确保设置了正确的测试环境
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

### 调试技巧

1. **使用 console.log**: 在测试中打印调试信息
2. **单独运行**: 使用 `it.only()` 运行单个测试
3. **跳过测试**: 使用 `it.skip()` 临时跳过测试
4. **断点调试**: 在 IDE 中设置断点进行调试

## 参考资源

- [Vitest 官方文档](https://vitest.dev/)
- [React Testing Library 文档](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Mock 指南](https://jestjs.io/docs/mock-functions)
- [测试最佳实践](https://github.com/goldbergyoni/javascript-testing-best-practices)
