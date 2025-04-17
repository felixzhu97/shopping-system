import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// MongoDB连接URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-system';

// 连接选项
const options = {
  autoIndex: true, // 构建索引
  serverSelectionTimeoutMS: 5000, // 选择服务器超时
  socketTimeoutMS: 45000, // 套接字超时
  family: 4, // 强制IPv4
};

// 连接状态跟踪
let isConnected = false;

/**
 * 连接到MongoDB数据库
 */
export const connectDB = async (): Promise<void> => {
  // 如果已连接，则返回
  if (isConnected) {
    console.log('已经连接到MongoDB数据库');
    return;
  }

  try {
    // 连接MongoDB
    await mongoose.connect(MONGODB_URI, options);

    isConnected = true;
    console.log('MongoDB数据库连接成功');

    // 监听连接事件
    mongoose.connection.on('error', err => {
      console.error('MongoDB连接错误:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB连接断开');
      isConnected = false;
    });

    // 应用关闭时优雅地关闭连接
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB连接已关闭（应用终止）');
      process.exit(0);
    });
  } catch (error) {
    isConnected = false;
    console.error('MongoDB连接失败:', error);
    // 如果是在服务器启动时，则终止进程
    throw error;
  }
};

/**
 * 关闭MongoDB连接
 */
export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log('MongoDB连接已关闭');
  } catch (error) {
    console.error('关闭MongoDB连接时出错:', error);
    throw error;
  }
};

/**
 * 获取MongoDB连接状态
 */
export const getConnectionStatus = (): boolean => {
  return isConnected;
};

/**
 * 获取当前的Mongoose连接实例
 */
export const getConnection = () => {
  return mongoose.connection;
};

export default {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  getConnection,
};
