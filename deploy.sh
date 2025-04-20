#!/bin/bash

# 构建后端
echo "开始构建后端API..."
cd apps/api
npm run build
echo "后端API构建完成"

# 构建前端
echo "开始构建前端应用..."
cd ../web
npm run build
echo "前端应用构建完成"

# 部署到Vercel (需要先安装Vercel CLI并登录)
echo "开始部署到Vercel..."
cd ../..

# 部署API
echo "部署后端API..."
cd apps/api
vercel --prod

# 部署前端
echo "部署前端应用..."
cd ../web
vercel --prod

echo "部署完成！" 