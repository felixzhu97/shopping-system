# 购物系统数据库设计

本文档描述了购物系统的数据库设计，包括数据模型、字段定义、关系和索引策略。

## 数据库类型

系统使用 MongoDB 作为数据库，通过 Mongoose ODM（对象文档映射）进行交互。

## 数据模型

### 用户模型 (User)

管理系统中的用户账户信息。

| 字段名    | 类型     | 描述                         | 约束                                  |
| --------- | -------- | ---------------------------- | ------------------------------------- |
| \_id      | ObjectId | MongoDB 自动生成的唯一标识符 | 主键                                  |
| username  | String   | 用户名                       | 必填，唯一                            |
| email     | String   | 电子邮件地址                 | 必填，唯一                            |
| password  | String   | 加密后的密码                 | 必填，不返回给客户端                  |
| role      | String   | 用户角色                     | 枚举: ["user", "admin"]，默认: "user" |
| createdAt | Date     | 创建时间                     | 自动生成                              |
| updatedAt | Date     | 更新时间                     | 自动生成                              |

### 产品模型 (Product)

存储系统中所有商品的信息。

| 字段名      | 类型     | 描述                         | 约束          |
| ----------- | -------- | ---------------------------- | ------------- |
| \_id        | ObjectId | MongoDB 自动生成的唯一标识符 | 主键          |
| name        | String   | 产品名称                     | 必填          |
| description | String   | 产品描述                     | 必填          |
| price       | Number   | 产品价格                     | 必填          |
| image       | String   | 产品图片URL                  | 必填          |
| category    | String   | 产品类别                     | 必填          |
| stock       | Number   | 库存数量                     | 必填，默认: 0 |
| createdAt   | Date     | 创建时间                     | 自动生成      |
| updatedAt   | Date     | 更新时间                     | 自动生成      |

### 购物车模型 (Cart)

存储用户的购物车信息。

| 字段名          | 类型     | 描述                         | 约束                           |
| --------------- | -------- | ---------------------------- | ------------------------------ |
| \_id            | ObjectId | MongoDB 自动生成的唯一标识符 | 主键                           |
| userId          | ObjectId | 用户ID引用                   | 必填，唯一，外键关联 User 集合 |
| items           | Array    | 购物车商品列表               | 嵌套文档                       |
| items.productId | ObjectId | 产品ID引用                   | 必填，外键关联 Product 集合    |
| items.quantity  | Number   | 商品数量                     | 必填，最小值: 1                |
| createdAt       | Date     | 创建时间                     | 自动生成                       |
| updatedAt       | Date     | 更新时间                     | 自动生成                       |

### 订单模型 (Order)

记录用户的订单信息。

| 字段名          | 类型     | 描述                         | 约束                                                                                  |
| --------------- | -------- | ---------------------------- | ------------------------------------------------------------------------------------- |
| \_id            | ObjectId | MongoDB 自动生成的唯一标识符 | 主键                                                                                  |
| userId          | ObjectId | 用户ID引用                   | 必填，外键关联 User 集合                                                              |
| items           | Array    | 订单商品列表                 | 嵌套文档                                                                              |
| items.productId | ObjectId | 产品ID引用                   | 必填，外键关联 Product 集合                                                           |
| items.quantity  | Number   | 商品数量                     | 必填，最小值: 1                                                                       |
| totalAmount     | Number   | 订单总金额                   | 必填                                                                                  |
| status          | String   | 订单状态                     | 枚举: ["pending", "processing", "shipped", "delivered", "cancelled"]，默认: "pending" |
| createdAt       | Date     | 创建时间                     | 自动生成                                                                              |
| updatedAt       | Date     | 更新时间                     | 自动生成                                                                              |

## 数据关系

系统中存在以下数据关系：

1. **用户-购物车关系**：一对一关系

   - 一个用户只能拥有一个购物车
   - 通过 Cart 集合中的 userId 字段关联到 User 集合

2. **用户-订单关系**：一对多关系

   - 一个用户可以有多个订单
   - 通过 Order 集合中的 userId 字段关联到 User 集合

3. **购物车-产品关系**：多对多关系

   - 购物车中可以包含多个产品
   - 一个产品可以存在于多个购物车中
   - 通过 Cart.items.productId 字段关联到 Product 集合

4. **订单-产品关系**：多对多关系
   - 订单中可以包含多个产品
   - 一个产品可以存在于多个订单中
   - 通过 Order.items.productId 字段关联到 Product 集合

## 索引策略

为提高查询性能，推荐在以下字段上创建索引：

1. **User 集合**：

   - username（唯一索引）
   - email（唯一索引）

2. **Product 集合**：

   - name（提高按名称搜索的性能）
   - category（提高按类别筛选的性能）
   - price（提高价格排序和筛选的性能）

3. **Cart 集合**：

   - userId（唯一索引，提高购物车查询性能）

4. **Order 集合**：
   - userId（提高用户订单查询性能）
   - status（提高按状态筛选订单的性能）
   - createdAt（提高按时间排序的性能）

## 数据验证和约束

系统使用 Mongoose 内置的验证机制确保数据完整性：

1. 必填字段验证：通过 `required: true` 配置
2. 字段类型验证：确保字段类型符合定义
3. 枚举类型验证：限制特定字段的值范围
4. 数量最小值验证：例如购物车商品数量必须 >= 1

## 数据转换

通过 Mongoose 的 toJSON 选项进行数据转换：

1. 将 MongoDB 的 \_id 转换为客户端友好的 id 字段
2. 移除敏感字段（如用户密码）
3. 忽略版本控制字段 \_\_v
