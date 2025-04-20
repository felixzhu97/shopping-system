#!/bin/bash

# MCP初始化脚本
# 用于生成MCP所需的初始数据和配置

echo "开始初始化MCP (Model Context Protocol)..."

# 创建必要的目录
mkdir -p .github/mcp-data

# 运行上下文提供程序
echo "生成MCP上下文数据..."
node .github/mcp-providers/context-provider.js

# 检查工作流文件
if [ -f ".github/workflows/deploy.yml" ]; then
  echo "检查并修复工作流文件..."
  node .github/mcp-providers/workflow-fixer.js .github/workflows/deploy.yml
fi

# 创建初始配置记录
cat > .github/mcp-data/config-status.json << EOL
{
  "initialized": true,
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "components": {
    "mcp.yml": true,
    "workflow": true,
    "templates": true,
    "providers": true,
    "app-manifest": true
  }
}
EOL

echo "MCP初始化完成！"
echo "启用MCP后，您可以获得以下功能："
echo "- 自动修复GitHub Actions工作流问题"
echo "- 智能处理Issues和Pull Requests"
echo "- 项目上下文感知的代码建议"
echo ""
echo "查看更多信息: https://github.com/settings/apps" 