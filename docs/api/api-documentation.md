# 购物系统API文档

## API概述

购物系统API基于RESTful架构设计，提供了完整的商品管理、用户认证、购物车操作和订单处理功能。API使用JSON格式进行数据交换，采用JWT进行认证。

### 基本信息

- **基础URL**: `https://api.shopping-system.com/v1` 或本地开发环境 `http://localhost:3001/v1`
- **内容类型**: `application/json`
- **认证方式**: Bearer Token (JWT)
- **API版本**: v1

## 认证与授权

### 认证方式

API使用JWT (JSON Web Token) 进行认证。客户端需要在HTTP请求头中包含有效的访问令牌：

```
Authorization: Bearer <access_token>
```

### 获取访问令牌

#### 用户登录

```
POST /users/login
```

请求体:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

响应:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "username": "johndoe",
      "email": "user@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

#### 用户注册

```
POST /users/register
```

请求体:

```json
{
  "username": "johndoe",
  "email": "user@example.com",
  "password": "password123"
}
```

响应:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "username": "johndoe",
      "email": "user@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

## 商品API

### 获取所有商品

```
GET /products
```

查询参数:

- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `category`: 按类别筛选
- `minPrice`: 最低价格
- `maxPrice`: 最高价格
- `sort`: 排序字段 (name, price, createdAt)
- `order`: 排序方向 (asc, desc)

