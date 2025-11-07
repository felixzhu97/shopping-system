# 整洁架构 UML 图索引

本文档列出了所有整洁架构相关的 UML 图，帮助理解架构设计和各层之间的关系。

## UML 图列表

### 1. 架构概览图

**文件：** `clean-architecture-overview.puml`

**说明：** 展示整洁架构的整体概览，包括核心原则、层次结构、各层职责和关键特性。

**用途：**

- 快速了解整洁架构的核心概念
- 理解各层的职责划分
- 查看依赖关系和数据流

**查看方式：**

```bash
# 使用 PlantUML 生成图片
plantuml clean-architecture-overview.puml
```

---

### 2. 层次结构图

**文件：** `clean-architecture-layers.puml`

**说明：** 详细展示各层的组件和它们之间的依赖关系，以 Product 模块为例。

**包含内容：**

- Presentation Layer（表示层）
- Infrastructure Layer（基础设施层）
- Application Layer（应用层）
- Domain Layer（领域层）

**用途：**

- 理解各层的具体组件
- 查看组件间的依赖关系
- 理解依赖注入的使用

---

### 3. 类图

**文件：** `clean-architecture-class-diagram.puml`

**说明：** 展示 Product 模块的详细类图，包括各层的类、接口、属性和方法。

**包含内容：**

- Domain Layer：Product Entity、Money ValueObject、IProductRepository 接口
- Application Layer：各种 UseCase、DTO、ILogger 接口
- Infrastructure Layer：ProductRepository 实现、ProductController、Logger 实现

**用途：**

- 理解类的设计
- 查看接口和实现的关系
- 理解依赖注入的接口定义

---

### 4. 序列图

**文件：** `clean-architecture-sequence-diagram.puml`

**说明：** 展示"获取商品列表"用例的完整执行流程，从 HTTP 请求到数据库查询。

**流程：**

1. User 发送 HTTP 请求
2. Controller 接收请求
3. UseCase 处理业务逻辑
4. Repository 接口调用实现
5. 数据库查询
6. 数据映射和返回

**用途：**

- 理解请求处理流程
- 查看各层的交互顺序
- 理解数据流转过程

---

### 5. 依赖关系图

**文件：** `clean-architecture-dependency-graph.puml`

**说明：** 展示各层之间的依赖关系，强调依赖规则（从外层指向内层）。

**关键点：**

- Domain 层不依赖任何其他层
- Application 层只依赖 Domain 层
- Infrastructure 层依赖 Application 和 Domain 层
- Presentation 层依赖所有层

**用途：**

- 理解依赖规则
- 验证架构设计是否符合原则
- 识别潜在的循环依赖

---

### 6. 包结构图

**文件：** `clean-architecture-package-diagram.puml`

**说明：** 展示完整的包结构，包括所有模块（Product、User、Cart、Order）的组织方式。

**包含内容：**

- 完整的目录结构
- 各包之间的依赖关系
- 接口和实现的关系

**用途：**

- 理解项目的包组织
- 查看模块间的依赖
- 规划代码迁移路径

## 如何查看 UML 图

### 方式 1：使用 PlantUML 命令行工具

```bash
# 安装 PlantUML
# macOS
brew install plantuml

# 或使用 npm
npm install -g node-plantuml

# 生成图片
plantuml clean-architecture-overview.puml
plantuml clean-architecture-layers.puml
plantuml clean-architecture-class-diagram.puml
plantuml clean-architecture-sequence-diagram.puml
plantuml clean-architecture-dependency-graph.puml
plantuml clean-architecture-package-diagram.puml
```

### 方式 2：使用在线工具

1. 访问 [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
2. 复制 `.puml` 文件内容
3. 粘贴到在线编辑器
4. 查看生成的图片

### 方式 3：使用 VS Code 插件

1. 安装 "PlantUML" 插件
2. 打开 `.puml` 文件
3. 使用 `Alt + D` 预览图片

### 方式 4：使用 IntelliJ IDEA

1. 安装 PlantUML 插件
2. 打开 `.puml` 文件
3. 右键选择 "Preview Diagram"

## 图的使用场景

### 架构设计阶段

- **概览图**：向团队介绍整洁架构概念
- **层次结构图**：讨论各层的职责划分
- **依赖关系图**：验证架构设计是否符合原则

### 开发阶段

- **类图**：设计具体的类和接口
- **包结构图**：规划代码组织方式
- **序列图**：理解业务流程和数据流

### 代码审查阶段

- **依赖关系图**：检查是否有违反依赖规则的代码
- **类图**：验证接口设计是否合理
- **序列图**：理解代码执行流程

### 重构阶段

- **包结构图**：规划代码迁移路径
- **类图**：识别需要重构的类
- **依赖关系图**：识别需要解耦的依赖

## 相关文档

- [整洁架构重构建议](./clean-architecture-refactoring.md)
- [目录结构对比](./directory-structure-comparison.md)
- [快速参考指南](./clean-architecture-quick-reference.md)

## 注意事项

1. **保持同步**：代码变更时及时更新 UML 图
2. **版本控制**：将 `.puml` 文件纳入版本控制
3. **文档化**：为复杂的图添加说明注释
4. **简化**：避免在单个图中包含过多细节

## 扩展阅读

- [PlantUML 官方文档](https://plantuml.com/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [UML 图类型指南](https://www.uml-diagrams.org/)
