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
```

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

### 后端环境变量

- `PORT`: API 服务器端口
- `MONGODB_URI`: MongoDB 数据库连接字符串
- `JWT_SECRET`: JWT 令牌签名密钥
- `JWT_EXPIRES_IN`: JWT 令牌过期时间
- `CORS_ORIGIN`: 允许的跨域来源

### Turborepo 环境变量

- `TURBO_TOKEN`: Vercel 访问令牌，用于远程缓存
- `TURBO_TEAM`: Vercel 团队 ID
