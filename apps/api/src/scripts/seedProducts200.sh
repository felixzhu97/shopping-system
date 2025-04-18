#!/bin/bash

# 确保在当前目录执行
cd "$(dirname "$0")"

# 执行ts-node运行脚本
echo "正在导入200个产品数据..."
npx ts-node seedProducts200.ts

echo "完成！" 