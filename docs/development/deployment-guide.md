# 购物系统部署手册

本文档提供了购物系统的详细部署步骤和配置说明，适用于开发、测试和生产环境。

## 部署架构

购物系统采用以下部署架构：

- 前端：Next.js应用，部署在Vercel平台
- 后端：Express.js API，部署在Vercel Serverless Functions
- 数据库：MongoDB，使用MongoDB Atlas云服务
- 静态资源：存储在Vercel Edge Network

## 环境要求

### 开发环境

- Node.js v18.0.0或更高版本
- PNPM v8.0.0或更高版本
- MongoDB v6.0或更高版本
- Git

### 生产环境

- Vercel账户（托管前端和API）
- MongoDB Atlas账户（云数据库服务）
- 域名（可选，用于自定义域名）

## 部署前准备

### 1. 克隆代码仓库

```bash
git clone https://github.com/your-username/shopping-system.git
cd shopping-system
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 设置环境变量

在项目根目录和每个应用目录创建`.env.local`文件，填入必要的环境变量。参考[环境变量配置指南](./ENVIRONMENT.md)。

核心环境变量包括：

```
# MongoDB连接字符串
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# JWT密钥
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=86400

# API基础URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Vercel部署URL（生产环境）
NEXT_PUBLIC_VERCEL_URL=https://your-app.vercel.app
```

## 本地开发部署

### 1. 启动开发服务器

```bash
# 启动所有服务（前端+后端）
pnpm dev

# 只启动前端
pnpm --filter web dev

# 只启动后端
pnpm --filter api dev
```

### 2. 构建应用

```bash
pnpm build
```

### 3. 运行生产构建

```bash
pnpm start
```

## Vercel部署流程

系统使用Vercel进行自动部署，每当代码推送到主分支时会触发部署。手动部署步骤如下：

### 1. 安装Vercel CLI

```bash
npm install -g vercel
```

### 2. 登录Vercel

```bash
vercel login
```

### 3. 配置项目

确保项目根目录包含`vercel.json`文件：

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "pnpm turbo run build --filter=web...",
  "outputDirectory": "apps/web/.next",
  "installCommand": "npm install -g pnpm@10.1.0 && pnpm install --no-frozen-lockfile",
  "regions": ["hnd1"]
}
```

### 4. 部署项目

```bash
# 部署到开发环境
vercel

# 部署到生产环境
vercel --prod
```

### 5. 环境变量配置

在Vercel控制台中设置必要的环境变量：

1. 登录Vercel控制台
2. 选择你的项目
3. 进入"Settings" > "Environment Variables"
4. 添加所有必要的环境变量
5. 保存并重新部署

## MongoDB Atlas配置

### 1. 创建MongoDB Atlas集群

1. 注册并登录[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建新项目
3. 构建新集群（建议选择免费层M0用于测试或较小的生产应用）
4. 选择云提供商和区域

### 2. 数据库访问设置

1. 在左侧导航栏点击"Database Access"
2. 点击"Add New Database User"
3. 创建用户名和密码
4. 选择适当的权限（建议"Read and Write to any database"）
5. 点击"Add User"

### 3. 网络访问设置

1. 在左侧导航栏点击"Network Access"
2. 点击"Add IP Address"
3. 对于开发环境，可以选择"Allow Access from Anywhere"
4. 对于生产环境，应该限制只允许来自Vercel服务器的访问

### 4. 获取连接字符串

1. 在集群概览页面，点击"Connect"
2. 选择"Connect your application"
3. 复制提供的连接字符串
4. 替换连接字符串中的`<password>`为你创建的数据库用户密码
5. 将连接字符串添加到环境变量`MONGODB_URI`中

## CI/CD配置

系统使用GitHub Actions进行CI/CD自动化。配置位于`.github/workflows/ci.yml`。

### 主要工作流程包括：

1. 代码提交和推送到GitHub
2. GitHub Actions自动运行测试和构建
3. 测试和构建通过后，自动部署到Vercel
4. Vercel完成部署后，发送部署通知

### Turborepo远程缓存配置

为优化CI/CD性能，应配置Turborepo远程缓存：

1. 在Vercel账户设置中获取Turborepo令牌
2. 在GitHub仓库设置中添加以下密钥：
   - `TURBO_TOKEN`: Turborepo令牌
   - `TURBO_TEAM`: Vercel团队ID

## 自定义域名配置

要为应用配置自定义域名：

1. 登录Vercel控制台
2. 选择你的项目
3. 进入"Settings" > "Domains"
4. 添加你的域名
5. 按照Vercel提供的说明配置DNS记录
6. 等待DNS传播和SSL证书颁发

## 监控和日志

### 系统监控

1. 使用Vercel Analytics监控前端性能
2. 使用MongoDB Atlas监控数据库性能
3. 配置针对关键指标的警报

### 日志管理

1. 后端API使用Winston记录日志
2. 在生产环境中，日志存储在Vercel日志服务
3. 可以使用Vercel CLI查看实时日志：

```bash
vercel logs your-project-name
```

## 故障排除

### 部署失败

1. 检查构建日志查找错误
2. 验证所有必需的环境变量
3. 确保项目依赖正确安装

### 数据库连接问题

1. 检查MongoDB连接字符串是否正确
2. 验证数据库用户凭据
