import { Order } from '@/lib/types';
import { API_CONFIG, fetchApi } from './config';
import { ApiResponse } from 'types';

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
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  orderItems: {
    productId: string;
    quantity: number;
  }[];
  paymentMethod: string;
}

export async function createOrder(userId: string, data: CreateOrderRequest): Promise<Order> {
  const url = `${API_CONFIG.orderUrl}/${userId}`;
  const response = await fetchApi<Order>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || '创建订单失败');
  }

  return response.data;
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

// 取消订单
export async function cancelOrder(orderId: string): Promise<Order> {
  const response = await fetchApi<Order>(`${API_CONFIG.orderUrl}/${orderId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}), // 发送空对象作为请求体
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || '取消订单失败');
  }
  return response.data;
}
