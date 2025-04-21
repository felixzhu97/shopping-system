# AWS 部署指南

本文档提供了如何将购物系统后端部署到AWS香港区域(ap-east-1)的指南。提供了两种部署选项：Elastic Beanstalk和App Runner。

## 前提条件

1. 安装并配置AWS CLI
2. 创建AWS账户并设置IAM权限
3. 确保您的AWS CLI配置了正确的区域：`aws configure set region ap-east-1`

## 选项1：使用Elastic Beanstalk部署

Elastic Beanstalk提供了完整的环境管理，适合长期运行的应用。

### 安装EB CLI

```bash
pip install awsebcli
```

### 部署步骤

1. 初始化EB应用（如果是首次部署）：

```bash
cd /path/to/shopping-system
eb init
# 按照提示选择区域(ap-east-1)和应用名称
```

2. 创建环境（如果是首次部署）：

```bash
eb create shopping-api-prod --instance-type t3.micro --single
```

3. 设置环境变量：

```bash
eb setenv MONGODB_URI=your_mongodb_uri JWT_SECRET=your_secret CORS_ORIGINS=https://your-frontend-url.com
```

4. 部署应用：

```bash
eb deploy
```

5. 访问应用：

```bash
eb open
```

## 选项2：使用App Runner部署

App Runner是更轻量级的无服务器选项，适合简单API。

### 通过AWS控制台部署

1. 登录AWS控制台，进入App Runner服务
2. 点击"创建服务"
3. 选择源代码提供者（GitHub或AWS ECR）
4. 配置构建：
   - 选择`apprunner.yaml`作为配置文件
   - 替换环境变量中的MongoDB连接字符串
5. 配置服务：
   - 选择服务名称：`shopping-api`
   - 实例：1个实例，1 vCPU，2GB内存
   - 自动扩展：启用（最小1，最大10）
6. 点击"创建并部署"

### 通过AWS CLI部署

```bash
aws apprunner create-service \
  --service-name shopping-api \
  --source-configuration '{
    "CodeRepository": {
      "RepositoryUrl": "https://github.com/yourusername/shopping-system",
      "SourceCodeVersion": {
        "Type": "BRANCH",
        "Value": "main"
      },
      "CodeConfiguration": {
        "ConfigurationSource": "REPOSITORY",
        "ConfigurationValues": {
          "BuildCommand": "cd apps/api && npm install && npm run build",
          "StartCommand": "cd apps/api && npm start",
          "Port": "3001",
          "Runtime": "NODEJS_18"
        }
      }
    }
  }' \
  --instance-configuration '{
    "Cpu": "1 vCPU",
    "Memory": "2 GB"
  }' \
  --region ap-east-1
```

## 监控和日志

- **Elastic Beanstalk**: 通过`eb logs`或AWS控制台查看日志
- **App Runner**: 在AWS控制台的App Runner服务详情页查看日志

## 故障排除

1. **连接问题**:

   - 检查安全组设置是否允许入站流量
   - 确认MongoDB URI连接字符串正确

2. **部署失败**:

   - 检查应用日志
   - 确保所有环境变量都已正确设置
   - 验证Node.js版本兼容性

3. **性能问题**:
   - 考虑增加实例数量或实例类型
   - 检查MongoDB连接参数，确保使用连接池

## 成本考虑

- **Elastic Beanstalk**: 按EC2实例计费，t3.micro约$8-10/月
- **App Runner**: 按使用时间计费，基本配置约$25-30/月

## 注意事项

1. 确保在应用中处理SIGTERM信号以优雅关闭
2. 配置自动缩放以处理流量波动
3. 使用环境变量存储敏感配置
4. 定期备份MongoDB数据库
