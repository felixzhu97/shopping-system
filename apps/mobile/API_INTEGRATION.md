# API 集成说明

## 概述

Flutter 移动应用已成功集成后端 API，实现了产品数据的获取和展示功能。

## 已实现的功能

### 1. 数据模型 (lib/models/product.dart)

- 产品数据模型，支持 JSON 序列化
- 包含产品的基本信息：ID、名称、描述、价格、图片、分类、库存等

### 2. API 服务 (lib/services/api_service.dart)

- 使用 Dio 进行网络请求
- 支持以下 API 端点：
  - `GET /api/products` - 获取所有产品
  - `GET /api/products/{id}` - 获取单个产品
  - `GET /api/products?category={category}` - 按分类获取产品
- 包含错误处理和日志记录

### 3. 状态管理 (lib/providers/product_provider.dart)

- 使用 Provider 进行状态管理
- 管理产品列表、推荐产品、加载状态和错误状态
- 提供搜索和分类功能

### 4. 配置管理 (lib/constants/)

- `app_config.dart` - 应用配置，支持开发和生产环境
- `api_constants.dart` - API 相关常量

## 使用方法

### 1. 启动后端服务

确保后端 API 服务正在运行：

```bash
cd apps/api
npm run dev
```

### 2. 配置 API URL

在 `lib/constants/app_config.dart` 中配置正确的 API URL：

```dart
static const String devApiUrl = 'http://192.168.3.18:3001';
```

### 3. 运行移动应用

```bash
cd apps/mobile
flutter run
```

### 4. 自动加载数据

- 应用启动后会自动加载推荐产品
- 产品数据将从后端 API 获取并显示在首页

## API 端点说明

### 获取所有产品

```
GET /api/products
```

### 获取单个产品

```
GET /api/products/{id}
```

### 按分类获取产品

```
GET /api/products?category={category}
```

## 错误处理

应用包含完整的错误处理机制：

- 网络请求失败时显示错误信息
- 提供重试按钮
- 加载状态指示器
- 空数据状态处理

## 下一步开发

1. **完善其他页面**

   - 分类页面：显示所有产品分类
   - 购物车页面：实现购物车功能
   - 个人中心：用户信息管理

2. **添加更多功能**

   - 用户认证
   - 购物车操作
   - 订单管理
   - 支付集成

3. **优化用户体验**

   - 图片缓存
   - 下拉刷新
   - 无限滚动
   - 搜索功能

## 技术栈

- **网络请求**: Dio
- **状态管理**: Provider
- **JSON 序列化**: json_annotation + json_serializable
- **图片加载**: Image.network (内置错误处理)
- **UI 框架**: Flutter Material Design 3
