#!/usr/bin/env node

/**
 * MCP工作流修复器
 *
 * 专门用于修复GitHub Actions工作流中的常见问题
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// 修复PNPM相关问题
function fixPnpmIssues(workflowFile) {
  console.log(`正在修复${workflowFile}中的PNPM问题...`);

  try {
    const workflowPath = path.join(process.cwd(), workflowFile);
    let content = fs.readFileSync(workflowPath, 'utf8');
    let modified = false;

    // 检查是否有PNPM相关问题
    if (
      content.includes('npm install -g pnpm') ||
      (content.includes('pnpm') && !content.includes('pnpm/action-setup'))
    ) {
      console.log(`在${workflowFile}中发现PNPM配置问题`);

      // 用正确的PNPM安装步骤替换错误的安装方式
      content = content.replace(
        /- name: .*?\n\s+run: npm install -g pnpm/g,
        `- name: 安装pnpm\n      uses: pnpm/action-setup@v2\n      with:\n        version: 8\n        run_install: false`
      );

      // 记录修改状态
      modified = true;
    }

    // 如果有修改，保存文件
    if (modified) {
      fs.writeFileSync(workflowPath, content);
      console.log(`已成功修复${workflowFile}中的PNPM问题`);
      return true;
    } else {
      console.log(`未在${workflowFile}中发现需要修复的PNPM问题`);
      return false;
    }
  } catch (error) {
    console.error(`修复${workflowFile}时出错:`, error);
    return false;
  }
}

// 生成修复报告
function generateFixReport(workflowFile, fixed) {
  const reportDir = path.join(process.cwd(), '.github', 'mcp-data');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.join(reportDir, 'fix-report.json');

  let report = {};
  if (fs.existsSync(reportPath)) {
    try {
      report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    } catch (error) {
      console.error('读取现有报告时出错:', error);
    }
  }

  report[workflowFile] = {
    fixed,
    timestamp: new Date().toISOString(),
    issueType: 'pnpm-configuration',
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`已生成修复报告: ${reportPath}`);
}

// 主函数
function main() {
  // 获取参数
  const args = process.argv.slice(2);
  const workflowFile = args[0] || '.github/workflows/deploy.yml';

  console.log(`开始MCP工作流修复处理: ${workflowFile}`);

  // 修复PNPM问题
  const fixed = fixPnpmIssues(workflowFile);

  // 生成报告
  generateFixReport(workflowFile, fixed);

  console.log('MCP工作流修复完成');
}

// 执行
main();
