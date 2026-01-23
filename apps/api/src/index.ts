// Initialize Datadog APM before any other imports
import { initDatadogAPM } from 'monitoring';
initDatadogAPM();

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './swagger';
import { expressjwt } from 'express-jwt';

// 路由导入
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import userRoutes from './routes/users';
import orderRoutes from './routes/orders';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-system';

export const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'your_jwt_secret';
};
const jwtSecret = getJwtSecret();

// JWT 鉴权中间件
const jwtAuth = expressjwt({
  secret: jwtSecret,
  algorithms: ['HS256'],
}).unless({
  path: [
    '/api/users/register',
    '/api/users/login',
    '/api/users/reset-password',
    '/health',
    /^\/api\/products.*/,
    /^\/api\/cart.*/,
  ],
});

// 中间件
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(jwtAuth);
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    // express-jwt 校验失败
    return res.status(401).json({ status: 'error', message: 'Token无效或已过期' });
  }
  next(err);
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Swagger文档路由
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// 路由
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// 数据库连接
mongoose
  .connect(MONGODB_URI, {
    // MongoDB连接选项，提高稳定性
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('数据库连接成功');
    // 启动服务器 - 绑定到所有网络接口
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`后端API服务运行在 http://0.0.0.0:${PORT}`);
      console.log(`局域网访问地址: http://192.168.3.18:${PORT}`);
    });

    // 优雅关闭
    process.on('SIGTERM', () => {
      console.log('SIGTERM信号收到，优雅关闭中...');
      server.close(() => {
        console.log('HTTP服务已关闭');
        // 不带参数关闭MongoDB连接
        mongoose.connection
          .close()
          .then(() => {
            console.log('MongoDB连接已关闭');
            process.exit(0);
          })
          .catch(err => {
            console.error('关闭MongoDB连接时出错:', err);
            process.exit(1);
          });
      });
    });
  })
  .catch(error => {
    console.error('数据库连接失败:', error);
  });

// 错误处理中间件
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: '服务器内部错误',
  });
});

export default app; // 导出app以便Vercel可以导入
