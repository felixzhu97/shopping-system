import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';
import { electronicsProducts } from './productData/electronics';
import { clothingProducts } from './productData/clothing';
import { homeKitchenProducts } from './productData/homeKitchen';
import { booksProducts } from './productData/books';
import { sportsOutdoorsProducts } from './productData/sportsOutdoors';

// 加载环境变量
dotenv.config();

// 连接到MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-system';

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('数据库连接成功');

    // 清除现有产品数据
    await Product.deleteMany({});
    console.log('已清除现有产品数据');

    // 合并所有商品数据
    const allProducts = [
      ...electronicsProducts,
      ...clothingProducts,
      ...homeKitchenProducts,
      ...booksProducts,
      ...sportsOutdoorsProducts,
    ];

    // 检查商品总数
    console.log(`电子产品数量: ${electronicsProducts.length}`);
    console.log(`服装商品数量: ${clothingProducts.length}`);
    console.log(`家居厨房商品数量: ${homeKitchenProducts.length}`);
    console.log(`图书商品数量: ${booksProducts.length}`);
    console.log(`运动户外商品数量: ${sportsOutdoorsProducts.length}`);
    console.log(`总商品数量: ${allProducts.length}`);

    // 插入所有产品数据
    const createdProducts = await Product.insertMany(allProducts);
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
