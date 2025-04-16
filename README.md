# 购物系统 Monorepo

基于 Turborepo 的购物系统 monorepo 项目。

## 项目结构

```
shopping-system/
├── apps/
│   └── web/           # Next.js 前端应用
├── packages/
│   ├── ui/            # UI组件库
│   └── shared/        # 共享工具和类型
```

## 使用技术

- [Turborepo](https://turbo.build/repo) - Monorepo 构建系统
- [Next.js](https://nextjs.org/) - React 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型系统
- [PNPM](https://pnpm.io/) - 包管理器

## 配置说明

### Turborepo 配置

项目使用 Turborepo 进行构建管理，主要配置在 `turbo.json` 文件中：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
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
    }
  }
}
```

配置说明：

- `globalDependencies`: 全局依赖文件，环境变量文件变化会触发所有任务重新运行
- `pipeline.build`: 构建命令，依赖于所有上游包的构建完成
- `pipeline.dev`: 开发命令，禁用缓存并设为持久运行
- `pipeline.clean`: 清理命令，禁用缓存
- `pipeline.start`: 启动命令，依赖于构建完成

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
pnpm dev
```

### 构建项目

```bash
pnpm build
```

### 启动应用

```bash
pnpm start
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
