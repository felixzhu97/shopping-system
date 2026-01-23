# DevOps 文档

本目录包含购物系统项目的 DevOps 相关 PlantUML 图表文档。

## 图表说明

### 1. CI/CD 流水线图 (`cicd-pipeline.puml`)

展示从代码提交到部署的完整 CI/CD 流程，包括：
- 代码检查和构建阶段
- 自动化测试阶段
- 代码审查流程
- 多环境部署流程
- 部署后验证和回滚机制

### 2. 部署架构图 (`deployment-architecture.puml`)

展示系统的部署架构，包括：
- 开发环境：本地开发服务器和本地数据库
- 测试环境：Vercel 部署和 MongoDB Atlas 测试集群
- 生产环境：Vercel 前端、Vercel Serverless Functions / AWS Lambda 后端、MongoDB Atlas 生产集群
- 监控和日志系统

### 3. 环境管理图 (`environment-management.puml`)

展示环境配置和管理流程，包括：
- 开发、测试、生产环境的配置
- 环境变量管理流程
- 环境变量在不同平台（本地、Vercel、AWS Lambda、GitHub Secrets）的流转
- 各环境数据库连接配置

### 4. 基础设施架构图 (`infrastructure-diagram.puml`)

展示完整的基础设施架构，包括：
- 用户访问层和 CDN 边缘网络
- 前端应用层（Vercel Next.js 应用）
- 后端服务层（Vercel Serverless Functions 和 AWS Lambda）
- 数据库层（MongoDB Atlas 集群）
- 监控和日志系统（CloudWatch、Vercel Analytics、MongoDB Monitoring）
- CI/CD 工具链（GitHub Actions、Turborepo）

### 5. 发布流程图 (`release-process.puml`)

展示从功能开发到生产发布的完整流程，包括：
- 功能分支开发流程
- 代码审查和 CI 检查
- 测试环境验证
- 发布准备（版本号、CHANGELOG、Tag）
- 生产环境部署
- 回滚流程

### 6. DevOps 概览图 (`devops-overview.puml`)

综合展示 DevOps 工具链和流程，包括：
- 开发阶段：IDE、Git、GitHub
- CI/CD 阶段：GitHub Actions、Turborepo、自动化测试和部署
- 部署阶段：Vercel、AWS Lambda、MongoDB Atlas
- 监控和运维：监控、日志、告警
- 安全措施：依赖扫描、代码扫描、密钥管理

## 如何使用

这些 PlantUML 文件可以使用以下工具查看和编辑：

1. **在线查看**：
   - [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
   - 将文件内容复制到在线编辑器中查看

2. **VS Code 插件**：
   - 安装 "PlantUML" 插件
   - 在 VS Code 中直接预览和编辑

3. **本地工具**：
   - 安装 PlantUML Java 工具
   - 使用命令行生成图片：
     ```bash
     java -jar plantuml.jar docs/architecture/devops/*.puml
     ```

## 更新说明

当 DevOps 流程或架构发生变化时，请及时更新相应的图表文档，确保文档与实际系统保持一致。

## 相关文档

- [部署指南](../development/deployment-guide.md)
- [环境配置](../development/ENVIRONMENT.md)
- [系统架构](../architecture/README.md)

