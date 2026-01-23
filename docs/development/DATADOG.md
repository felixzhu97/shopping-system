# Datadog 集成指南

本文档说明如何在项目中使用 Datadog 进行应用性能监控（APM）、日志管理和真实用户监控（RUM）。

## 概述

项目已集成 Datadog 的以下功能：

1. **APM (Application Performance Monitoring)**: 用于后端 API 的性能监控
2. **Logs**: 日志收集和关联
3. **RUM (Real User Monitoring)**: 用于前端 Web 应用的用户监控

## 配置步骤

### 1. 获取 Datadog API 密钥

1. 登录 [Datadog](https://app.datadoghq.com/)
2. 进入 **Organization Settings** > **API Keys**
3. 创建新的 API 密钥或使用现有密钥

### 2. 获取 Datadog RUM 凭证

1. 在 Datadog 控制台进入 **RUM & Session Replay**
2. 创建新的应用程序或选择现有应用程序
3. 获取 **Application ID** 和 **Client Token**

### 3. 配置环境变量

#### 后端 API (apps/api)

在 `apps/api/.env` 文件中添加：

```env
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

#### 前端 Web (apps/web)

在 `apps/web/.env.local` 文件中添加：

```env
# Datadog RUM (Real User Monitoring)
NEXT_PUBLIC_DD_RUM_APPLICATION_ID=your-datadog-rum-application-id
NEXT_PUBLIC_DD_RUM_CLIENT_TOKEN=your-datadog-rum-client-token
NEXT_PUBLIC_DD_SITE=datadoghq.com
NEXT_PUBLIC_DD_SERVICE=shopping-web
NEXT_PUBLIC_DD_ENV=development
NEXT_PUBLIC_DD_VERSION=1.0.0
```

### 4. AWS Lambda 配置

对于部署在 AWS Lambda 上的 API，需要：

1. 在 `serverless.yml` 中已配置 Datadog Lambda Layer
2. 确保 Lambda 函数具有正确的环境变量
3. Datadog Lambda Layer ARN 会根据区域和 Node.js 版本自动选择

**注意**: Lambda Layer 版本号 (`DD_LAYER_VERSION`) 需要根据 Datadog 文档更新。查看 [Datadog Lambda Layer 版本](https://docs.datadoghq.com/serverless/libraries_integrations/lambda_layers/) 获取最新版本。

## 功能说明

### 后端 APM

- **自动追踪**: Express 路由、HTTP 请求、数据库查询等自动追踪
- **日志关联**: 日志自动关联到对应的追踪
- **性能指标**: 自动收集响应时间、吞吐量等指标
- **错误追踪**: 自动捕获和报告错误

### 前端 RUM

- **会话重放**: 10% 的会话会启用会话重放（可配置）
- **性能监控**: 页面加载时间、资源加载时间等
- **用户交互追踪**: 点击、表单提交等用户交互
- **错误追踪**: JavaScript 错误自动捕获和报告
- **隐私保护**: 默认屏蔽用户输入内容

## 使用建议

### 开发环境

- 可以禁用 Datadog 或使用较低的采样率以节省成本
- 设置 `DD_ENV=development` 以便区分环境

### 生产环境

- 确保所有必要的环境变量都已配置
- 监控 Datadog 仪表板以跟踪应用性能
- 设置适当的告警规则

### 成本优化

- **RUM 采样率**: 调整 `sessionSampleRate` 和 `sessionReplaySampleRate` 以控制数据量
- **APM 采样**: 在 Datadog 控制台配置采样率
- **日志保留**: 配置适当的日志保留策略

## 查看数据

### APM 追踪

1. 登录 Datadog 控制台
2. 进入 **APM** > **Traces**
3. 查看服务性能、追踪详情等

### RUM 数据

1. 登录 Datadog 控制台
2. 进入 **RUM** > **Sessions**
3. 查看用户会话、性能指标、错误等

### 日志

1. 登录 Datadog 控制台
2. 进入 **Logs**
3. 查看应用日志，支持与 APM 追踪关联

## 故障排除

### APM 数据未显示

1. 检查环境变量是否正确配置
2. 确认 `dd-trace` 在应用启动前已初始化
3. 检查网络连接和防火墙设置
4. 查看应用日志中的 Datadog 错误信息

### RUM 数据未显示

1. 检查浏览器控制台是否有错误
2. 确认环境变量以 `NEXT_PUBLIC_` 开头
3. 检查 Datadog RUM 初始化是否成功
4. 确认网络请求未被阻止

### Lambda 函数未发送数据

1. 检查 Lambda Layer 是否正确配置
2. 确认环境变量已设置
3. 检查 Lambda 函数的 IAM 权限
4. 查看 CloudWatch 日志中的错误信息

## 参考资料

- [Datadog APM 文档](https://docs.datadoghq.com/tracing/)
- [Datadog RUM 文档](https://docs.datadoghq.com/real_user_monitoring/)
- [Datadog Lambda 集成](https://docs.datadoghq.com/serverless/libraries_integrations/)
- [Datadog Node.js 追踪器](https://docs.datadoghq.com/tracing/setup_overview/setup/nodejs/)
