import { NextRequest, NextResponse } from 'next/server';

// 产品详情API基础URL - 使用Lambda部署的实际API
const PRODUCT_API_URL = 'https://guczejbq56.execute-api.ap-east-1.amazonaws.com/dev/api';

// 模拟产品数据
const mockProducts = [
  {
    id: '1',
    name: '智能手机',
    description: '高性能5G智能手机，搭载最新处理器和高清摄像头。',
    price: 3999,
    originalPrice: 4599,
    image: '/assets/products/phone.jpg',
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
    image: '/assets/products/tshirt.jpg',
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
    image: '/assets/products/kitchenware.jpg',
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
    image: '/assets/products/books.jpg',
    category: 'Books',
    stock: 25,
    rating: 4.8,
    reviewCount: 42,
    inStock: true,
  },
];

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

// 获取单个产品详情的GET请求处理
export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  const productId = params.productId;

  try {
    // 构建API URL
    const apiUrl = `${PRODUCT_API_URL}/products/${productId}`;

    console.log('请求产品详情API:', apiUrl);

    // 尝试从实际API获取产品数据
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: 'https://shopping-system-git-release-felixzhu97s-projects.vercel.app',
      },
      cache: 'no-store',
    });

    // 如果API请求成功，返回产品数据
    if (apiResponse.ok) {
      const product = await apiResponse.json();
      console.log('产品详情获取成功:', product?.name || 'unknown product');
      const response = NextResponse.json(product);
      return setCorsHeaders(response);
    }

    // 如果API请求失败，尝试从模拟数据中获取产品
    console.log(`API请求失败 (${apiResponse.status}), 使用模拟数据`);
    const mockProduct = mockProducts.find(p => p.id === productId);

    if (mockProduct) {
      const response = NextResponse.json(mockProduct);
      return setCorsHeaders(response);
    }

    // 如果找不到产品，返回404
    const errorResponse = NextResponse.json(
      { error: `产品ID: ${productId} 未找到` },
      { status: 404 }
    );
    return setCorsHeaders(errorResponse);
  } catch (error) {
    console.error('获取产品详情时出错:', error);

    // 发生错误时，尝试返回模拟产品数据
    const mockProduct = mockProducts.find(p => p.id === productId);

    if (mockProduct) {
      const response = NextResponse.json(mockProduct);
      return setCorsHeaders(response);
    }

    // 如果模拟数据中也没有相应产品，返回服务器错误
    const errorResponse = NextResponse.json({ error: '获取产品详情失败' }, { status: 500 });
    return setCorsHeaders(errorResponse);
  }
}
