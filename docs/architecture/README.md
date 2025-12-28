# 架构文档

本目录包含购物系统的架构文档，使用多种架构模型来描述系统的不同视图。

## 目录结构

```
docs/architecture/
├── c4/                          # C4模型相关文件
│   ├── diagrams/                # C4图表文件
│   │   ├── c4-context.puml      # 系统上下文图
│   │   ├── c4-container.puml    # 容器图
│   │   ├── c4-component.puml    # 组件图
│   │   ├── c4-code.puml         # 代码图
│   │   └── c4-model.puml        # 综合模型
│   └── c4-plantuml/             # C4 PlantUML库文件
├── togaf/                       # TOGAF架构文件
│   ├── business-architecture.puml    # 业务架构
│   ├── application-architecture.puml # 应用架构
│   ├── data-architecture.puml        # 数据架构
│   └── technology-architecture.puml  # 技术架构
├── wardley-map.puml             # 沃德利地图
└── README.md                    # 本文件
```

## C4模型

C4模型是一种用于描述软件架构的图形表示法，通过四个层次来描述系统：

### 图表说明

- **系统上下文图** (`c4-context.puml`): 展示系统与外部用户和系统的关系
- **容器图** (`c4-container.puml`): 展示系统的高层次技术架构，包括应用、数据库等容器
- **组件图** (`c4-component.puml`): 展示容器内部的组件及其关系
- **代码图** (`c4-code.puml`): 展示组件内部的代码结构和类关系
- **综合模型** (`c4-model.puml`): 包含以上所有层次的综合视图

### 查看方式

这些文件是 PlantUML 格式，可以使用以下方式查看：

1. **VS Code**: 安装 PlantUML 扩展
2. **在线工具**: 访问 [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
3. **本地工具**: 使用 PlantUML 命令行工具生成图片

## TOGAF架构

TOGAF（The Open Group Architecture Framework）是一种企业架构框架，从多个维度描述系统架构：

### 架构视图

- **业务架构** (`togaf/business-architecture.puml`): 描述业务能力、业务流程和业务角色
- **应用架构** (`togaf/application-architecture.puml`): 描述应用系统、应用组件及其交互
- **数据架构** (`togaf/data-architecture.puml`): 描述数据模型、数据流和数据存储
- **技术架构** (`togaf/technology-architecture.puml`): 描述技术平台、基础设施和技术组件

## 沃德利地图

沃德利地图（Wardley Map）是一种战略地图工具，用于可视化价值流和组件的演化阶段，帮助理解系统的战略定位和技术选择。

### 地图说明

沃德利地图通过两个维度来描述系统：

- **价值流（X轴）**: 从用户需求到基础设施的价值链

  - 用户需求：购买商品、管理账户等核心需求
  - 用户界面：Web应用、移动应用
  - 业务逻辑：订单处理、支付处理、商品管理
  - 数据服务：数据存储、数据访问
  - 基础设施：部署平台、CDN、监控

- **演化阶段（Y轴）**: 组件的成熟度和标准化程度
  - **Genesis（创新）**: 定制化、实验性组件，如个性化推荐算法
  - **Custom-built（定制构建）**: 内部开发的组件，如业务逻辑层
  - **Product（产品化）**: 可购买的产品和服务，如Next.js、MongoDB
  - **Commodity（商品化）**: 标准化、通用服务，如TypeScript、HTTP协议

### 组件分类

地图中包含两类组件：

1. **业务能力组件**：

   - 用户认证与授权
   - 商品管理
   - 购物车管理
   - 订单处理
   - 支付处理
   - 库存管理

2. **技术栈组件**：
   - Next.js（Web框架）
   - Flutter（移动框架）
   - Express.js（API框架）
   - MongoDB（数据库）
   - Vercel（部署平台）
   - TypeScript（类型系统）
   - React（UI库）

### 查看方式

沃德利地图文件是 PlantUML 格式，可以使用以下方式查看：

1. **VS Code**: 安装 PlantUML 扩展
2. **在线工具**: 访问 [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
3. **本地工具**: 使用 PlantUML 命令行工具生成图片

### 使用场景

- **战略规划**: 理解系统各组件的战略定位
- **技术选型**: 评估技术栈的成熟度和风险
- **架构演进**: 规划系统组件的演化路径
- **投资决策**: 识别需要重点投入的领域

## 使用建议

1. **新成员了解系统**: 建议先查看 C4 模型的系统上下文图和容器图
2. **战略规划**: 使用沃德利地图理解系统的战略定位和技术选择
3. **深入理解架构**: 查看 TOGAF 的各个架构视图
4. **开发参考**: 使用组件图和代码图了解具体实现细节
5. **架构演进**: 定期更新这些文档以反映系统的最新状态

## 相关文档

- [系统架构文档](../architecture/system-architecture.md) - 系统架构的详细说明
- [产品愿景](../architecture/product-vision.md) - 产品目标和愿景
- [API文档](../api/api-documentation.md) - API接口文档
