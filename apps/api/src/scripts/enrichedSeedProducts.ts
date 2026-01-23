import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';
import { Product as SharedProduct } from 'types';

// 加载环境变量
dotenv.config();

// 更丰富的产品数据
const products: Omit<SharedProduct, 'id'>[] = [
  // 电子产品
  {
    name: 'Apple iPhone 13',
    description:
      'iPhone 13 配备超强的 A15 仿生芯片，超长的电池续航，以及 5G 网络支持，提供卓越的性能体验。6.1 英寸超视网膜 XDR 显示屏，双摄系统，支持夜间模式。',
    price: 5999.0,
    originalPrice: 6799.0,
    image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=1000',
    category: 'Electronics',
    stock: 85,
    rating: 4.8,
    reviewCount: 245,
    inStock: true,
  },
  {
    name: 'Samsung Galaxy S21',
    description:
      'Galaxy S21 采用高通骁龙 888 处理器，120Hz 高刷新率显示屏，提供流畅的操作体验。强大的三摄系统，8K 视频录制，全天候电池续航。',
    price: 4599.0,
    originalPrice: 5299.0,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=1000',
    category: 'Electronics',
    stock: 62,
    rating: 4.6,
    reviewCount: 183,
    inStock: true,
  },
  {
    name: 'Sony WH-1000XM4 无线降噪耳机',
    description:
      '行业领先的降噪技术，长达 30 小时的电池续航，支持 LDAC 高分辨率音频，佩戴检测和自适应声音控制，为您提供沉浸式聆听体验。',
    price: 2299.0,
    originalPrice: 2699.0,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000',
    category: 'Electronics',
    stock: 120,
    rating: 4.9,
    reviewCount: 328,
    inStock: true,
  },
  {
    name: 'Apple MacBook Pro 14英寸',
    description:
      '搭载 M1 Pro 芯片，Liquid Retina XDR 显示屏，提供极致的性能和显示效果。16GB 统一内存，512GB SSD 存储，满足专业创作需求。',
    price: 14999.0,
    originalPrice: 15999.0,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000',
    category: 'Electronics',
    stock: 45,
    rating: 4.8,
    reviewCount: 156,
    inStock: true,
  },
  {
    name: 'iPad Air 5',
    description:
      'iPad Air 搭载 M1 芯片，提供无与伦比的性能。10.9 英寸 Liquid Retina 显示屏，支持 Apple Pencil 和 Magic Keyboard，工作娱乐两相宜。',
    price: 4399.0,
    originalPrice: 4799.0,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1000',
    category: 'Electronics',
    stock: 73,
    rating: 4.7,
    reviewCount: 192,
    inStock: true,
  },
  {
    name: '华为 Watch GT3 Pro',
    description:
      '钛金属表壳，蓝宝石表镜，14 天超长续航，100+ 运动模式，专业健康监测，全天候血氧监测，IP68 防水防尘。',
    price: 2488.0,
    originalPrice: 2788.0,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1000',
    category: 'Electronics',
    stock: 98,
    rating: 4.6,
    reviewCount: 145,
    inStock: true,
  },
  {
    name: '小米智能音箱Pro',
    description:
      '360°环绕音效，内置小爱同学，智能家居控制中心，高保真音质，远场语音识别，支持多种音乐平台。',
    price: 299.0,
    originalPrice: 349.0,
    image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=1000',
    category: 'Electronics',
    stock: 150,
    rating: 4.3,
    reviewCount: 213,
    inStock: true,
  },
  {
    name: 'DJI Mini 3 Pro 无人机',
    description:
      '重量不到 249g，4K/60fps 视频，三向避障系统，长达 34 分钟飞行时间，10 公里高清图传，适合航拍入门和专业用户。',
    price: 4788.0,
    originalPrice: 5288.0,
    image: 'https://images.unsplash.com/photo-1521405924368-64c5b84bec60?q=80&w=1000',
    category: 'Electronics',
    stock: 35,
    rating: 4.8,
    reviewCount: 87,
    inStock: true,
  },

  // 服装类
  {
    name: '优衣库男士保暖内衣套装',
    description: 'HeatTech 科技面料，轻薄保暖，柔软舒适，多色可选，适合日常穿着和户外活动。',
    price: 199.0,
    originalPrice: 249.0,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000',
    category: 'Clothing',
    stock: 200,
    rating: 4.5,
    reviewCount: 326,
    inStock: true,
  },
  {
    name: 'Nike Air Force 1 经典运动鞋',
    description: '经典设计，耐磨橡胶外底，柔软中底，皮革鞋面，百搭款式，舒适耐穿。',
    price: 799.0,
    originalPrice: 899.0,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000',
    category: 'Clothing',
    stock: 85,
    rating: 4.7,
    reviewCount: 412,
    inStock: true,
  },
  {
    name: "Levi's 501 经典牛仔裤",
    description: '经典直筒设计，优质棉料，耐穿舒适，经典五袋设计，适合各种场合穿着。',
    price: 499.0,
    originalPrice: 599.0,
    image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?q=80&w=1000',
    category: 'Clothing',
    stock: 120,
    rating: 4.6,
    reviewCount: 287,
    inStock: true,
  },
  {
    name: '北面防风防水冲锋衣',
    description: 'GORE-TEX 防水透气科技，三合一设计，可拆卸内胆，适合户外探险和城市通勤。',
    price: 1799.0,
    originalPrice: 2099.0,
    image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=1000',
    category: 'Clothing',
    stock: 60,
    rating: 4.8,
    reviewCount: 158,
    inStock: true,
  },
  {
    name: '阿迪达斯运动套装',
    description: '吸汗速干面料，舒适剪裁，经典三条纹设计，适合运动和休闲穿着。',
    price: 599.0,
    originalPrice: 699.0,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000',
    category: 'Clothing',
    stock: 90,
    rating: 4.4,
    reviewCount: 203,
    inStock: true,
  },

  // 家居厨房
  {
    name: '摩飞电热水壶',
    description: '食品级不锈钢内胆，精准温控，保温功能，快速沸腾，多色可选，现代简约设计。',
    price: 299.0,
    originalPrice: 369.0,
    image: 'https://images.unsplash.com/photo-1622088934558-b729cf3c8cf8?q=80&w=1000',
    category: 'Home & Kitchen',
    stock: 120,
    rating: 4.6,
    reviewCount: 247,
    inStock: true,
  },
  {
    name: '九阳破壁料理机',
    description: '1200W 大功率，8 叶钛合金刀头，多功能一体机，可制作豆浆、果汁、辅食等。',
    price: 799.0,
    originalPrice: 999.0,
    image: 'https://images.unsplash.com/photo-1585237017125-24baf8d7406f?q=80&w=1000',
    category: 'Home & Kitchen',
    stock: 85,
    rating: 4.5,
    reviewCount: 186,
    inStock: true,
  },
  {
    name: '宜家简约沙发',
    description: '北欧风格设计，可拆洗布套，舒适座垫，坚固实木框架，多色可选，适合各种居室。',
    price: 2499.0,
    originalPrice: 2999.0,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000',
    category: 'Home & Kitchen',
    stock: 30,
    rating: 4.7,
    reviewCount: 124,
    inStock: true,
  },
  {
    name: '德国WMF不锈钢锅具套装',
    description: '18/10 优质不锈钢，三层复合底，适用各种炉灶，包含煎锅、炖锅、奶锅等。',
    price: 1999.0,
    originalPrice: 2499.0,
    image: 'https://images.unsplash.com/photo-1584284697782-257d29e7d8f1?q=80&w=1000',
    category: 'Home & Kitchen',
    stock: 40,
    rating: 4.8,
    reviewCount: 93,
    inStock: true,
  },
  {
    name: 'Dyson V11 无线吸尘器',
    description:
      '强劲吸力，智能自动调节，LCD 屏幕显示，长达 60 分钟续航，多种吸头适应不同清洁需求。',
    price: 3999.0,
    originalPrice: 4499.0,
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=1000',
    category: 'Home & Kitchen',
    stock: 25,
    rating: 4.9,
    reviewCount: 157,
    inStock: true,
  },

  // 图书
  {
    name: '《人类简史》',
    description:
      '尤瓦尔·赫拉利著，全球畅销书，从人类进化的角度讲述历史，带你重新认识人类社会的发展历程。',
    price: 58.0,
    originalPrice: 68.0,
    image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=1000',
    category: 'Books',
    stock: 150,
    rating: 4.8,
    reviewCount: 421,
    inStock: true,
  },
  {
    name: '《金字塔原理》',
    description: '芭芭拉·明托著，思考、表达和解决问题的逻辑，商业写作和思维训练的经典著作。',
    price: 45.0,
    originalPrice: 55.0,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000',
    category: 'Books',
    stock: 100,
    rating: 4.7,
    reviewCount: 263,
    inStock: true,
  },
  {
    name: '《三体》三部曲',
    description:
      '刘慈欣著，雨果奖获奖作品，中国科幻文学的代表作，描绘了人类文明与三体文明的壮阔故事。',
    price: 158.0,
    originalPrice: 198.0,
    image: 'https://images.unsplash.com/photo-1629992101753-56d196c8aabb?q=80&w=1000',
    category: 'Books',
    stock: 80,
    rating: 4.9,
    reviewCount: 536,
    inStock: true,
  },
  {
    name: '《小王子》精装彩绘版',
    description: '圣埃克苏佩里著，经典童话故事，关于爱、责任和人生的寓言，附赠精美插画。',
    price: 42.0,
    originalPrice: 49.0,
    image: 'https://images.unsplash.com/photo-1514593214839-ce0a9a87dd17?q=80&w=1000',
    category: 'Books',
    stock: 120,
    rating: 4.8,
    reviewCount: 348,
    inStock: true,
  },
  {
    name: '《明朝那些事儿》全集',
    description: '当年明月著，通俗易懂的明朝历史，用幽默的语言讲述了明朝276年的历史风云。',
    price: 268.0,
    originalPrice: 328.0,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000',
    category: 'Books',
    stock: 60,
    rating: 4.7,
    reviewCount: 412,
    inStock: true,
  },

  // 运动户外
  {
    name: '瑜伽垫防滑加厚',
    description: 'TPE环保材质，双面防滑，加厚8mm，回弹性好，耐用易清洁，附赠背带，多色可选。',
    price: 129.0,
    originalPrice: 159.0,
    image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?q=80&w=1000',
    category: 'Sports & Outdoors',
    stock: 200,
    rating: 4.5,
    reviewCount: 278,
    inStock: true,
  },
  {
    name: '特步跑步鞋气垫减震',
    description: '轻量化设计，气垫减震，透气网面，防滑耐磨大底，适合日常跑步和健身。',
    price: 239.0,
    originalPrice: 299.0,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000',
    category: 'Sports & Outdoors',
    stock: 150,
    rating: 4.3,
    reviewCount: 196,
    inStock: true,
  },
  {
    name: '迪卡侬帐篷户外露营',
    description: '2-3人双层帐篷，防风防雨，搭建简单，通风透气，适合野营和户外活动。',
    price: 399.0,
    originalPrice: 499.0,
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1000',
    category: 'Sports & Outdoors',
    stock: 60,
    rating: 4.6,
    reviewCount: 124,
    inStock: true,
  },
  {
    name: '探路者登山包',
    description: '40L大容量，耐磨防泼水，科学减负系统，多功能分区，适合登山徒步和旅行。',
    price: 329.0,
    originalPrice: 399.0,
    image: 'https://images.unsplash.com/photo-1596207891316-23851be3cc20?q=80&w=1000',
    category: 'Sports & Outdoors',
    stock: 80,
    rating: 4.5,
    reviewCount: 157,
    inStock: true,
  },
];

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
  } catch (error) {
    console.error('产品数据导入失败:', error);
  }
};

// 执行数据导入
seedEnrichedProducts();
