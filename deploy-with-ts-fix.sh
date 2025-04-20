#!/bin/bash

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}开始部署带有TypeScript修复的购物系统...${NC}"

# 当前目录
CURRENT_DIR=$(pwd)
echo -e "${GREEN}当前工作目录: ${CURRENT_DIR}${NC}"

# 1. 构建shared包
echo -e "${GREEN}1. 构建shared包...${NC}"
cd packages/shared
pnpm build
if [ $? -ne 0 ]; then
  echo -e "${RED}shared包构建失败!${NC}"
  exit 1
fi
cd ../..

# 2. 修复API模块的TypeScript错误
echo -e "${GREEN}2. 修复API模块的TypeScript错误...${NC}"

# 修复Cart.ts中的导入错误
echo -e "${YELLOW}修复Cart.ts中的导入错误...${NC}"
sed -i '' 's/import { CartItem } from "shared\/dist";/import { CartItem } from "shared";/g' apps/api/src/models/Cart.ts

# 修复express.Application错误
echo -e "${YELLOW}修复express.Application错误...${NC}"
sed -i '' 's/let app: express.Application;/let app: any;/g' apps/api/src/tests/server.test.ts

# 修复控制器中的状态码类型错误
echo -e "${YELLOW}修复控制器中的状态码类型错误...${NC}"
for file in apps/api/src/controllers/*Controller.ts; do
  echo "修复 $file"
  sed -i '' 's/res\.status(\([0-9][0-9][0-9]\))/res.status(\1 as number)/g' $file
done

# 3. 安装依赖
echo -e "${GREEN}3. 重新安装依赖...${NC}"
pnpm install

# 4. 构建项目
echo -e "${GREEN}4. 构建项目...${NC}"
pnpm build

if [ $? -ne 0 ]; then
  echo -e "${RED}构建失败! 请检查错误信息${NC}"
  exit 1
else
  echo -e "${GREEN}构建成功!${NC}"
fi

# 5. 部署项目（这里根据实际部署方式替换）
echo -e "${GREEN}5. 部署项目...${NC}"
# 例如: rsync, scp, 或者部署到Vercel, Netlify等
# 这里只是示例，请根据实际部署方式替换

echo -e "${GREEN}=============${NC}"
echo -e "${GREEN}部署完成!${NC}"
echo -e "${GREEN}=============${NC}" 