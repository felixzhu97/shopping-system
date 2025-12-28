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

## 使用建议

1. **新成员了解系统**: 建议先查看 C4 模型的系统上下文图和容器图
2. **深入理解架构**: 查看 TOGAF 的各个架构视图
3. **开发参考**: 使用组件图和代码图了解具体实现细节
4. **架构演进**: 定期更新这些文档以反映系统的最新状态

## 相关文档

- [系统架构文档](../architecture/system-architecture.md) - 系统架构的详细说明
- [产品愿景](../architecture/product-vision.md) - 产品目标和愿景
- [API文档](../api/api-documentation.md) - API接口文档



