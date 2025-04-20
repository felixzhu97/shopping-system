#!/bin/bash

echo "===== 准备部署API到Vercel ====="

# 构建项目
echo "1. 构建项目..."
pnpm build

# 确认构建成功
if [ ! -d "dist" ]; then
  echo "错误: 构建失败，dist目录不存在!"
  exit 1
fi

# 部署到Vercel
echo "2. 部署到Vercel..."
vercel --prod

echo "===== 部署完成! =====" 