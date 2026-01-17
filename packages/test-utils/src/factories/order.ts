import { Order, OrderStatus, CartItem } from 'shared';
import { createCartItem } from './cart';
import { createUser } from './user';

export interface OrderFactoryOptions {
  id?: string;
  userId?: string;
  items?: CartItem[];
  totalAmount?: number;
  status?: OrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

let orderCounter = 0;

function generateOrderId() {
  return `order-${++orderCounter}`;
}

function calculateTotalAmount(items: CartItem[]): number {
  return items.reduce((total, item) => {
    const price = item.price ?? item.product?.price ?? 0;
    return total + price * item.quantity;
  }, 0);
}

/**
 * Order 数据工厂
 */
export const createOrder = {
  /**
   * 创建完整的订单对象
   */
  create: (overrides: OrderFactoryOptions = {}): Order => {
    const id = overrides.id || generateOrderId();
    const userId = overrides.userId || createUser.create().id || 'user-1';
    const items = overrides.items || [createCartItem.create()];
    const totalAmount = overrides.totalAmount ?? calculateTotalAmount(items);
    const now = new Date();

    return {
      id,
      userId,
      items,
      totalAmount,
      status: overrides.status || 'pending',
      createdAt: overrides.createdAt || now,
      updatedAt: overrides.updatedAt || now,
    };
  },

  /**
   * 批量创建订单
   */
  createMany: (count: number, overrides: OrderFactoryOptions = {}): Order[] => {
    return Array.from({ length: count }, (_, index) => {
      const baseIndex = orderCounter;
      orderCounter++;
      return createOrder.create({
        ...overrides,
        id: overrides.id || generateOrderId(),
      });
    });
  },

  /**
   * 创建部分订单对象（用于更新操作）
   */
  createPartial: (overrides: Partial<OrderFactoryOptions> = {}): Partial<Order> => {
    return {
      ...(overrides.status && { status: overrides.status }),
      ...(overrides.totalAmount !== undefined && { totalAmount: overrides.totalAmount }),
      ...(overrides.items && { items: overrides.items }),
      ...(overrides.updatedAt && { updatedAt: overrides.updatedAt }),
    };
  },

  /**
   * 创建最小订单对象（仅必需字段）
   */
  createMinimal: (overrides: Partial<OrderFactoryOptions> = {}): Order => {
    return createOrder.create({
      ...overrides,
      createdAt: overrides.createdAt || new Date(),
      updatedAt: overrides.updatedAt || new Date(),
    });
  },

  /**
   * 按状态创建订单
   */
  createByStatus: (status: OrderStatus, overrides: OrderFactoryOptions = {}): Order => {
    return createOrder.create({
      ...overrides,
      status,
    });
  },

  /**
   * 创建待处理订单
   */
  createPending: (overrides: OrderFactoryOptions = {}): Order => {
    return createOrder.createByStatus('pending', overrides);
  },

  /**
   * 创建处理中订单
   */
  createProcessing: (overrides: OrderFactoryOptions = {}): Order => {
    return createOrder.createByStatus('processing', overrides);
  },

  /**
   * 创建已发货订单
   */
  createShipped: (overrides: OrderFactoryOptions = {}): Order => {
    return createOrder.createByStatus('shipped', overrides);
  },

  /**
   * 创建已交付订单
   */
  createDelivered: (overrides: OrderFactoryOptions = {}): Order => {
    return createOrder.createByStatus('delivered', overrides);
  },

  /**
   * 创建已取消订单
   */
  createCancelled: (overrides: OrderFactoryOptions = {}): Order => {
    return createOrder.createByStatus('cancelled', overrides);
  },

  /**
   * 创建包含多个商品的订单
   */
  createWithMultipleItems: (itemCount: number, overrides: OrderFactoryOptions = {}): Order => {
    const items = createCartItem.createMany(itemCount);
    return createOrder.create({
      ...overrides,
      items,
      totalAmount: overrides.totalAmount ?? calculateTotalAmount(items),
    });
  },
};
