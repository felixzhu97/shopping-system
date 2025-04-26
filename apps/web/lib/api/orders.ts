import { Order } from '@/lib/types';

// 获取订单列表
export async function getOrders(): Promise<Order[]> {
  const response = await fetch('/api/orders');
  if (!response.ok) {
    throw new Error('获取订单列表失败');
  }
  return response.json();
}

// 获取订单详情
export async function getOrderById(id: string): Promise<Order> {
  const response = await fetch(`/api/orders/${id}`);
  if (!response.ok) {
    throw new Error('获取订单详情失败');
  }
  return response.json();
}
