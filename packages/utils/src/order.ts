import type { Order, OrderStatus } from 'shared';

/**
 * 订单状态流转顺序
 */
const ORDER_STATUS_FLOW: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];

/**
 * 可取消的订单状态
 */
const CANCELLABLE_STATUSES: OrderStatus[] = ['pending', 'processing'];

/**
 * 生成订单号
 * @param prefix 订单号前缀（默认 'ORD'）
 * @returns 订单号
 */
export function generateOrderNumber(prefix: string = 'ORD'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * 验证订单状态
 * @param status 订单状态
 * @returns 是否有效
 */
export function validateOrderStatus(status: string): status is OrderStatus {
  const validStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  return validStatuses.includes(status as OrderStatus);
}

/**
 * 获取下一个订单状态
 * @param currentStatus 当前订单状态
 * @returns 下一个订单状态，如果没有则返回 null
 */
export function getNextOrderStatus(currentStatus: OrderStatus): OrderStatus | null {
  if (currentStatus === 'cancelled') {
    return null; // 已取消的订单不能继续流转
  }

  if (currentStatus === 'delivered') {
    return null; // 已送达的订单是最终状态
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
  if (currentIndex === -1) {
    return null;
  }

  const nextIndex = currentIndex + 1;
  if (nextIndex >= ORDER_STATUS_FLOW.length) {
    return null;
  }

  return ORDER_STATUS_FLOW[nextIndex];
}

/**
 * 判断订单是否可以取消
 * @param order 订单对象或订单状态
 * @returns 是否可以取消
 */
export function canCancelOrder(order: Order | OrderStatus): boolean {
  const status = typeof order === 'string' ? order : order.status;
  return CANCELLABLE_STATUSES.includes(status);
}

/**
 * 获取订单状态的中文描述
 * @param status 订单状态
 * @returns 中文描述
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: '待处理',
    processing: '处理中',
    shipped: '已发货',
    delivered: '已送达',
    cancelled: '已取消',
  };

  return labels[status] || status;
}

/**
 * 判断订单是否已完成（已送达或已取消）
 * @param order 订单对象或订单状态
 * @returns 是否已完成
 */
export function isOrderCompleted(order: Order | OrderStatus): boolean {
  const status = typeof order === 'string' ? order : order.status;
  return status === 'delivered' || status === 'cancelled';
}