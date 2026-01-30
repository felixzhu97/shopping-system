# 购物系统新成员入职指南

欢迎加入购物系统开发团队！本指南旨在帮助你快速熟悉项目并开始贡献。

## 1. 项目概述

购物系统是一个基于现代Web技术开发的电子商务平台，采用Monorepo架构组织代码，包含前端和后端应用。

### 1.1 项目愿景

我们的目标是创建一个高性能、可扩展的购物系统，为用户提供便捷的购物体验，为商家提供高效的销售和管理工具。详情请参阅[产品愿景文档](./product-vision.md)。

### 1.2 核心功能

- 用户注册和认证
- 商品浏览和搜索
- 购物车管理
- 订单处理
- 支付集成
- 管理后台

### 1.3 技术栈概览

- **前端**：Next.js, React, Tailwind CSS
- **后端**：Express.js, Node.js
- **数据库**：MongoDB, Mongoose
- **构建工具**：Turborepo, PNPM
- **部署**：Vercel, MongoDB Atlas

## 2. 开发环境设置

### 2.1 前置条件

确保你的开发环境满足以下要求：

- **Node.js**: v18+（推荐使用nvm管理Node版本）
- **PNPM**: v8+
- **Git**: 最新版
- **IDE**: 推荐使用Visual Studio Code
- **MongoDB**: v6+（用于本地开发）

### 2.2 获取代码

```bash
# 克隆项目仓库
git clone https://github.com/your-username/shopping-system.git
cd shopping-system

# 安装依赖
pnpm install
```

### 2.3 环境变量配置

1. 在项目根目录创建`.env.local`文件
2. 复制`.env.example`中的内容到`.env.local`
3. 根据注释填写必要的环境变量
4. 参考[环境变量配置指南](./ENVIRONMENT.md)了解详细信息

### 2.4 启动开发服务器

```bash
# 启动所有服务
pnpm dev

# 只启动前端
pnpm --filter web dev

# 只启动后端
pnpm --filter api dev

# 启动Storybook（UI组件开发环境）
pnpm --filter web storybook
```

## 3. 代码库组织

```
shopping-system/
├── apps/                  # 应用程序
│   ├── web/               # Next.js前端应用
│   └── api/               # Express.js后端API
├── packages/              # 共享包
│   ├── ui/                # UI组件库
│   └── shared/            # 共享工具和类型
├── docs/                  # 项目文档
├── .github/               # GitHub Actions工作流
├── .husky/                # Git hooks
```

### 3.1 前端应用结构

```
apps/web/
├── app/                   # Next.js App Router页面
├── components/            # React组件
├── hooks/                 # React自定义钩子
├── lib/                   # 工具函数库
├── public/                # 静态资源
└── styles/                # 全局样式
```

### 3.2 后端API结构

```
services/api/
├── src/
│   ├── controllers/       # 控制器
│   ├── db/                # 数据库配置和仓库
│   ├── middleware/        # 中间件
│   ├── models/            # 数据模型
│   ├── routes/            # API路由
│   └── types/             # TypeScript类型定义
└── tests/                 # 测试文件
```

## 4. 开发工作流

### 4.1 分支管理

我们采用以下分支策略：

- `main`: 主分支，始终保持可部署状态
- `develop`: 开发分支，新功能合并到此分支
- `feature/*`: 功能分支，从develop分支创建
- `bugfix/*`: 修复分支，用于修复非紧急bug
- `hotfix/*`: 热修复分支，用于修复生产环境问题

```bash
# 创建新功能分支示例
git checkout develop
git pull
git checkout -b feature/add-payment-method

# 提交代码
git add .
git commit -m "feat: add new payment method"
git push -u origin feature/add-payment-method
```

### 4.2 提交规范

