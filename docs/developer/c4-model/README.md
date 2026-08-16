# Shopping System C4 模型

本目录用 [C4 模型](https://c4model.com/) 与 [C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML) 描述 [Shopping System](https://github.com/felixzhu97/shopping-system)。

Shopping System 是电商 monorepo：Web 商店、管理后台、API 与移动端能力。系统边界是面向顾客与运营的购物平台及其数据/支付依赖。

文件**扁平**存放。每个图使用 `C1-`–`C4-` 前缀；图内文案以源文件为准。

## 布局

```text
docs/developer/c4-model/
├── README.md
├── C1-Context.puml
├── C2-Container.puml
├── C3-Component-Web.puml
├── C3-Component-Admin.puml
└── C3-Component-API.puml
```

## 图表

| Path | Kind | Summary |
|------|------|---------|
| [C1-Context.puml](C1-Context.puml) | 系统上下文 | 顾客、运营与外部系统 |
| [C2-Container.puml](C2-Container.puml) | 容器 | Web / Admin / API / 数据存储 |
| [C3-Component-Web.puml](C3-Component-Web.puml) | 组件 | Web 商店前端结构 |
| [C3-Component-Admin.puml](C3-Component-Admin.puml) | 组件 | 管理后台结构 |
| [C3-Component-API.puml](C3-Component-API.puml) | 组件 | API 服务组件 |

## 渲染

```bash
plantuml docs/developer/c4-model/*.puml
```

## 源码锚点

- `apps/web` — 网页商店
- `apps/admin` — 管理后台
- `apps/api` — API 服务
- `apps/mobile` — 移动端（若启用）

原路径副本见 [`../../architecture/c4/`](../../architecture/c4/)。
