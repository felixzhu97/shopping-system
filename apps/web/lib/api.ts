// API基础URL - 使用代理路由
const API_BASE_URL = '/api/proxy';

// 产品API基础URL（使用代理路由）
const PRODUCTS_API_URL = '/api/products';

// 购物车API基础URL（使用代理路由）
const CART_API_URL = '/api/cart';

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
    image: '/electronics.jpg',
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
    image: '/tshirt.jpg',
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
    image: '/cookware.jpg',
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
    image: '/books.jpg',
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
  // 使用产品专用代理路由
  const url = category
    ? `${PRODUCTS_API_URL}?category=${encodeURIComponent(category)}`
    : PRODUCTS_API_URL;

  console.log('获取产品列表URL:', url);

  try {
    const response = await fetch(url, {
      cache: 'no-store', // 强制服务器端请求，忽略缓存
    });

    if (!response.ok) {
      console.error('API响应错误:', response.status, response.statusText);
      throw new Error(`获取产品失败: ${response.status}`);
    }

    const data = await response.json();
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
  // 检查ID是否为模拟ID格式(以mock-开头)
  if (id.startsWith('mock-')) {
    console.log('检测到模拟ID，直接返回模拟数据');
    const mockId = id;
    const mockProduct = MOCK_PRODUCTS.find(p => p.id === mockId);
    if (mockProduct) {
      return mockProduct;
    }
    // 如果找不到指定ID的产品，返回第一个作为替代
    return MOCK_PRODUCTS[0];
  }

  const url = `${PRODUCTS_API_URL}/${id}`;
  console.log('获取产品详情URL:', url);

  try {
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
    // 尝试查找编号相同的模拟产品
    const numericId = id.replace(/\D/g, '');
    const mockProduct = MOCK_PRODUCTS.find(
      p => p.id === `mock-${numericId}` || p.id.endsWith(numericId)
    );
    if (mockProduct) {
      return mockProduct;
    }
    // 如果找不到指定ID的产品，返回第一个作为替代
    return MOCK_PRODUCTS[0];
  }
}

// 获取购物车
export async function getCart(userId: string) {
  const url = `${CART_API_URL}/${userId}`;
  console.log('获取购物车URL:', url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`获取购物车失败: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('获取购物车失败:', error);
    // 对于购物车，返回空数据作为后备
    return { items: [] };
  }
}

// 添加商品到购物车
export async function addToCart(userId: string, productId: string, quantity: number) {
  const url = `${CART_API_URL}/${userId}`;
  console.log('添加到购物车URL:', url);

  try {
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
  } catch (error) {
    console.error('添加商品到购物车失败:', error);
    return { success: false, error: '添加失败，请稍后再试' };
  }
}

// 更新购物车商品数量
export async function updateCartItem(userId: string, productId: string, quantity: number) {
  const url = `${CART_API_URL}/${userId}/item/${productId}`;
  console.log('更新购物车URL:', url);

  try {
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
  } catch (error) {
    console.error('更新购物车商品数量失败:', error);
    return { success: false, error: '更新失败，请稍后再试' };
  }
}

// 从购物车中移除商品
export async function removeFromCart(userId: string, productId: string) {
  const url = `${CART_API_URL}/${userId}/item/${productId}`;
  console.log('从购物车移除URL:', url);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`从购物车移除商品失败: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('从购物车移除商品失败:', error);
    return { success: false, error: '移除失败，请稍后再试' };
  }
}

// 清空购物车
export async function clearCart(userId: string) {
  const url = `${CART_API_URL}/${userId}`;
  console.log('清空购物车URL:', url);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`清空购物车失败: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('清空购物车失败:', error);
    return { success: false, error: '清空失败，请稍后再试' };
  }
}
