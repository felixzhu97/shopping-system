#!/bin/bash

# 停止脚本在出错时继续执行
set -e

echo "===== 购物系统一键部署脚本(带TS错误修复) ====="
echo "此脚本将自动部署前后端应用到您的服务器并修复TypeScript错误"

# 先执行原来的部署脚本
echo "===== 执行基本部署 ====="
cd /root
./deploy-full.sh || true  # 即使部署脚本失败，也继续执行

# 执行TypeScript错误修复脚本
echo "===== 执行TypeScript错误修复 ====="
cd /root
./fix-typescript-errors.sh

# 重新启动服务
echo "===== 重新启动服务 ====="
cd /var/www/shopping-system

# 重启API服务
cd apps/api
pm2 delete shopping-api 2>/dev/null || true
pm2 start dist/index.js --name shopping-api
cd ../..

# 重启Web服务
cd apps/web
pm2 delete shopping-web 2>/dev/null || true
pm2 start npm --name shopping-web -- start
cd ../..

# 保存PM2进程
pm2 save

echo "===== 部署与修复完成 ====="
echo "前端访问地址: http://服务器IP"
echo "后端API地址: http://服务器IP/api"
echo "PM2状态: "
pm2 status 