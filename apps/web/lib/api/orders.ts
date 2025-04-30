import { Order } from '@/lib/types';
import { API_CONFIG, fetchApi } from './config';

// 获取订单列表
export async function getOrders(): Promise<Order[]> {
  const url = `${API_CONFIG.orderUrl}`;
  const response = await fetchApi<Order[]>(url);
  if (!response.success || !response.data) {
    throw new Error('获取订单列表失败');
  }
  return response.data;
}

// 获取订单详情
export async function getOrderById(id: string): Promise<Order> {
  const url = `${API_CONFIG.orderUrl}/${id}`;
  const response = await fetchApi<Order>(url);
  if (!response.success || !response.data) {
    throw new Error('获取订单详情失败');
  }
  return response.data;
}

interface CreateOrderRequest {
  userId: string;
  orderItems: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  paymentDetails: {
    method: {
      type: 'credit-card' | 'alipay' | 'wechat';
      cardNumber?: string;
      expiration?: string;
    };
    status: 'pending' | 'completed' | 'failed';
  };
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export async function createOrder(data: CreateOrderRequest): Promise<Order> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('创建订单失败');
  }

  return response.json();
}

// 获取用户订单列表
export async function getUserOrders(userId: string): Promise<Order[]> {
  const url = `${API_CONFIG.orderUrl}/user/${userId}`;
  const response = await fetchApi<Order[]>(url);

  if (!response.success || !response.data) {
    throw new Error('获取订单列表失败');
  }
  return response.data;
}
