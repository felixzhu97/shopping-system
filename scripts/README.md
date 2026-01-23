# Jira 批量更新脚本

## batch_update_jira_tasks.py

批量更新 Jira 任务，将它们关联到指定的 Epic。

### 使用方法

1. **设置环境变量**（推荐）:
```bash
export JIRA_EMAIL=your-email@example.com
export JIRA_API_TOKEN=your-api-token
```

2. **运行脚本**:
```bash
python3 scripts/batch_update_jira_tasks.py
```

### 获取 Jira API Token

1. 访问 https://id.atlassian.com/manage-profile/security/api-tokens
2. 点击 "Create API token"
3. 复制生成的 token
4. 设置环境变量 `JIRA_API_TOKEN`

### 配置说明

- `JIRA_BASE_URL`: Jira 实例的基础 URL（默认: https://luckychat.atlassian.net）
- `JIRA_EMAIL`: 你的 Jira 邮箱
- `JIRA_API_TOKEN`: Jira API Token
- `ISSUE_KEYS`: 要更新的任务键列表
- `EPIC_KEY`: 目标 Epic 的键

### 注意事项

- 确保你有权限修改这些任务
- 脚本使用 Jira REST API v2
- 对于 next-gen 项目，使用 `parent` 字段关联任务到 Epic


