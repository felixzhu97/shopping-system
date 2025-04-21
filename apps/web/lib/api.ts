// API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

// 判断是否在构建环境中
const IS_BUILD_TIME =
  process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production';

// 构建时的模拟产品数据
const MOCK_PRODUCTS = [
  {
    id: 'mock-1',
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
    id: 'mock-2',
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
    id: 'mock-3',
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
    id: 'mock-4',
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

// 类别名称映射表，将前端URL参数映射到后端数据库格式
const categoryMapping: Record<string, string> = {
  electronics: 'Electronics',
  clothing: 'Clothing',
  'home-kitchen': 'Home & Kitchen',
  books: 'Books',
};

// 获取所有产品
export async function getProducts(category?: string) {
  // 如果在构建时调用API，返回模拟数据
  if (IS_BUILD_TIME) {
    console.log('在构建过程中使用模拟数据');
    // 如果指定了分类，则过滤模拟数据
    if (category) {
      const mappedCategory = categoryMapping[category] || category;
      return MOCK_PRODUCTS.filter(p => p.category === mappedCategory);
    }
    return MOCK_PRODUCTS;
  }

  // 转换类别格式
  let mappedCategory = category;
  if (category && categoryMapping[category]) {
    mappedCategory = categoryMapping[category];
  }

  // 特殊处理 Home & Kitchen 类别
  const encodedCategory = mappedCategory ? encodeURIComponent(mappedCategory) : '';
  const url = `${API_BASE_URL}/products${encodedCategory ? `?category=${encodedCategory}` : ''}`;

  // 调试日志
  console.log('Fetching products URL:', url);

  try {
    const response = await fetch(url, {
      cache: 'no-store', // 强制服务器端请求，忽略缓存
    });

    if (!response.ok) {
      console.error('API响应错误:', response.status, response.statusText);
      throw new Error(`获取产品失败: ${response.status}`);
    }

    const data = await response.json();
    // 调试日志
    console.log(`获取到 ${data.length || 0} 个产品`);

    return data;
  } catch (error) {
    console.error('获取产品数据时出错:', error);
    // 如果API请求失败，返回模拟数据作为后备
    console.log('API请求失败，使用模拟数据作为后备');
    if (category) {
      const mappedCategory = categoryMapping[category] || category;
      return MOCK_PRODUCTS.filter(p => p.category === mappedCategory);
    }
    return MOCK_PRODUCTS;
  }
}

// 获取单个产品
export async function getProduct(id: string) {
  // 如果在构建时调用API，返回模拟数据
  if (IS_BUILD_TIME) {
    const mockProduct = MOCK_PRODUCTS.find(p => p.id === id);
    if (mockProduct) {
      return mockProduct;
    }
    // 如果找不到指定ID的产品，返回第一个作为替代
    return MOCK_PRODUCTS[0];
  }

  try {
    const url = `${API_BASE_URL}/products/${id}`;
    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`获取产品详情失败: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('获取产品详情时出错:', error);
    // 如果API请求失败，返回模拟数据作为后备
    const mockProduct = MOCK_PRODUCTS.find(p => p.id === id);
    if (mockProduct) {
      return mockProduct;
    }
    // 如果找不到指定ID的产品，返回第一个作为替代
    return MOCK_PRODUCTS[0];
  }
}

// 获取购物车
export async function getCart(userId: string) {
  const url = `${API_BASE_URL}/cart/${userId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`获取购物车失败: ${response.status}`);
  }

  return response.json();
}

// 添加商品到购物车
export async function addToCart(userId: string, productId: string, quantity: number) {
  const url = `${API_BASE_URL}/cart/${userId}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, quantity }),
  });

  if (!response.ok) {
    throw new Error(`添加商品到购物车失败: ${response.status}`);
  }

  return response.json();
}

// 更新购物车商品数量
export async function updateCartItem(userId: string, productId: string, quantity: number) {
  const url = `${API_BASE_URL}/cart/${userId}/item/${productId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    throw new Error(`更新购物车商品数量失败: ${response.status}`);
  }

  return response.json();
}

// 从购物车中移除商品
export async function removeFromCart(userId: string, productId: string) {
  const url = `${API_BASE_URL}/cart/${userId}/item/${productId}`;
  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`从购物车移除商品失败: ${response.status}`);
  }

  return response.json();
}

// 清空购物车
export async function clearCart(userId: string) {
  const url = `${API_BASE_URL}/cart/${userId}`;
  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`清空购物车失败: ${response.status}`);
  }

  return response.json();
}
