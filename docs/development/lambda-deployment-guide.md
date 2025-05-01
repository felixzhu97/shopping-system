# AWS Lambda部署指南

本文档提供了如何将购物系统后端API部署到AWS Lambda的详细指南。Lambda是AWS的无服务器计算服务，可以根据请求自动扩展，并且具有慷慨的免费额度。

## 免费额度

AWS Lambda免费套餐（每月）：

- 100万次请求
- 400,000 GB秒的计算时间
- 这些免费额度在香港区域(ap-east-1)同样适用

## 前提条件

1. AWS账户及权限

   - IAM用户需要有Lambda、API Gateway、IAM、CloudWatch日志和S3的权限
   - 建议创建专用部署角色

2. 安装Serverless Framework

   ```bash
   npm install -g serverless
   ```

3. 配置AWS凭证
   ```bash
   aws configure
   # 输入Access Key、Secret Key和区域(ap-east-1)
   ```

## 手动部署步骤

1. 在项目根目录打开终端

2. 进入API目录

   ```bash
   cd apps/api
   ```

3. 安装依赖

   ```bash
   npm install
   ```

4. 部署到Lambda

   ```bash
   # 设置MongoDB连接字符串环境变量
   export MONGODB_URI=your_mongodb_uri

   # 部署
   npm run deploy:lambda
   ```

5. 部署完成后，终端会显示API的URL，例如：

   ```
   endpoints:
     ANY - https://abc123def.execute-api.ap-east-1.amazonaws.com/dev/{proxy+}
   ```

6. 测试API
   ```bash
   curl https://abc123def.execute-api.ap-east-1.amazonaws.com/dev/health
   ```

## 自动部署（GitHub Actions）

我们已经配置了GitHub Actions工作流程，可以自动部署到Lambda：

1. 在GitHub仓库设置中添加以下秘密：

   - `AWS_ACCESS_KEY_ID`: AWS访问密钥ID
   - `AWS_SECRET_ACCESS_KEY`: AWS秘密访问密钥
   - `MONGODB_URI`: MongoDB连接字符串

2. 向主分支推送代码时，会自动触发部署

   ```bash
   git push origin main
   ```

3. 也可以在GitHub仓库页面手动触发部署：
   - 进入"Actions"选项卡
   - 选择"部署到AWS Lambda"工作流
   - 点击"Run workflow"

## 监控与日志

1. 在AWS Lambda控制台查看函数详情
2. 在CloudWatch日志组查看应用日志
   - 日志组名称通常为`/aws/lambda/shopping-api-dev-api`

## 自定义域名（可选）

1. 在API Gateway控制台创建自定义域名
2. 配置DNS CNAME记录指向API Gateway域名
3. 更新`serverless.yml`文件添加域名配置

## 常见问题

1. **超时问题**：

   - Lambda默认超时为30秒，如需更长时间，可调整`serverless.yml`中的`timeout`值
   - 注意MongoDB连接可能需要几秒钟

2. **冷启动延迟**：

   - 第一次请求或长时间无请求后，可能有1-2秒的延迟
   - 可使用预定事件保持函数温暖

3. **内存限制**：

   - 默认设置为512MB，可以在`serverless.yml`中调整`memorySize`
   - 增加内存也会增加CPU能力

4. **删除部署**：
   - 运行`npm run remove:lambda`可删除所有已部署的资源

## 安全最佳实践

1. 确保MongoDB连接字符串等敏感信息通过环境变量传递
2. 定期轮换AWS访问密钥
3. 为Lambda函数配置最小权限原则的IAM角色

## 成本估算

1. **免费额度内**：

   - 每月约100万次请求完全免费
   - 对于中小型应用通常足够

2. **超出免费额度**：
   - 每100万次请求约$0.20
   - 每GB秒计算时间约$0.0000166667

## 对比其他部署选项

1. **对比Elastic Beanstalk**：

   - Lambda无需管理服务器
   - 按使用付费，空闲时不产生费用
   - 自动扩缩容

2. **对比App Runner**：
   - Lambda更经济，有更慷慨的免费额度
   - App Runner更适合需要长时间运行的应用
