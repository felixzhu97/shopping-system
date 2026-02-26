# Scripts

## 目录结构

```
scripts/
├── seed/           # 数据种子 (MongoDB)
├── data/           # 数据生成与导入
├── jira/           # Jira 集成工具
├── server/         # 服务端环境启动
└── .env.example
```

## Server 一键启动

启动 MongoDB (Docker) + API 服务:

```bash
pnpm dev:server
```

需安装 Docker。若无 Docker，请确保本机已有 MongoDB 运行于 localhost:27017。

## Seed (MongoDB)

需配置 `MONGODB_URI`（参考 `.env.example`）。先执行商品种子，再执行用户订单（订单会关联商品）。两种种子执行前会清空现有数据。

默认登录账户（seed:orders-users 会自动创建）:

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@example.com | Admin123! |
| 普通用户 | user@example.com | User123! |

```bash
pnpm run seed:products200:dev   # 仅商品 (~200 条)
pnpm run seed:orders-users:dev  # 用户 + 订单（含默认账户）
pnpm run seed:default-users:dev # 仅创建默认账户（不清理现有数据）
```

从仓库根目录:

```bash
pnpm run seed:api            # 仅商品
pnpm run seed:orders-users   # 用户 + 订单 (需先有商品)
pnpm run seed:default-users  # 仅默认账户
```

可选环境变量: `SEED_USER_COUNT` (10), `SEED_ORDER_COUNT` (50), `SEED_ORDER_DAYS_SPAN` (60)。

## Data 数据生成

### generate_products_import_xlsx.cjs

生成测试用商品 Excel 导入文件:

```bash
node scripts/data/generate_products_import_xlsx.cjs [输出路径]
```

默认输出到 `services/api/src/__tests__/fixtures/products-import-1000.xlsx`。需在 scripts 目录安装 xlsx 依赖或从根目录运行。

## Jira 批量更新

### jira/update_priority.py

批量更新 Jira 任务优先级。

使用前设置环境变量:

```bash
export JIRA_EMAIL=your-email@example.com
export JIRA_API_TOKEN=your-api-token
```

运行:

```bash
pip install -r scripts/jira/requirements.txt
python3 scripts/jira/update_priority.py
```

配置: `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `ISSUE_KEYS`(脚本内), `PRIORITY`(脚本内)。

## Data Mining

数据挖掘相关脚本位于 `services/data-mining/`，参见该目录 README。
