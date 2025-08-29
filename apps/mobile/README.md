# 购物系统移动应用

这是购物系统项目的 Flutter 移动应用，提供了完整的移动端购物体验。

## 功能特性

### 🏠 首页

- 轮播图展示
- 快捷功能入口（优惠券、收藏夹、浏览记录等）
- 推荐商品展示
- 搜索和通知功能

### 📂 分类页面

- 商品分类浏览
- 分类筛选功能

### 🛒 购物车

- 商品管理
- 数量调整
- 价格计算

### 👤 个人中心

- 用户信息管理
- 订单历史
- 设置选项

## 技术栈

- **框架**: Flutter 3.8+
- **语言**: Dart
- **UI**: Material Design 3
- **状态管理**: 待定
- **网络请求**: 待定
- **本地存储**: 待定

## 开发环境要求

- Flutter SDK 3.8.0 或更高版本
- Dart SDK 3.8.0 或更高版本
- Android Studio / VS Code
- iOS 开发需要 macOS 和 Xcode

## 安装和运行

### 1. 安装依赖

```bash
cd apps/mobile
flutter pub get
```

### 2. 运行应用

#### Android

```bash
flutter run
```

#### iOS

```bash
flutter run -d ios
```

#### Web

```bash
flutter run -d chrome
```

### 3. 构建发布版本

#### Android APK

```bash
flutter build apk
```

#### iOS

```bash
flutter build ios
```

## 项目结构

```
lib/
├── main.dart              # 应用入口
├── models/                # 数据模型
├── screens/               # 页面组件
├── widgets/               # 可复用组件
├── services/              # 业务逻辑服务
├── utils/                 # 工具函数
└── constants/             # 常量定义
```

## 开发规范

### 代码风格

- 遵循 Dart 官方代码规范
- 使用 `flutter_lints` 进行代码检查
- 类名使用 PascalCase
- 变量和方法名使用 camelCase

### 文件命名

- 页面文件使用 `snake_case.dart`
- 组件文件使用 `snake_case.dart`
- 模型文件使用 `snake_case.dart`

### 注释规范

- 公共 API 必须添加文档注释
- 复杂逻辑需要添加行内注释
- 使用中文注释

## 测试

### 运行测试

```bash
flutter test
```

### 测试覆盖率

```bash
flutter test --coverage
```

## 部署

### Android

1. 生成签名密钥
2. 配置 `android/app/build.gradle`
3. 运行 `flutter build apk --release`

### iOS

1. 配置证书和描述文件
2. 运行 `flutter build ios --release`
3. 使用 Xcode 进行打包

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](../LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 项目 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 邮箱: your-email@example.com

## 更新日志

### v1.0.0 (2024-01-XX)

- 初始版本发布
- 基础页面框架
- 底部导航栏
- 首页布局
