#!/usr/bin/env node

/**
 * MCP上下文提供程序
 *
 * 用于收集项目特定信息并提供给GitHub的MCP系统
 */

// 收集项目信息
function collectProjectContext() {
  const context = {
    project: {
      name: 'shopping-system',
      type: 'monorepo',
      structure: {
        frontend: 'apps/web',
        backend: 'apps/api',
        shared: 'packages/shared',
      },
    },
    dependencies: {
      packageManager: 'pnpm',
      workspace: true,
      monorepo: true,
    },
    deployment: {
      platform: 'Vultr',
      ci: 'GitHub Actions',
    },
  };

  return context;
}

// 收集特定工作流信息
function collectWorkflowContext() {
  return {
    workflows: {
      deploy: {
        path: '.github/workflows/deploy.yml',
        criticalSteps: ['构建', '测试', '部署'],
        dependencies: ['pnpm', 'Node.js'],
      },
    },
    commonIssues: {
      pnpm: '使用pnpm/action-setup@v2替代npm install -g pnpm',
      mongodb: '确保MongoDB服务正确安装和配置',
      deployment: '检查服务器SSH密钥和权限',
    },
  };
}

// 写入MCP上下文文件
function writeMcpContext() {
  const fs = require('fs');
  const path = require('path');

  const context = {
    ...collectProjectContext(),
    ...collectWorkflowContext(),
    timestamp: new Date().toISOString(),
  };

  const outputDir = path.join(__dirname, '..', '..', '.github', 'mcp-data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outputDir, 'context.json'), JSON.stringify(context, null, 2));

  console.log('MCP上下文已生成');
}

// 执行
writeMcpContext();
