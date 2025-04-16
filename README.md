# 购物系统 Monorepo

基于 Turborepo 的购物系统 monorepo 项目。

## 项目结构

```
shopping-system/
├── apps/
│   ├── web/           # Next.js 前端应用
│   └── api/           # Express.js 后端API服务
├── packages/
│   ├── ui/            # UI组件库
│   └── shared/        # 共享工具和类型
```

## 使用技术

- [Turborepo](https://turbo.build/repo) - Monorepo 构建系统
- [Next.js](https://nextjs.org/) - React 框架
- [Express.js](https://expressjs.com/) - Node.js Web 框架
- [MongoDB](https://www.mongodb.com/) - 文档数据库
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM
- [TypeScript](https://www.typescriptlang.org/) - 类型系统
- [PNPM](https://pnpm.io/) - 包管理器
- [Storybook](https://storybook.js.org/) - UI 组件开发环境

## 配置说明

### Turborepo 配置

项目使用 Turborepo 进行构建管理，主要配置在 `turbo.json` 文件中：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "remoteCache": {
    "enabled": true
  },
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    },
    "start": {
      "dependsOn": ["build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

配置说明：

- `globalDependencies`: 全局依赖文件，环境变量文件变化会触发所有任务重新运行
- `remoteCache`: 启用 Turborepo 远程缓存功能
- `pipeline.build`: 构建命令，依赖于所有上游包的构建完成
- `pipeline.dev`: 开发命令，禁用缓存并设为持久运行
- `pipeline.clean`: 清理命令，禁用缓存
- `pipeline.start`: 启动命令，依赖于构建完成
- `pipeline.test`: 测试命令，依赖于构建完成

### GitHub Actions 配置

项目使用 GitHub Actions 进行 CI/CD，配置文件位于 `.github/workflows/ci.yml`。主要功能：

- 自动运行测试和构建
- 集成 Turborepo 远程缓存
- PNPM 依赖缓存优化

要启用 Turborepo 远程缓存，需要配置以下环境变量：

1. `TURBO_TOKEN`: 从 [Vercel 账户设置](https://vercel.com/account/tokens) 获取
2. `TURBO_TEAM`: 从 Vercel 团队设置中获取团队 ID

### 工作空间配置

使用 PNPM 工作空间管理多包项目，配置在 `pnpm-workspace.yaml`：

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

### TypeScript 配置

根目录 `tsconfig.json` 为基础配置，各包通过 `extends` 继承这些配置并添加自己的特定配置。

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 启动开发环境

```bash
# 启动所有服务
pnpm dev

# 只启动前端
pnpm --filter web dev

# 只启动后端
pnpm --filter api dev

# 启动 Storybook
pnpm --filter web storybook
```

### 构建项目

```bash
pnpm build
```

### 启动应用

```bash
pnpm start
```

### 运行测试

```bash
pnpm test
```

### 添加依赖

添加到工作空间:

```bash
pnpm add -w <package>
```

添加到特定包:

```bash
pnpm --filter <package-name> add <dependency>
```

例如:

```bash
pnpm --filter web add lodash
pnpm --filter ui add -D typescript
```

### Turborepo 高级使用

过滤特定包执行命令：

```bash
# 只构建web应用
pnpm turbo build --filter=web

# 只运行shared包的lint
pnpm turbo lint --filter=shared
```

并行执行多个任务：

```bash
pnpm turbo build lint
```

### Storybook 开发

Storybook 用于 UI 组件开发和文档化。启动方式：

```bash
cd apps/web
pnpm storybook
```

默认运行在 http://localhost:6006
