#!/bin/bash

# 停止脚本在任何命令失败时立即退出
set -e

echo "===== 购物系统一键部署脚本 ====="
echo "此脚本将自动部署前后端应用到您的服务器"

# 更新系统
echo "===== 更新系统 ====="
apt update -y && apt upgrade -y
apt install -y git curl wget vim build-essential nginx

# 安装 Node.js
echo "===== 安装 Node.js ====="
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    echo "Node.js 安装完成: $(node -v)"
else
    echo "Node.js 已安装: $(node -v)"
fi

# 安装 PM2
echo "===== 安装 PM2 ====="
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo "PM2 安装完成"
else
    echo "PM2 已安装"
fi

# 安装 pnpm
echo "===== 安装 pnpm ====="
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
    echo "pnpm 安装完成: $(pnpm -v)"
else
    echo "pnpm 已安装: $(pnpm -v)"
fi

# 安装 MongoDB
echo "===== 安装 MongoDB ====="
if ! systemctl status mongod &> /dev/null; then
    echo "安装 libssl1.1 依赖..."
    wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb
    dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb
    
    echo "添加 MongoDB 仓库..."
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    
    apt update
    apt install -y mongodb-org
    
    echo "启动 MongoDB 服务..."
    systemctl start mongod
    systemctl enable mongod
    
    echo "MongoDB 安装并启动完成"
else
    echo "MongoDB 已安装"
fi

# 如果 MongoDB 安装失败，使用 Docker 替代
if ! systemctl status mongod &> /dev/null; then
    echo "标准安装 MongoDB 失败，尝试使用 Docker 安装..."
    
    # 安装 Docker
    if ! command -v docker &> /dev/null; then
        apt install -y apt-transport-https ca-certificates curl software-properties-common
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
        add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
        apt update
        apt install -y docker-ce docker-ce-cli containerd.io
        systemctl start docker
        systemctl enable docker
        echo "Docker 安装完成"
    else
        echo "Docker 已安装"
    fi
    
    # 运行 MongoDB 容器
    if ! docker ps | grep mongodb &> /dev/null; then
        echo "创建 MongoDB 数据目录..."
        mkdir -p /data/db
        
        echo "启动 MongoDB 容器..."
        docker run -d --name mongodb \
            -v /data/db:/data/db \
            -p 27017:27017 \
            --restart always \
            mongo:6.0
        
        echo "MongoDB Docker 容器启动完成"
    else
        echo "MongoDB Docker 容器已运行"
    fi
    
    # 更新 MongoDB URI
    MONGODB_URI="mongodb://localhost:27017/shopping-system"
else
    MONGODB_URI="mongodb://localhost:27017/shopping-system"
fi

# 部署应用
echo "===== 部署应用 ====="

# 检查项目目录
APP_DIR="/var/www/shopping-system"
if [ ! -d "$APP_DIR" ]; then
    echo "创建应用目录..."
    mkdir -p $APP_DIR
    
    echo "克隆项目仓库..."
    # 替换为您的实际仓库地址
    # git clone https://your-repo-url.git $APP_DIR
    
    # 如果已经有本地代码，请注释上面的git clone，使用以下命令：
    # 假设代码在当前目录
    cp -r ./* $APP_DIR/
else
    echo "应用目录已存在，更新代码..."
    cd $APP_DIR
    # git pull
fi

# 进入项目目录
cd $APP_DIR

# 安装依赖
echo "安装项目依赖..."
pnpm install

# 配置后端
echo "配置后端环境变量..."
mkdir -p apps/api
cat > apps/api/.env << EOL
PORT=3001
MONGODB_URI=$MONGODB_URI
NODE_ENV=production
# 添加其他必要的环境变量
EOL

# 构建后端
echo "构建后端API..."
cd apps/api
pnpm build
cd ../..

# 配置前端
echo "配置前端环境变量..."
mkdir -p apps/web
cat > apps/web/.env.production << EOL
NEXT_PUBLIC_API_URL=http://localhost:3001
# 添加其他必要的环境变量
EOL

# 构建前端
echo "构建前端应用..."
cd apps/web
pnpm build
cd ../..

# 使用PM2启动应用
echo "启动应用服务..."
cd apps/api
pm2 delete shopping-api 2>/dev/null || true
pm2 start dist/index.js --name shopping-api
cd ../..

cd apps/web
pm2 delete shopping-web 2>/dev/null || true
pm2 start npm --name shopping-web -- start
cd ../..

# 保存PM2进程列表
pm2 save
pm2 startup | bash

# 配置Nginx
echo "配置Nginx反向代理..."
cat > /etc/nginx/sites-available/shopping-system << EOL
server {
    listen 80;
    server_name _;  # 替换为您的域名或服务器IP

    # 前端应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # 后端API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# 启用站点配置
ln -sf /etc/nginx/sites-available/shopping-system /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 检查Nginx配置
nginx -t

# 重启Nginx
systemctl restart nginx

# 设置防火墙
echo "配置防火墙..."
if command -v ufw &> /dev/null; then
    ufw allow ssh
    ufw allow http
    ufw allow https
    ufw --force enable
fi

# 创建更新脚本
echo "创建应用更新脚本..."
cat > $APP_DIR/update.sh << EOL
#!/bin/bash
cd $APP_DIR

# 拉取最新代码
# git pull

# 安装依赖
pnpm install

# 构建后端
cd apps/api
pnpm build
cd ../..

# 构建前端
cd apps/web
pnpm build
cd ../..

# 重启服务
pm2 restart shopping-api
pm2 restart shopping-web

echo "更新完成！"
EOL

chmod +x $APP_DIR/update.sh

# 创建MongoDB备份脚本
echo "创建MongoDB备份脚本..."
cat > /var/www/mongodb-backup.sh << EOL
#!/bin/bash
BACKUP_DIR="/var/backups/mongodb"
DATE=\$(date +"%Y-%m-%d-%H-%M")

# 创建备份目录
mkdir -p \$BACKUP_DIR

# 备份数据库
mongodump --out \$BACKUP_DIR/\$DATE

# 删除7天前的备份
find \$BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
EOL

chmod +x /var/www/mongodb-backup.sh

# 添加到定时任务
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/mongodb-backup.sh") | crontab -

echo "===== 部署完成 ====="
echo "前端访问地址: http://服务器IP"
echo "后端API地址: http://服务器IP/api"
echo ""
echo "MongoDB URI: $MONGODB_URI"
echo "PM2状态: "
pm2 status

# 显示有用的命令提示
echo ""
echo "===== 常用命令 ====="
echo "查看服务状态: pm2 status"
echo "查看应用日志: pm2 logs shopping-api 或 pm2 logs shopping-web"
echo "重启应用: pm2 restart shopping-api 或 pm2 restart shopping-web"
echo "更新应用: $APP_DIR/update.sh"
echo "查看MongoDB状态: systemctl status mongod"
echo "查看Nginx日志: tail -f /var/log/nginx/error.log" 