#!/bin/bash

# 进入项目目录
cd /var/www/shopping-system

# 1. 修复 shared 库导入问题
echo "===== 修复共享库导入问题 ====="

# 确保 shared 包已经构建
echo "构建 shared 包..."
cd packages/shared
pnpm build
cd ../..

# 2. 修复类型错误
echo "===== 修复类型错误 ====="

# 修复 userController.ts 中的错误
echo "修复 userController.ts..."
sed -i 's/res\.status(500)/res.status(500 as number)/g' apps/api/src/controllers/userController.ts

# 修复 Cart.ts 中的导入错误
echo "修复 Cart.ts 中的导入错误..."
sed -i 's/import { CartItem } from "shared\/dist";/import { CartItem } from "shared";/g' apps/api/src/models/Cart.ts

# 修复 express.Application 的错误
echo "修复 express.Application 错误..."
sed -i 's/let app: express.Application;/let app: any;/g' apps/api/src/tests/server.test.ts

# 3. 修复其他控制器中的类型错误
echo "修复其他控制器中的状态码类型错误..."
for file in apps/api/src/controllers/*Controller.ts; do
  echo "修复 $file..."
  sed -i 's/res\.status([0-9][0-9][0-9])/res.status(\1 as number)/g' $file
done

# 4. 修复 package.json 中的依赖关系
echo "===== 更新依赖关系 ====="
cd apps/api
# 添加 @types/express 依赖
if ! grep -q '"@types/express"' package.json; then
  echo "添加 @types/express 依赖..."
  pnpm add -D @types/express
fi

# 确保正确引用 shared 包
echo "更新 shared 包引用..."
sed -i 's/"shared": "workspace:\*"/"shared": "file:..\/..\/packages\/shared"/g' package.json

# 5. 重新安装依赖
echo "===== 重新安装依赖 ====="
cd /var/www/shopping-system
pnpm install

# 6. 尝试重新构建
echo "===== 重新构建 API ====="
cd apps/api
pnpm build

echo "===== 修复完成 ====="
echo "如果仍有错误，请根据错误信息手动修复。" 