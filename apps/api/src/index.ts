import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './swagger';

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

// 中间件
app.use(cors());
app.use(express.json());

// Swagger文档路由
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// 路由
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// 数据库连接
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('数据库连接成功');
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`后端API服务运行在 http://localhost:${PORT}`);
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
