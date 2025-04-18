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

// 定义产品类型
interface ProductType {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

// 组合所有产品数据
const combinedProducts: ProductType[] = [
  ...electronicsProducts,
  ...clothingProducts,
  ...homeKitchenProducts,
  ...booksProducts,
  ...sportsOutdoorsProducts,
];

// 通过混合和选择形成200个产品的数组
// 如果所有类别的产品数量总共不足200个，可能需要复制一些产品
const getTwoHundredProducts = (): ProductType[] => {
  const shuffledProducts = [...combinedProducts].sort(() => 0.5 - Math.random());

  // 如果产品总数不足200个，则复制产品直到达到200个
  let resultProducts: ProductType[] = [];
  while (resultProducts.length < 200) {
    // 每次添加所有产品或剩余所需数量的产品
    const remainingNeeded = 200 - resultProducts.length;
    const productsToAdd = shuffledProducts.slice(
      0,
      Math.min(remainingNeeded, shuffledProducts.length)
    );
    resultProducts = [...resultProducts, ...productsToAdd];
  }

  // 确保只返回200个产品
  return resultProducts.slice(0, 200);
};

const products = getTwoHundredProducts();

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

    // 输出每个类别的产品数量
    const categories: Record<string, number> = {};
    createdProducts.forEach(product => {
      const category = product.category;
      categories[category] = (categories[category] || 0) + 1;
    });

    console.log('各类别产品数量:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`${category}: ${count}个产品`);
    });

    // 断开数据库连接
    await mongoose.disconnect();
    console.log('数据库连接已关闭');

    console.log('数据导入完成！总共导入200个产品');
  } catch (error) {
    console.error('产品数据导入失败:', error);
    process.exit(1);
  }
};

// 执行数据导入
seedProducts();
