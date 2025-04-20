---
name: 工作流修复模板
description: 用于自动修复GitHub Actions工作流问题
---

## 工作流问题修复

### 问题描述

{{failure_description}}

### 失败日志

```
{{failure_logs}}
```

### 修复建议

以下是可能的修复方案：

{{fix_suggestions}}

### 自动修复

针对常见问题的自动修复已准备就绪：

```yaml
{ { fix_code } }
```

### 后续操作

- [ ] 应用上述修复
- [ ] 手动检查修复是否解决问题
- [ ] 如问题持续存在，请提供更多详细信息