响应:

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "60d21b4667d0d8992e610c85",
        "name": "智能手机",
        "description": "最新款智能手机，拥有高性能处理器和出色的摄像头。",
        "price": 2999,
        "image": "https://example.com/images/smartphone.jpg",
        "category": "电子产品",
        "stock": 50,
        "createdAt": "2023-06-18T14:30:00Z",
        "updatedAt": "2023-06-18T14:30:00Z"
      }
      // 更多商品...
    ],
    "pagination": {
      "totalItems": 100,
      "totalPages": 10,
      "currentPage": 1,
      "pageSize": 10
    }
  }
}
```

### 获取单个商品

```
GET /products/:id
```

路径参数:

- `id`: 商品ID

响应:

```json
{
  "success": true,
  "data": {
    "product": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "智能手机",
      "description": "最新款智能手机，拥有高性能处理器和出色的摄像头。",
      "price": 2999,
      "image": "https://example.com/images/smartphone.jpg",
      "category": "电子产品",
      "stock": 50,
      "createdAt": "2023-06-18T14:30:00Z",
      "updatedAt": "2023-06-18T14:30:00Z"
    }
  }
}
```

### 创建商品

```
POST /products
```

权限:

- 需要管理员权限

请求体:

```json
{
  "name": "智能手表",
  "description": "功能强大的智能手表，支持心率监测和运动追踪。",
  "price": 999,
  "image": "https://example.com/images/smartwatch.jpg",
  "category": "电子产品",
  "stock": 30
}
```

响应:

```json
{
  "success": true,
  "data": {
    "product": {
      "id": "60d21b4667d0d8992e610c86",
      "name": "智能手表",
      "description": "功能强大的智能手表，支持心率监测和运动追踪。",
      "price": 999,
      "image": "https://example.com/images/smartwatch.jpg",
      "category": "电子产品",
      "stock": 30,
      "createdAt": "2023-06-19T10:15:00Z",
      "updatedAt": "2023-06-19T10:15:00Z"
    }
  }
}
```

### 更新商品

```
PUT /products/:id
```

权限:

- 需要管理员权限

路径参数:

- `id`: 商品ID

请求体:

```json
{
  "name": "高级智能手表",
  "description": "更新后的智能手表描述。",
  "price": 1099,
  "stock": 25
}
```

响应:

```json
{
  "success": true,
  "data": {
    "product": {
      "id": "60d21b4667d0d8992e610c86",
      "name": "高级智能手表",
      "description": "更新后的智能手表描述。",
      "price": 1099,
      "image": "https://example.com/images/smartwatch.jpg",
      "category": "电子产品",
      "stock": 25,
      "createdAt": "2023-06-19T10:15:00Z",
      "updatedAt": "2023-06-19T11:30:00Z"
    }
  }
}
```

### 删除商品

```
DELETE /products/:id
```

权限:

- 需要管理员权限

路径参数:

- `id`: 商品ID

响应:

```json
{
  "success": true,
  "data": {
    "message": "商品已成功删除"
  }
}
```

## 购物车API

### 获取用户购物车

```
GET /cart
```

权限:

- 需要用户身份验证

响应:

```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "60d21b4667d0d8992e610c87",
      "userId": "60d21b4667d0d8992e610c85",
      "items": [
        {
          "productId": "60d21b4667d0d8992e610c85",
          "name": "智能手机",
          "image": "https://example.com/images/smartphone.jpg",
          "price": 2999,
          "quantity": 1,
          "subtotal": 2999
        }
      ],
      "totalItems": 1,
      "totalAmount": 2999,
      "createdAt": "2023-06-20T09:00:00Z",
      "updatedAt": "2023-06-20T09:00:00Z"
    }
  }
}
```

### 添加商品到购物车

```
POST /cart/items
```

权限:

- 需要用户身份验证

请求体:

```json
{
  "productId": "60d21b4667d0d8992e610c86",
  "quantity": 2
}
```

响应:

```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "60d21b4667d0d8992e610c87",
      "userId": "60d21b4667d0d8992e610c85",
      "items": [
        {
          "productId": "60d21b4667d0d8992e610c85",
          "name": "智能手机",
          "image": "https://example.com/images/smartphone.jpg",
          "price": 2999,
          "quantity": 1,
          "subtotal": 2999
        },
        {
          "productId": "60d21b4667d0d8992e610c86",
          "name": "智能手表",
          "image": "https://example.com/images/smartwatch.jpg",
          "price": 999,
          "quantity": 2,
          "subtotal": 1998
        }
      ],
      "totalItems": 3,
      "totalAmount": 4997,
      "createdAt": "2023-06-20T09:00:00Z",
      "updatedAt": "2023-06-20T09:15:00Z"
    }
  }
}
```

### 更新购物车商品数量

```
PUT /cart/items/:productId
```

权限:

- 需要用户身份验证

路径参数:

- `productId`: 商品ID

请求体:

```json
{
  "quantity": 3
}
```

响应:

```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "60d21b4667d0d8992e610c87",
      "userId": "60d21b4667d0d8992e610c85",
      "items": [
        {
          "productId": "60d21b4667d0d8992e610c85",
          "name": "智能手机",
          "image": "https://example.com/images/smartphone.jpg",
          "price": 2999,
          "quantity": 1,
          "subtotal": 2999
        },
        {
          "productId": "60d21b4667d0d8992e610c86",
          "name": "智能手表",
          "image": "https://example.com/images/smartwatch.jpg",
          "price": 999,
          "quantity": 3,
          "subtotal": 2997
        }
      ],
      "totalItems": 4,
      "totalAmount": 5996,
      "createdAt": "2023-06-20T09:00:00Z",
      "updatedAt": "2023-06-20T09:30:00Z"
    }
  }
}
```

### 从购物车移除商品

```
DELETE /cart/items/:productId
```

权限:

- 需要用户身份验证

路径参数:

- `productId`: 商品ID

响应:

```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "60d21b4667d0d8992e610c87",
      "userId": "60d21b4667d0d8992e610c85",
      "items": [
        {
          "productId": "60d21b4667d0d8992e610c85",
          "name": "智能手机",
          "image": "https://example.com/images/smartphone.jpg",
          "price": 2999,
          "quantity": 1,
          "subtotal": 2999
        }
      ],
      "totalItems": 1,
      "totalAmount": 2999,
      "createdAt": "2023-06-20T09:00:00Z",
      "updatedAt": "2023-06-20T09:45:00Z"
    }
  }
}
```

### 清空购物车

```
DELETE /cart
```

权限:

- 需要用户身份验证

响应:

```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "60d21b4667d0d8992e610c87",
      "userId": "60d21b4667d0d8992e610c85",
      "items": [],
      "totalItems": 0,
      "totalAmount": 0,
      "createdAt": "2023-06-20T09:00:00Z",
      "updatedAt": "2023-06-20T10:00:00Z"
    }
  }
}
```

## 订单API

### 创建订单

```
POST /orders
```

权限:

- 需要用户身份验证

请求体:

```json
{
  "shippingAddress": {
    "fullName": "张三",
    "phone": "13812345678",
    "address": "北京市海淀区中关村大街1号",
    "city": "北京市",
    "postalCode": "100080"
  },
  "paymentMethod": "alipay"
}
```

响应:

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "60d21b4667d0d8992e610c88",
      "userId": "60d21b4667d0d8992e610c85",
      "items": [
        {
          "productId": "60d21b4667d0d8992e610c85",
          "name": "智能手机",
          "image": "https://example.com/images/smartphone.jpg",
          "price": 2999,
          "quantity": 1,
          "subtotal": 2999
        }
      ],
      "totalAmount": 2999,
      "shippingAddress": {
        "fullName": "张三",
        "phone": "13812345678",
        "address": "北京市海淀区中关村大街1号",
        "city": "北京市",
        "postalCode": "100080"
      },
      "paymentMethod": "alipay",
      "status": "pending",
      "createdAt": "2023-06-21T11:00:00Z",
      "updatedAt": "2023-06-21T11:00:00Z"
    }
  }
}
```

