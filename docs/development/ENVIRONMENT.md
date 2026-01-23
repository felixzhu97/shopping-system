# 环境变量配置指南

本文档说明项目所需的环境变量配置。

## 前端环境变量 (apps/web)

在 `apps/web` 目录下创建 `.env.local` 文件：

```env
# API配置
NEXT_PUBLIC_API_URL=http://localhost:3001

# 认证相关
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# 性能监控和分析
SPEED_INSIGHTS_ENABLED=true
VERCEL_ANALYTICS_ENABLED=true

# Datadog RUM (Real User Monitoring)
NEXT_PUBLIC_DD_RUM_APPLICATION_ID=your-datadog-rum-application-id
NEXT_PUBLIC_DD_RUM_CLIENT_TOKEN=your-datadog-rum-client-token
NEXT_PUBLIC_DD_SITE=datadoghq.com
NEXT_PUBLIC_DD_SERVICE=shopping-web
NEXT_PUBLIC_DD_ENV=development
NEXT_PUBLIC_DD_VERSION=1.0.0

# 其他配置
NODE_ENV=development
```

## 后端环境变量 (apps/api)

在 `apps/api` 目录下创建 `.env` 文件：

```env
# 服务器配置
PORT=3001
NODE_ENV=development

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/shopping-system

# JWT配置
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# 跨域配置
CORS_ORIGIN=http://localhost:3000

# Datadog APM and Logging
DD_SERVICE=shopping-api
DD_ENV=development
DD_VERSION=1.0.0
DD_API_KEY=your-datadog-api-key
DD_SITE=datadoghq.com
DD_LAYER_VERSION=119
DD_PROFILING_ENABLED=false
DD_APPSEC_ENABLED=false
```

## 移动应用环境变量 (apps/mobile)

在 `apps/mobile` 目录下创建 `.env` 文件：

```env
# API配置
EXPO_PUBLIC_API_URL=http://localhost:3001
```

**注意**：
- Expo SDK 49+ 使用 `EXPO_PUBLIC_` 前缀的环境变量
- 这些变量会在构建时注入，运行时通过 `process.env.EXPO_PUBLIC_*` 访问
- 支持 `.env`、`.env.local`、`.env.production` 等文件
- 开发环境默认使用 `http://localhost:3001`
- 生产环境需要设置对应的生产 API URL

## Turborepo 远程缓存配置

在项目根目录创建 `.env` 文件：

```env
# Turborepo配置
TURBO_TOKEN=your-vercel-token
TURBO_TEAM=your-team-id
```

## 开发注意事项

1. 不要将包含敏感信息的 `.env` 文件提交到版本控制系统
2. 在生产环境中使用更强的密钥
3. 确保在部署平台（如 Vercel）中正确配置所有必要的环境变量

## 环境变量说明

### 前端环境变量

- `NEXT_PUBLIC_API_URL`: 后端 API 的基础 URL
- `NEXTAUTH_URL`: NextAuth.js 认证服务的 URL
- `NEXTAUTH_SECRET`: NextAuth.js 用于加密会话的密钥
- `SPEED_INSIGHTS_ENABLED`: 是否启用 Vercel Speed Insights 性能监控（可选，默认为 false）
- `VERCEL_ANALYTICS_ENABLED`: 是否启用 Vercel Analytics 访问分析（可选，默认为 false）
- `NEXT_PUBLIC_DD_RUM_APPLICATION_ID`: Datadog RUM 应用 ID（可选）
- `NEXT_PUBLIC_DD_RUM_CLIENT_TOKEN`: Datadog RUM 客户端令牌（可选）
- `NEXT_PUBLIC_DD_SITE`: Datadog 站点（默认：datadoghq.com）
- `NEXT_PUBLIC_DD_SERVICE`: Datadog 服务名称（默认：shopping-web）
- `NEXT_PUBLIC_DD_ENV`: Datadog 环境名称（默认：development）
- `NEXT_PUBLIC_DD_VERSION`: Datadog 版本号（默认：1.0.0）

### 后端环境变量

- `PORT`: API 服务器端口
- `MONGODB_URI`: MongoDB 数据库连接字符串
- `JWT_SECRET`: JWT 令牌签名密钥
- `JWT_EXPIRES_IN`: JWT 令牌过期时间
- `CORS_ORIGIN`: 允许的跨域来源
- `DD_SERVICE`: Datadog 服务名称（默认：shopping-api）
- `DD_ENV`: Datadog 环境名称（默认：development）
- `DD_VERSION`: Datadog 版本号（默认：1.0.0）
- `DD_API_KEY`: Datadog API 密钥（用于 Lambda 函数）
- `DD_SITE`: Datadog 站点（默认：datadoghq.com）
- `DD_LAYER_VERSION`: Datadog Lambda Layer 版本号（默认：119）
- `DD_PROFILING_ENABLED`: 是否启用性能分析（默认：false）
- `DD_APPSEC_ENABLED`: 是否启用应用安全监控（默认：false）

### 移动应用环境变量

- `EXPO_PUBLIC_API_URL`: 后端 API 的基础 URL（开发环境默认：`http://localhost:3001`）

### Turborepo 环境变量

- `TURBO_TOKEN`: Vercel 访问令牌，用于远程缓存
- `TURBO_TEAM`: Vercel 团队 ID
