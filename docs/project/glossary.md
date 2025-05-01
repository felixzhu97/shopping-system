# 购物系统术语表

本文档提供了购物系统中使用的技术术语、业务概念和缩略语的定义，帮助团队成员理解和使用统一的术语。

## A

### API (应用程序接口)

应用程序编程接口，允许不同软件系统之间进行通信的一组规则和协议。在购物系统中，API用于前端和后端之间的通信，以及与第三方服务的集成。

### Atlas

MongoDB的云数据库服务，本系统使用它托管MongoDB数据库。

## B

### Bearer Token

一种HTTP认证方案，在API请求头部使用"Bearer"前缀和令牌值发送认证信息。购物系统使用Bearer Token传输JWT进行API认证。

### 备份 (Backup)

数据的复制，用于在原始数据丢失或损坏时进行恢复。系统定期对MongoDB数据库执行自动备份。

## C

### CDN (内容分发网络)

分布式服务器网络，用于高效地向用户提供内容。购物系统使用Vercel的CDN网络分发静态资源。

### CI/CD (持续集成/持续部署)

自动化软件开发实践，包括代码集成、测试和部署。系统使用GitHub Actions实现CI/CD流程。

### 控制器 (Controller)

处理HTTP请求并返回响应的组件，是MCP架构中的核心部分，负责协调模型和提供者。

## D

### DR (灾难恢复)

在灾难或重大系统故障后恢复IT系统和服务的策略和流程。

### 依赖项 (Dependency)

系统或组件所依赖的外部库、服务或资源。购物系统使用PNPM管理JavaScript依赖项。

## E

### Edge Network

分布式计算基础设施，将处理能力和数据存储放置在靠近最终用户的位置，以提高响应速度。购物系统使用Vercel Edge Network提高全球访问速度。

### 环境变量 (Environment Variable)

存储在操作系统或容器环境中的配置值，如API密钥和数据库连接字符串。系统使用.env文件和Vercel配置管理环境变量。

### Express.js

基于Node.js的Web应用框架，用于构建API和Web服务器。购物系统的后端API使用Express.js开发。

## J

### JWT (JSON Web Token)

一种基于JSON的开放标准，用于在各方之间安全地传输信息。购物系统使用JWT进行用户认证和授权。

## M

### MCP架构 (Model-Controller-Provider)

系统采用的架构模式，将数据模型、业务逻辑控制器和数据访问提供者分离。类似于传统MVC，但更适合数据库交互。

### MongoDB

一种面向文档的NoSQL数据库，以JSON格式存储数据。购物系统使用MongoDB存储所有业务数据。

### Monorepo

一种项目组织方式，将多个相关项目存储在单个代码仓库中。购物系统使用Turborepo实现Monorepo结构。

### Mongoose

MongoDB对象数据建模(ODM)工具，提供了模式验证、关系管理等功能。系统使用Mongoose与MongoDB交互。

### 模型 (Model)

定义数据结构和业务逻辑的组件，是MCP架构中的数据表示层，对应MongoDB中的集合。

## N

### Next.js

React框架，提供服务器端渲染、静态网站生成等功能。购物系统的前端使用Next.js开发。

### Node.js

基于Chrome V8引擎的JavaScript运行时，用于构建服务器端应用程序。系统的后端服务基于Node.js。

## O

### ODM (对象文档映射)

将数据库文档映射到面向对象编程语言中的对象的技术。Mongoose是系统使用的MongoDB ODM。

## P

### PNPM

快速、磁盘空间效率高的包管理器，用于管理Node.js项目依赖项。购物系统使用PNPM管理依赖和工作空间。

### 提供者 (Provider)

负责数据访问操作的组件，是MCP架构中的数据访问层，封装了与数据库交互的逻辑。

## R

### React

用于构建用户界面的JavaScript库。购物系统前端基于React开发。

### Repository (仓库模式)

封装数据访问逻辑的设计模式，提供类似集合的接口访问数据。系统的数据访问层使用Repository模式。

### REST API

一种架构风格的API，使用HTTP方法和标准进行设计。购物系统的API遵循REST原则。

### RPO (恢复点目标)

灾难恢复计划中可接受的最大数据丢失时间，通常以小时计算。

### RTO (恢复时间目标)

灾难恢复计划中恢复服务所需的最长时间，通常以小时计算。

## S

### 服务器端渲染 (SSR)

在服务器上渲染页面并将完整HTML发送到客户端的技术。系统使用Next.js实现SSR以提高性能和SEO。

### Storybook

用于独立开发和展示UI组件的开源工具。购物系统使用Storybook管理UI组件库。

### Swagger

API文档生成工具，提供交互式API文档。系统使用Swagger自动生成API文档。

## T

### Tailwind CSS

实用优先的CSS框架，通过预定义的类构建设计。购物系统的UI样式使用Tailwind CSS开发。

### Turborepo

高性能JavaScript/TypeScript Monorepo构建系统。购物系统使用Turborepo管理多包结构。

### TypeScript

JavaScript的超集，添加了静态类型系统。购物系统使用TypeScript开发前后端代码。

## V

### Vercel

一个面向前端框架的云平台，专注于静态站点和Serverless Functions。购物系统部署在Vercel平台上。

## 业务术语

### 购物车 (Cart)

存储用户选择的待购商品的临时容器。在系统中，购物车绑定到用户并存储在MongoDB中。

### 结账 (Checkout)

将购物车中的商品转换为订单并处理支付的过程。

### 商品 (Product)

系统中销售的物品，包含名称、描述、价格、库存等信息。

### 订单 (Order)

记录用户购买信息的数据实体，包含商品、数量、价格、状态等信息。

### 用户故事 (User Story)

从最终用户角度描述的软件功能需求。项目开发基于用户故事进行规划和跟踪。

## 缩略语对照表

| 缩略语 | 全称                                         | 说明                   |
| ------ | -------------------------------------------- | ---------------------- |
| API    | Application Programming Interface            | 应用程序编程接口       |
| CDN    | Content Delivery Network                     | 内容分发网络           |
| CI/CD  | Continuous Integration/Continuous Deployment | 持续集成/持续部署      |
| DR     | Disaster Recovery                            | 灾难恢复               |
| JWT    | JSON Web Token                               | JSON网络令牌           |
| MCP    | Model-Controller-Provider                    | 模型-控制器-提供者架构 |
| MVP    | Minimum Viable Product                       | 最小可行产品           |
| ODM    | Object Document Mapper                       | 对象文档映射器         |
| REST   | Representational State Transfer              | 表述性状态转移         |
| RPO    | Recovery Point Objective                     | 恢复点目标             |
| RTO    | Recovery Time Objective                      | 恢复时间目标           |
| SSR    | Server-Side Rendering                        | 服务器端渲染           |
| UI     | User Interface                               | 用户界面               |
| UX     | User Experience                              | 用户体验               |