### 获取所有订单

```
GET /orders
```

权限:

- 用户: 只能获取自己的订单
- 管理员: 可以获取所有订单

查询参数:

- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `status`: 按状态筛选
- `sort`: 排序字段 (createdAt, totalAmount)
- `order`: 排序方向 (asc, desc)

响应:

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "60d21b4667d0d8992e610c88",
        "userId": "60d21b4667d0d8992e610c85",
        "items": [
          {
            "productId": "60d21b4667d0d8992e610c85",
            "name": "智能手机",
            "image": "https://example.com/images/smartphone.jpg",
            "price": 2999,
            "quantity": 1,
            "subtotal": 2999
          }
        ],
        "totalAmount": 2999,
        "status": "processing",
        "createdAt": "2023-06-21T11:00:00Z",
        "updatedAt": "2023-06-21T11:30:00Z"
      }
      // 更多订单...
    ],
    "pagination": {
      "totalItems": 5,
      "totalPages": 1,
      "currentPage": 1,
      "pageSize": 10
    }
  }
}
```

### 获取单个订单

```
GET /orders/:id
```

权限:

- 用户: 只能获取自己的订单
- 管理员: 可以获取任何订单

路径参数:

- `id`: 订单ID

响应:

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "60d21b4667d0d8992e610c88",
      "userId": "60d21b4667d0d8992e610c85",
      "user": {
        "id": "60d21b4667d0d8992e610c85",
        "username": "johndoe",
        "email": "user@example.com"
      },
      "items": [
        {
          "productId": "60d21b4667d0d8992e610c85",
          "name": "智能手机",
          "image": "https://example.com/images/smartphone.jpg",
          "price": 2999,
          "quantity": 1,
          "subtotal": 2999
        }
      ],
      "totalAmount": 2999,
      "shippingAddress": {
        "fullName": "张三",
        "phone": "13812345678",
        "address": "北京市海淀区中关村大街1号",
        "city": "北京市",
        "postalCode": "100080"
      },
      "paymentMethod": "alipay",
      "status": "processing",
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2023-06-21T11:00:00Z"
        },
        {
          "status": "processing",
          "timestamp": "2023-06-21T11:30:00Z"
        }
      ],
      "createdAt": "2023-06-21T11:00:00Z",
      "updatedAt": "2023-06-21T11:30:00Z"
    }
  }
}
```

### 更新订单状态

```
PATCH /orders/:id/status
```

权限:

- 需要管理员权限

路径参数:

- `id`: 订单ID

请求体:

```json
{
  "status": "shipped"
}
```

