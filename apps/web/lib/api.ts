// API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// 获取所有产品
export async function getProducts(category?: string) {
  const url = `${API_BASE_URL}/products${category ? `?category=${category}` : ''}`;
  const response = await fetch(url, {
    cache: 'no-store', // 强制服务器端请求，忽略缓存
  });

  if (!response.ok) {
    throw new Error(`获取产品失败: ${response.status}`);
  }

  return response.json();
}

// 获取单个产品
export async function getProduct(id: string) {
  const url = `${API_BASE_URL}/products/${id}`;
  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`获取产品详情失败: ${response.status}`);
  }

  return response.json();
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
