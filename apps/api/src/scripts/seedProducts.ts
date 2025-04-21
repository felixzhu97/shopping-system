import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';

// 加载环境变量
dotenv.config();

// 前端静态产品数据
const products = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: '高品质无线蓝牙耳机，带有降噪功能',
    price: 79.99,
    image: '/headphones.jpg',
    category: 'Electronics',
    stock: 100,
  },
  {
    name: 'Smart Watch with Heart Rate Monitor',
    description: '智能手表，具有心率监测和多种健康功能',
    price: 129.99,
    image: '/smartwatch.jpg',
    category: 'Electronics',
    stock: 50,
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: '柔软舒适的有机棉T恤',
    price: 24.99,
    image: '/tshirt.jpg',
    category: 'Clothing',
    stock: 200,
  },
  {
    name: 'Non-Stick Cooking Set',
    description: '高质量不粘锅炊具套装，适合各种烹饪需求',
    price: 89.99,
    image: '/cookware.jpg',
    category: 'Home & Kitchen',
    stock: 30,
  },
  {
    name: 'Wireless Charging Pad',
    description: '便捷的无线充电板，兼容多种设备',
    price: 29.99,
    image: '/charger.jpg',
    category: 'Electronics',
    stock: 150,
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: '便携式蓝牙音箱，音质出色',
    price: 49.99,
    image: '/electronics.jpg',
    category: 'Electronics',
    stock: 80,
  },
  {
    name: 'Slim Fit Jeans',
    description: '时尚修身牛仔裤，舒适耐穿',
    price: 39.99,
    image: '/clothing.jpg',
    category: 'Clothing',
    stock: 120,
  },
  {
    name: 'Winter Jacket',
    description: '保暖冬季夹克，防风防水',
    price: 89.99,
    image: '/clothing.jpg',
    category: 'Clothing',
    stock: 40,
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: '不锈钢保温水瓶，环保耐用',
    price: 19.99,
    image: '/home-kitchen.jpg',
    category: 'Home & Kitchen',
    stock: 200,
  },
  {
    name: 'Coffee Maker',
    description: '多功能咖啡机，操作简便',
    price: 79.99,
    image: '/home-kitchen.jpg',
    category: 'Home & Kitchen',
    stock: 60,
  },
  {
    name: 'Bestselling Novel',
    description: '畅销小说，引人入胜的情节',
    price: 14.99,
    image: '/books.jpg',
    category: 'Books',
    stock: 300,
  },
  {
    name: 'Cookbook Collection',
    description: '精选烹饪书籍集合，包含多种菜系食谱',
    price: 34.99,
    image: '/books.jpg',
    category: 'Books',
    stock: 75,
  },
];

// 连接到MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-system';

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('数据库连接成功');

    // 清除现有产品数据
    await Product.deleteMany({});
    console.log('已清除现有产品数据');

    // 插入新产品数据
    const createdProducts = await Product.insertMany(products);
    console.log(`成功导入 ${createdProducts.length} 个产品`);

    // 断开数据库连接
    await mongoose.disconnect();
    console.log('数据库连接已关闭');

    console.log('数据导入完成！');
  } catch (error) {
    console.error('产品数据导入失败:', error);
  }
};

// 执行数据导入
seedProducts();
