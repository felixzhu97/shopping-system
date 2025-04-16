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
