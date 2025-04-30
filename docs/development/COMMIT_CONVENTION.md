# Git 提交规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范进行代码提交。

## 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型（type）

必须是以下类型之一：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档修改
- `style`: 代码格式修改（不影响代码运行的变动）
- `refactor`: 代码重构（既不是新增功能，也不是修改 bug 的代码变动）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `revert`: 回滚到上一个版本
- `build`: 构建相关的修改

### 作用域（scope）

scope 是可选的，用于说明 commit 影响的范围。常见的 scope 包括：

- `core`: 核心模块
- `ui`: 界面相关
- `api`: API 相关
- `docs`: 文档相关
- `deps`: 依赖相关

### 主题（subject）

subject 是 commit 目的的简短描述：

- 使用现在时态（"change"，而不是"changed"或"changes"）
- 不要大写第一个字母
- 结尾不加句号（.）

### 正文（body）

正文是可选的，应该包含改动的详细描述：

- 使用现在时态
- 包含改动的动机，并将其与之前的行为进行对比

### 页脚（footer）

页脚是可选的，用于放置 Breaking Changes 或关闭 Issue 的信息。

## 示例

```
feat(auth): 添加用户登录功能

- 实现用户名密码登录
- 添加登录表单验证
- 集成 JWT 认证

Closes #123
```

```
fix(api): 修复用户查询接口返回错误

修复了当用户不存在时返回 500 错误的问题，
现在会正确返回 404 状态码。

Fixes #456
```

## 工具支持

本项目使用了以下工具来强制执行提交规范：

- commitlint: 用于检查提交信息
- husky: 用于设置 Git hooks

提交前会自动检查提交信息是否符合规范。如果不符合规范，提交将被拒绝。 