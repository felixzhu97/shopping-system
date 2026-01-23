import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';
// 不使用类型定义，避免类型错误
// import { Product as SharedProduct } from 'types';

// 导入各个类别的产品数据
import { electronicsProducts } from './productData/electronics';
import { clothingProducts } from './productData/clothing';
import { homeKitchenProducts } from './productData/homeKitchen';
import { booksProducts } from './productData/books';
import { sportsOutdoorsProducts } from './productData/sportsOutdoors';

// 加载环境变量
dotenv.config();

// 生成更多产品数据函数
const generateMoreProducts = () => {
  // 为每个类别生成更多产品
  const generateVariants = (products, targetCount = 40) => {
    const result = [...products]; // 复制原始产品数组
    const originalLength = products.length;

    // 如果原始产品已经超过目标数量，则返回原始数组
    if (originalLength >= targetCount) {
      return result.slice(0, targetCount);
    }

    // 计算需要额外生成的产品数量
    const additionalNeeded = targetCount - originalLength;

    // 循环原始产品，创建变体
    for (let i = 0; i < additionalNeeded; i++) {
      // 选择一个随机的原始产品作为模板
      const baseProduct = products[i % originalLength];

      // 创建变体产品
      const variant = {
        ...baseProduct,
        name: `${baseProduct.name} (变体 ${i + 1})`,
        price: Math.round(baseProduct.price * (0.9 + Math.random() * 0.2) * 10) / 10, // 价格上下浮动10%
        originalPrice:
          Math.round(baseProduct.originalPrice * (0.9 + Math.random() * 0.3) * 10) / 10,
        stock: Math.floor(50 + Math.random() * 150),
        rating: Math.round(baseProduct.rating * (0.9 + Math.random() * 0.2) * 10) / 10,
        reviewCount: Math.floor(baseProduct.reviewCount * (0.7 + Math.random() * 0.6)),
      };

      result.push(variant);
    }

    return result;
  };

  // 为每个类别扩展产品
  const expandedElectronics = generateVariants(electronicsProducts);
  const expandedClothing = generateVariants(clothingProducts);
  const expandedHomeKitchen = generateVariants(homeKitchenProducts);
  const expandedBooks = generateVariants(booksProducts);
  const expandedSportsOutdoors = generateVariants(sportsOutdoorsProducts);

  return [
    ...expandedElectronics,
    ...expandedClothing,
    ...expandedHomeKitchen,
    ...expandedBooks,
    ...expandedSportsOutdoors,
  ];
};

// 生成扩展后的产品列表
const products = generateMoreProducts();

// 连接到MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-system';

const seedEnrichedProducts = async () => {
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

    console.log('丰富的产品数据导入完成！');
    console.log(`总共导入了 ${products.length} 个产品`);

    // 输出每个类别的产品数量
    const categoryCounts = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    console.log('各类别产品数量:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`- ${category}: ${count}个产品`);
    });
  } catch (error) {
    console.error('产品数据导入失败:', error);
  }
};

// 执行数据导入
seedEnrichedProducts();
