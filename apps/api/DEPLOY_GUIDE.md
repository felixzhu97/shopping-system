# API服务部署指南（无需备案方案）

本指南提供了几种无需ICP备案即可部署API服务的方法。

## 选项1: Vercel 部署（最简单）

1. 安装 Vercel CLI:

```bash
npm install -g vercel
```

2. 登录 Vercel:

```bash
vercel login
```

3. 进入API目录并部署:

```bash
cd apps/api
vercel --prod
```

4. 设置环境变量（在Vercel控制台）:
   - `MONGODB_URI`: 你的MongoDB连接URL
   - `JWT_SECRET`: JWT密钥
   - `CORS_ORIGINS`: 逗号分隔的前端域名列表

## 选项2: Fly.io 部署（亚太节点，中国访问更稳定）

1. 安装 Flyctl:

```bash
curl -L https://fly.io/install.sh | sh
```

2. 登录:

```bash
fly auth login
```

3. 启动部署:

```bash
cd apps/api
fly launch
```

4. 使用现有配置:

```bash
fly deploy
```

5. 设置秘钥:

```bash
fly secrets set MONGODB_URI="mongodb+srv://..."
fly secrets set JWT_SECRET="your_jwt_secret"
```

## 选项3: 香港/新加坡云服务器

### 阿里云/腾讯云香港节点

1. 购买香港/新加坡轻量应用服务器
2. 安装Node.js环境:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. 安装PM2:

```bash
npm install -g pm2
```

4. 克隆项目并设置:

```bash
git clone [你的仓库URL]
cd shopping-system
cp apps/api/.env.example apps/api/.env
# 编辑.env文件设置环境变量
```

5. 构建并启动:

```bash
cd apps/api
npm install
npm run build
pm2 start dist/index.js --name "shopping-api"
```

6. 设置自动启动:

```bash
pm2 startup
pm2 save
```

## 数据库选择

对于无需备案方案，推荐使用以下数据库服务:

1. **MongoDB Atlas** (最简单):

   - 提供免费套餐
   - 可选香港/东京/新加坡节点
   - 自动备份和扩展

2. **阿里云MongoDB** (香港区域):
   - 较好的性能和稳定性
   - 有管理界面
   - 定价略高

## 优化中国大陆访问速度

1. 使用 Cloudflare 加速:

   - 注册Cloudflare并添加你的域名
   - 设置CNAME记录指向你的API服务
   - 启用CDN和智能路由

2. 确保CORS配置正确，允许你的前端域名访问

## 监控

对于生产环境API服务，建议设置监控:

1. 对于Vercel/Fly.io - 使用内置监控
2. 对于自建服务器 - 使用PM2 plus或Uptime Robot

## 问题排查

如果部署后API无法访问:

1. 检查服务器防火墙设置
2. 验证MongoDB连接字符串
3. 检查环境变量是否正确设置
4. 查看服务器日志 `pm2 logs`
