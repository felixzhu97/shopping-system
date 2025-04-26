import { NextRequest, NextResponse } from 'next/server';

// 产品API基础URL - 使用本地后台服务
const PRODUCT_API_URL = process.env.NEXT_PUBLIC_API_URL;

// 模拟产品数据
const mockProducts = [
  {
    id: '1',
    name: '智能手机',
    description: '高性能5G智能手机，搭载最新处理器和高清摄像头。',
    price: 3999,
    originalPrice: 4599,
    image: '/electronics.jpg',
    category: 'Electronics',
    stock: 10,
    rating: 4.5,
    reviewCount: 120,
    inStock: true,
  },
  {
    id: '2',
    name: '休闲T恤',
    description: '舒适透气的纯棉T恤，适合日常穿着。',
    price: 99,
    originalPrice: 129,
    image: '/tshirt.jpg',
    category: 'Clothing',
    stock: 50,
    rating: 4.2,
    reviewCount: 85,
    inStock: true,
  },
  {
    id: '3',
    name: '不锈钢厨房刀具套装',
    description: '专业级厨房刀具套装，锋利耐用。',
    price: 299,
    originalPrice: 399,
    image: '/cookware.jpg',
    category: 'Home & Kitchen',
    stock: 15,
    rating: 4.7,
    reviewCount: 65,
    inStock: true,
  },
  {
    id: '4',
    name: '经典文学全集',
    description: '世界名著精选集，精装版。',
    price: 199,
    originalPrice: 249,
    image: '/books.jpg',
    category: 'Books',
    stock: 25,
    rating: 4.8,
    reviewCount: 42,
    inStock: true,
  },
  {
    id: '5',
    name: 'Wireless Charging Pad',
    price: 29.99,
    description: '快速无线充电，兼容各种设备',
    originalPrice: 39.99,
    category: 'Electronics',
    rating: 4.1,
    reviewCount: 76,
    inStock: true,
    stock: 100,
    image: '/charger.jpg',
  },
  {
    id: '6',
    name: 'Portable Bluetooth Speaker',
    price: 49.99,
    description: '高品质音效，防水便携设计',
    originalPrice: 69.99,
    category: 'Electronics',
    rating: 4.3,
    reviewCount: 112,
    inStock: true,
    stock: 80,
    image: '/electronics.jpg',
  },
  {
    id: '7',
    name: 'Slim Fit Jeans',
    price: 39.99,
    description: '舒适修身牛仔裤，多种颜色可选',
    category: 'Clothing',
    rating: 3.9,
    reviewCount: 64,
    inStock: true,
    stock: 60,
    image: '/clothing.jpg',
  },
];

// 类别名称映射表，将前端URL参数映射到后端数据库格式
const categoryMapping: Record<string, string> = {
  electronics: 'Electronics',
  clothing: 'Clothing',
  'home-kitchen': 'Home & Kitchen',
  books: 'Books',
};

// 设置CORS头部
function setCorsHeaders(response: NextResponse) {
  // 允许所有来源访问
  response.headers.set('Access-Control-Allow-Origin', '*');
  // 允许的HTTP方法
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // 允许的请求头
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // 缓存CORS预检结果
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

// 处理OPTIONS请求（预检请求）
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 }); // No content for OPTIONS
  return setCorsHeaders(response);
}

// 产品列表API的GET请求处理
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // 构建API URL
    const apiUrl = category
      ? `${PRODUCT_API_URL}/products?category=${encodeURIComponent(category)}`
      : `${PRODUCT_API_URL}/products`;

    console.log('获取产品列表URL:', apiUrl);

    // 尝试从实际API获取产品数据
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (apiResponse.ok) {
      const data = await apiResponse.json();
      return NextResponse.json(data);
    }

    // 如果API请求失败，返回模拟数据
    console.log('API请求失败，使用模拟数据');
    if (category) {
      const mappedCategory = categoryMapping[category] || category;
      const filteredProducts = mockProducts.filter(p => p.category === mappedCategory);
      return NextResponse.json(filteredProducts);
    }
    return NextResponse.json(mockProducts);
  } catch (error) {
    console.error('获取产品数据时出错:', error);
    // 发生错误时返回模拟数据
    return NextResponse.json(mockProducts);
  }
}
