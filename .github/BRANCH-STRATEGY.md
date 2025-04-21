# 分支管理策略

本文档描述了购物系统项目的Git分支管理策略。

## 主要分支

- **main**: 主分支，包含生产就绪的代码。所有部署到生产环境的代码都来自此分支。
- **develop**: 开发分支，包含最新的开发代码。所有功能开发完成后会合并到此分支。

## 功能分支

从`develop`分支创建，完成后通过Pull Request合并回`develop`分支：

- **feature/\***：新功能开发，例如 `feature/user-auth`
- **bugfix/\***：修复开发中的bug，例如 `bugfix/login-issue`
- **release/\***：准备发布版本，例如 `release/v1.0.0`
- **hotfix/\***：紧急修复生产环境问题，从`main`分支创建，修复后同时合并到`main`和`develop`

## 工作流程

1. **功能开发**:

   ```
   git checkout develop
   git pull
   git checkout -b feature/new-feature
   # 开发功能
   git push -u origin feature/new-feature
   # 创建Pull Request到develop分支
   ```

2. **版本发布**:

   ```
   git checkout develop
   git pull
   git checkout -b release/v1.0.0
   # 最终测试和版本号更新
   # 创建Pull Request到main分支
   ```

3. **生产修复**:
   ```
   git checkout main
   git pull
   git checkout -b hotfix/critical-bug
   # 修复bug
   # 创建Pull Request到main和develop分支
   ```

## CI/CD工作流

- `main`分支的推送会触发生产环境部署
- `develop`分支的推送会触发测试和构建
- 所有功能分支的推送会触发构建和测试

## 提交消息规范

使用以下格式：

- `feat:`：新功能
- `fix:`：Bug修复
- `docs:`：文档更新
- `style:`：代码格式更改
- `refactor:`：代码重构
- `test:`：测试相关
- `chore:`：构建过程或辅助工具变动

例如：`feat: 添加用户认证功能`
