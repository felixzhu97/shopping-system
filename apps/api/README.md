# 购物系统 API

购物系统的后端 API 服务，提供产品、用户、购物车和订单管理功能。

## 技术栈

- Express.js - Web 框架
- MongoDB/Mongoose - 数据库和 ORM
- TypeScript - 类型系统

## 安装与运行

### 安装依赖

```bash
pnpm install
```

### 开发环境运行

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务

```bash
pnpm start
```

## 环境变量

复制 `.env.example` 文件为 `.env`，并根据需要修改：

```bash
cp .env.example .env
```

### 环境变量说明

- `PORT` - API 服务端口
- `MONGODB_URI` - MongoDB 连接字符串
- `JWT_SECRET` - JWT 密钥（未来用于身份认证）

## API 接口

### 产品管理

- `GET /api/products` - 获取所有产品
- `GET /api/products/:id` - 获取单个产品
- `POST /api/products` - 创建产品
- `PUT /api/products/:id` - 更新产品
- `DELETE /api/products/:id` - 删除产品

### 用户管理

- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/:id` - 获取用户信息
- `PUT /api/users/:id` - 更新用户信息

### 购物车管理

- `GET /api/cart/:userId` - 获取用户购物车
- `POST /api/cart/:userId` - 添加商品到购物车
- `PUT /api/cart/:userId/item/:productId` - 更新购物车商品数量
- `DELETE /api/cart/:userId/item/:productId` - 移除购物车商品
- `DELETE /api/cart/:userId` - 清空购物车

### 订单管理

- `POST /api/orders/:userId` - 创建订单
- `GET /api/orders/user/:userId` - 获取用户订单列表
- `GET /api/orders/:id` - 获取订单详情
- `PUT /api/orders/:id/status` - 更新订单状态

## 环境变量配置

在运行此API服务之前，请确保设置以下环境变量：

```
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/shopping-system

# 服务器配置
PORT=3001
NODE_ENV=development

# JWT配置
JWT_SECRET=your_jwt_secret

# CORS配置
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# 管理员配置
ADMIN_SECRET=your_admin_secret_here
```

**重要**: `ADMIN_SECRET` 用于产品的增删改操作，确保在生产环境中使用一个强密码。

## 管理员API使用说明

当进行产品的增加、修改或删除操作时，需要在请求头中添加 `admin-secret` 字段，其值必须与环境变量 `ADMIN_SECRET` 一致。

示例请求：

```
POST /api/products
Headers:
  Content-Type: application/json
  admin-secret: your_admin_secret_here

Body:
{
  "name": "产品名称",
  "price": 99.99,
  "description": "产品描述",
  ...
}
```

如果没有提供正确的 `admin-secret`，操作将被拒绝并返回 403 错误。