响应:

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "60d21b4667d0d8992e610c88",
      "status": "shipped",
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2023-06-21T11:00:00Z"
        },
        {
          "status": "processing",
          "timestamp": "2023-06-21T11:30:00Z"
        },
        {
          "status": "shipped",
          "timestamp": "2023-06-22T09:15:00Z"
        }
      ],
      "updatedAt": "2023-06-22T09:15:00Z"
    }
  }
}
```

### 取消订单

```
POST /orders/:id/cancel
```

权限:

- 用户: 只能取消自己的未发货订单
- 管理员: 可以取消任何未发货订单

路径参数:

- `id`: 订单ID

响应:

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "60d21b4667d0d8992e610c88",
      "status": "cancelled",
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2023-06-21T11:00:00Z"
        },
        {
          "status": "processing",
          "timestamp": "2023-06-21T11:30:00Z"
        },
        {
          "status": "cancelled",
          "timestamp": "2023-06-21T14:00:00Z"
        }
      ],
      "updatedAt": "2023-06-21T14:00:00Z"
    }
  }
}
```

## 用户API

### 获取当前用户信息

```
GET /users/me
```

权限:

- 需要用户身份验证

响应:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "username": "johndoe",
      "email": "user@example.com",
      "role": "user",
      "createdAt": "2023-06-15T10:00:00Z",
      "updatedAt": "2023-06-15T10:00:00Z"
    }
  }
}
```

### 更新用户信息

```
PUT /users/me
```

权限:

- 需要用户身份验证

请求体:

```json
{
  "username": "johndoe_updated"
}
```

响应:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "username": "johndoe_updated",
      "email": "user@example.com",
      "role": "user",
      "createdAt": "2023-06-15T10:00:00Z",
      "updatedAt": "2023-06-23T15:30:00Z"
    }
  }
}
```

### 更改密码

```
PUT /users/me/password
```

权限:

- 需要用户身份验证

请求体:

```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}
```

响应:

```json
{
  "success": true,
  "data": {
    "message": "密码已成功更新"
  }
}
```

## 支付API

### 保存支付信息

保存用户的支付信息。

**请求**

```http
POST /api/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "paymentMethod": "credit-card",
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439011",
      "paymentMethod": "credit-card",
      "createdAt": "2024-03-20T10:00:00.000Z",
      "updatedAt": "2024-03-20T10:00:00.000Z"
    }
  }
}
```

### 获取支付信息

获取指定用户的支付信息，同时返回关联的用户信息和地址信息。

**请求**

```http
GET /api/payments/:userId
Authorization: Bearer <token>
```

**响应**

```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439011",
      "paymentMethod": "credit-card",
      "createdAt": "2024-03-20T10:00:00.000Z",
      "updatedAt": "2024-03-20T10:00:00.000Z"
    },
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "张",
      "lastName": "三",
      "email": "zhangsan@example.com",
      "phone": "13800138000"
    },
    "address": {
      "id": "507f1f77bcf86cd799439012",
      "address": "北京市朝阳区",
      "city": "北京",
      "province": "北京",
      "postalCode": "100000"
    }
  }
}
```

### 错误响应

**400 Bad Request**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "缺少必要字段",
    "status": 400,
    "details": {
      "field": "paymentMethod"
    }
  }
}
```

**401 Unauthorized**

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "未授权",
    "status": 401
  }
}
```

**404 Not Found**

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "未找到支付信息",
    "status": 404,
    "details": {
      "resource": "Payment",
      "userId": "507f1f77bcf86cd799439011"
    }
  }
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "保存支付信息失败",
    "status": 500
  }
}
```

## 错误处理

所有API错误响应都使用统一的格式:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "找不到请求的资源",
    "status": 404,
    "details": {
      "resource": "Product",
      "id": "60d21b4667d0d8992e610c89"
    }
  }
}
```

### 常见错误代码

| 代码                  | HTTP状态码 | 描述                                              |
| --------------------- | ---------- | ------------------------------------------------- |
| AUTHENTICATION_FAILED | 401        | 认证失败，无效的凭据                              |
| AUTHORIZATION_FAILED  | 403        | 授权失败，权限不足                                |
| RESOURCE_NOT_FOUND    | 404        | 找不到请求的资源                                  |
| VALIDATION_ERROR      | 400        | 请求数据验证失败                                  |
| INTERNAL_SERVER_ERROR | 500        | 服务器内部错误                                    |
| RESOURCE_EXISTS       | 409        | 资源已存在 (例如用户注册时使用了已存在的电子邮件) |