我们遵循[约定式提交](https://www.conventionalcommits.org/)规范，具体规则见[提交规范](./COMMIT_CONVENTION.md)。

提交信息格式：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

常用类型：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码风格调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/依赖更新

### 4.3 代码审查

所有代码更改都需要通过Pull Request(PR)进行提交和审查：

1. 创建功能分支并开发功能
2. 提交代码并将分支推送到远程仓库
3. 创建Pull Request请求合并到develop分支
4. 至少需要一名团队成员审查并批准
5. 所有CI检查通过后可以合并

### 4.4 测试策略

我们重视测试驱动开发，请确保你的代码包含适当的测试：

- **单元测试**: 测试独立功能和组件
- **集成测试**: 测试组件之间的交互
- **端到端测试**: 测试完整用户流程

```bash
# 运行所有测试
pnpm test

# 运行特定应用的测试
pnpm --filter api test
pnpm --filter web test
```

## 5. MCP架构理解

我们的后端采用MCP(Model-Controller-Provider)架构，详细说明请参考[MongoDB MCP架构文档](./mongodb-mcp.md)。

### 5.1 核心组件

- **Model**: 定义数据结构和验证规则
- **Controller**: 处理HTTP请求和响应
- **Provider**: 负责数据访问和业务逻辑

### 5.2 示例：创建新资源

1. 在`models`目录创建数据模型
2. 在`db/repositories`创建资源仓库
3. 在`controllers`创建控制器处理请求
4. 在`routes`创建API路由

## 6. 实用资源

### 6.1 核心文档

- [系统架构文档](./system-architecture.md)
- [API文档](./api-documentation.md)
- [数据库设计](./database-design.md)
- [用户故事地图](./user-story-map.md)

### 6.2 学习资源

- [Next.js文档](https://nextjs.org/docs)
- [Express.js文档](https://expressjs.com/)
- [MongoDB文档](https://docs.mongodb.com/)
- [Mongoose文档](https://mongoosejs.com/docs/)
- [Turborepo文档](https://turbo.build/repo/docs)

### 6.3 工具和权限

你将需要以下工具和权限：

- GitHub仓库访问权限
- Vercel账户访问权限
- MongoDB Atlas访问权限
- 团队通信工具（Slack/Teams）

## 7. 典型任务指南

### 7.1 添加新API端点

```javascript
// 1. 创建/更新数据模型 (src/models/product.model.ts)
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  // ...其他字段
});

export const Product = mongoose.model('Product', productSchema);

// 2. 创建/更新仓库 (src/db/repositories/product.repository.ts)
import { Repository } from '../repository';
import { Product } from '../../models/product.model';

class ProductRepository extends Repository<typeof Product> {
  constructor() {
    super(Product);
  }

  // 特定业务方法
  async findByCategory(category: string) {
    return this.model.find({ category }).exec();
  }
}

export const productRepository = new ProductRepository();

// 3. 创建控制器 (src/controllers/product.controller.ts)
import { Request, Response } from 'express';
import { productRepository } from '../db/repositories/product.repository';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await productRepository.findAll();
    res.json({ success: true, data: { products } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch products' }
    });
  }
};

// 4. 创建路由 (src/routes/product.routes.ts)
import { Router } from 'express';
import { getProducts } from '../controllers/product.controller';

const router = Router();

router.get('/', getProducts);

export default router;

// 5. 注册路由 (src/index.ts)
import productRoutes from './routes/product.routes';

app.use('/api/products', productRoutes);
```

### 7.2 添加新前端页面

```typescript
// app/products/page.tsx
import { getProducts } from '@/lib/api';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">All Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

## 8. 常见问题与解答

### 8.1 开发环境问题

**Q: 本地环境启动失败?**  
A: 检查以下事项：

- MongoDB是否正在运行
- 环境变量是否正确配置
- 所有依赖是否安装（运行`pnpm install`）

**Q: 代码更改没有生效?**  
A: 检查开发服务器是否正常运行，有时需要重启服务器：

```bash
# 停止当前服务
Ctrl+C

# 重新启动
pnpm dev
```

### 8.2 版本控制问题

**Q: 如何解决git合并冲突?**  
A: 使用以下步骤解决冲突：

1. `git pull origin develop`
2. 解决文件中的冲突（冲突标记为`<<<<<<<`, `=======`, `>>>>>>>`)
3. `git add .`
4. `git commit -m "resolve merge conflicts"`
5. `git push`

## 9. 入职清单

- [ ] 获取代码库访问权限
- [ ] 设置本地开发环境
- [ ] 了解项目结构和架构
- [ ] 熟悉开发工作流程
- [ ] 加入团队通讯渠道
- [ ] 获取必要的第三方服务访问权限
- [ ] 阅读核心文档
- [ ] 完成第一个简单任务
- [ ] 参加团队介绍会议

## 10. 联系信息

### 10.1 团队成员

| 角色         | 姓名 | 联系方式             | 职责           |
| ------------ | ---- | -------------------- | -------------- |
| 项目经理     | 张三 | manager@example.com  | 项目管理和协调 |
| 前端负责人   | 李四 | frontend@example.com | 前端架构和开发 |
| 后端负责人   | 王五 | backend@example.com  | 后端架构和开发 |
| DevOps工程师 | 赵六 | devops@example.com   | CI/CD和部署    |

### 10.2 沟通渠道

- **团队会议**: 每周一上午10:00
- **代码审查**: GitHub Pull Requests
- **即时通讯**: Slack #shopping-system频道
- **文档共享**: Notion工作区
- **任务管理**: JIRA项目板

## 11. 编码规范

### 11.1 前端编码规范

- 使用函数组件和React Hooks
- 遵循[Airbnb React/JSX风格指南](https://github.com/airbnb/javascript/tree/master/react)
- 使用TypeScript强类型
- 使用Tailwind CSS进行样式设计
- 组件文件名使用PascalCase
- 工具函数文件名使用camelCase

### 11.2 后端编码规范

- 遵循[Airbnb JavaScript风格指南](https://github.com/airbnb/javascript)
- 使用TypeScript强类型
- API端点使用RESTful设计风格
- 使用异步/等待(async/await)而非回调
- 文件名使用kebab-case
- 类名使用PascalCase
- 函数和变量名使用camelCase

## 12. 完成第一个任务

为了帮助你熟悉项目，我们建议你从以下简单任务开始：

1. **修复简单bug**: 从标记为"good first issue"的问题开始
2. **添加新功能**: 实现一个小型功能增强
3. **编写测试**: 为现有功能添加测试
4. **更新文档**: 改进或扩展项目文档

你的导师会指导你完成第一个任务并提供反馈。
