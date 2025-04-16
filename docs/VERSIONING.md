# 版本管理指南

本项目使用 [Changesets](https://github.com/changesets/changesets) 进行版本管理和发布。

## 什么是 Changesets？

Changesets 是一个管理多包仓库（monorepo）版本和变更日志的工具。它帮助我们在一个仓库中管理多个包的版本，并自动生成变更日志。

## 如何使用

### 在本地开发时

当你完成一个功能或修复一个 bug 时，需要创建一个 changeset 来记录你的变更：

```bash
pnpm changeset
```

系统会提示你选择受影响的包，然后选择版本升级类型（补丁、小版本或大版本），最后添加变更说明。

### 版本升级类型

- **补丁（patch）**: 修复 bug，不影响 API（例如 1.0.0 -> 1.0.1）
- **小版本（minor）**: 添加向后兼容的功能（例如 1.0.0 -> 1.1.0）
- **大版本（major）**: 做出不向后兼容的更改（例如 1.0.0 -> 2.0.0）

### 发布流程

当你的 PR 被合并到主分支后，GitHub Actions 将自动创建一个版本更新的 PR。该 PR 包含所有未发布的 changesets 的版本更新和变更日志更新。

当版本 PR 被合并后，GitHub Actions 将自动发布新版本到 npm。

## 常用命令

- 创建新的 changeset：

  ```bash
  pnpm changeset
  ```

- 本地预览版本变更：

  ```bash
  pnpm version
  ```

- 发布版本（通常由 CI 执行）：
  ```bash
  pnpm publish
  ```
