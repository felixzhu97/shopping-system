# 项目结构说明

## 目录结构

```
mobile/
├── android/                 # Android 平台相关文件
├── ios/                    # iOS 平台相关文件
├── lib/                    # Dart 源代码
│   └── main.dart          # 应用入口文件
├── test/                   # 测试文件
│   └── widget_test.dart   # Widget 测试
├── pubspec.yaml           # 项目配置和依赖
├── README.md              # 项目说明文档
└── PROJECT_STRUCTURE.md   # 项目结构说明（本文件）
```

## 当前实现

### 主要组件

1. **ShoppingApp** - 应用根组件

   - 配置 Material Design 3 主题
   - 设置蓝色主题色
   - 配置应用标题

2. **ShoppingHomePage** - 主页面容器

   - 实现底部导航栏
   - 管理页面切换逻辑
   - 包含四个主要标签页

3. **HomeTab** - 首页标签页

   - 轮播图占位区域
   - 快捷功能网格（8个功能入口）
   - 推荐商品展示（2x2网格）

4. **其他标签页** - 占位页面
   - CategoriesTab - 分类页面
   - CartTab - 购物车页面
   - ProfileTab - 个人中心页面

### 功能特性

- ✅ 响应式布局
- ✅ Material Design 3 主题
- ✅ 底部导航栏
- ✅ 首页布局框架
- ✅ 测试用例
- ✅ 代码分析通过

### 待实现功能

- 🔄 网络请求集成
- 🔄 状态管理
- 🔄 本地存储
- 🔄 用户认证
- 🔄 商品详情页
- 🔄 购物车功能
- 🔄 订单管理
- 🔄 支付集成

## 开发建议

### 下一步开发计划

1. **创建数据模型**

   ```
   lib/models/
   ├── user.dart
   ├── product.dart
   ├── cart.dart
   └── order.dart
   ```

2. **添加服务层**

   ```
   lib/services/
   ├── api_service.dart
   ├── auth_service.dart
   ├── cart_service.dart
   └── storage_service.dart
   ```

3. **创建可复用组件**

   ```
   lib/widgets/
   ├── product_card.dart
   ├── cart_item.dart
   ├── loading_spinner.dart
   └── custom_button.dart
   ```

4. **实现页面路由**
   ```
   lib/screens/
   ├── home/
   ├── product/
   ├── cart/
   └── profile/
   ```

### 推荐依赖包

- **状态管理**: `provider` 或 `riverpod`
- **网络请求**: `dio` 或 `http`
- **本地存储**: `shared_preferences` 或 `hive`
- **路由管理**: `go_router`
- **图片加载**: `cached_network_image`
- **表单验证**: `form_validator`

## 运行说明

```bash
# 安装依赖
flutter pub get

# 运行应用
flutter run

# 运行测试
flutter test

# 代码分析
flutter analyze

# 构建发布版本
flutter build apk
```

## 注意事项

1. 确保 Flutter SDK 版本 >= 3.8.0
2. 遵循 Dart 代码规范
3. 编写单元测试和 Widget 测试
4. 使用中文注释和文档
5. 遵循项目的 Git 提交规范
