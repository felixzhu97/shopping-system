#!/usr/bin/env node

/**
 * MCP GitHub Actions自动修复工具
 *
 * 此脚本自动检测和修复GitHub Actions工作流中的常见问题
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Octokit } = require('@octokit/rest');

// 从配置文件加载设置
const loadConfig = () => {
  try {
    const configPath = path.join(__dirname, 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    // 处理环境变量
    if (
      config.github.token &&
      config.github.token.startsWith('${') &&
      config.github.token.endsWith('}')
    ) {
      const envVarName = config.github.token.slice(2, -1);
      config.github.token = process.env[envVarName];
    }

    return config;
  } catch (error) {
    console.error('加载配置文件失败:', error.message);
    process.exit(1);
  }
};

// 初始化GitHub客户端
const initGitHub = token => {
  return new Octokit({ auth: token });
};

// 获取仓库信息
const getRepoInfo = () => {
  try {
    const remoteUrl = execSync('git config --get remote.origin.url').toString().trim();
    const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
    if (!match) throw new Error('无法解析GitHub仓库信息');
    return { owner: match[1], repo: match[2].replace('.git', '') };
  } catch (error) {
    console.error('获取仓库信息失败:', error.message);
    process.exit(1);
  }
};

// 修复常见的Actions工作流错误
const fixWorkflowIssues = async (owner, repo, octokit) => {
  const workflowsDir = path.join(process.cwd(), '.github', 'workflows');

  if (!fs.existsSync(workflowsDir)) {
    console.log('未找到工作流目录');
    return;
  }

  const files = fs
    .readdirSync(workflowsDir)
    .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

  for (const file of files) {
    const filePath = path.join(workflowsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 修复 pnpm 相关问题
    if (content.includes('pnpm') && !content.includes('pnpm-action')) {
      console.log(`在 ${file} 中发现 pnpm 使用问题，正在修复...`);

      // 查找所有 setup-node 步骤
      const setupNodeRegex =
        /- name: 设置Node\.js[\s\S]*?uses: actions\/setup-node@[\w\.]+[\s\S]*?(?=\n\s*-|\n$)/g;
      const matches = [...content.matchAll(setupNodeRegex)];

      for (const match of matches) {
        const setupBlock = match[0];

        // 检查是否需要添加 pnpm 缓存
        if (setupBlock.includes("cache: 'pnpm'") && !setupBlock.includes('setup-pnpm')) {
          // 在 setup-node 后添加 pnpm 安装步骤
          const replacement = `${setupBlock}
      - name: 安装 pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          run_install: false`;

          content = content.replace(setupBlock, replacement);
          modified = true;
        }
      }

      // 如果还有直接运行 pnpm 命令但没有安装步骤的情况
      if (!content.includes('pnpm/action-setup') && content.includes('run: pnpm')) {
        const nodeSetupRegex =
          /- name: 设置Node\.js[\s\S]*?uses: actions\/setup-node@[\w\.]+[\s\S]*?(?=\n\s*-|\n$)/;
        const nodeSetupMatch = content.match(nodeSetupRegex);

        if (nodeSetupMatch) {
          const setupBlock = nodeSetupMatch[0];
          const replacement = `${setupBlock}
      - name: 安装 pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          run_install: false`;

          content = content.replace(setupBlock, replacement);
          modified = true;
        }
      }
    }

    // 保存修改
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`已修复 ${file}`);

      // 可选：创建PR
      const config = loadConfig();
      if (config.github.autofix.createPullRequest) {
        await createPullRequest(owner, repo, octokit, file);
      }
    }
  }
};

// 创建PR
const createPullRequest = async (owner, repo, octokit, file) => {
  try {
    const branchName = `fix-github-actions-${Date.now()}`;

    // 创建新分支
    execSync(`git checkout -b ${branchName}`);
    execSync(`git add .github/workflows/${file}`);
    execSync(`git commit -m "修复 GitHub Actions 工作流问题 [MCP自动修复]"`);
    execSync(`git push origin ${branchName}`);

    // 创建PR
    const { data } = await octokit.pulls.create({
      owner,
      repo,
      title: '修复 GitHub Actions 工作流问题',
      body: 'MCP自动修复工具检测并解决了GitHub Actions工作流中的问题。',
      head: branchName,
      base: 'main', // 假设主分支是main
    });

    console.log(`成功创建PR: ${data.html_url}`);
  } catch (error) {
    console.error('创建PR失败:', error.message);
  }
};

// 主函数
const main = async () => {
  console.log('开始MCP GitHub Actions自动修复...');

  const config = loadConfig();
  if (!config.github.autofix.enabled) {
    console.log('自动修复功能已禁用');
    return;
  }

  const token = config.github.token;
  if (!token || token === 'YOUR_GITHUB_PAT_HERE') {
    console.error('错误: GitHub PAT未设置。请设置GITHUB_TOKEN环境变量或在配置中提供有效token');
    return;
  }

  const octokit = initGitHub(token);
  const { owner, repo } = getRepoInfo();

  if (config.github.autofix.actions.workflows) {
    await fixWorkflowIssues(owner, repo, octokit);
  }

  console.log('MCP GitHub Actions自动修复完成');
};

// 执行主函数
main().catch(error => {
  console.error('执行过程中出错:', error);
  process.exit(1);
});
