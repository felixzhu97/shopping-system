import Order, { OrderDocument, OrderType } from '../../models/Order';
import { Repository } from '../repository';
import mongoose from 'mongoose';

/**
 * 订单数据仓库类
 * 提供订单模型的数据访问方法
 */
export class OrderRepository extends Repository<OrderDocument, OrderType> {
  constructor() {
    super(Order);
  }

  /**
   * 根据用户ID查找订单
   * @param userId 用户ID
   * @returns 订单列表
   */
  async findByUserId(userId: string): Promise<OrderDocument[]> {
    return this.findAll({ userId: new mongoose.Types.ObjectId(userId) });
  }

  /**
   * 根据订单状态查找订单
   * @param status 订单状态
   * @returns 订单列表
   */
  async findByStatus(status: string): Promise<OrderDocument[]> {
    return this.findAll({ status });
  }

  /**
   * 更新订单状态
   * @param orderId 订单ID
   * @param status 新状态
   * @returns 更新后的订单
   */
  async updateStatus(orderId: string, status: string): Promise<OrderDocument | null> {
    return this.update(orderId, { status });
  }

  /**
   * 获取用户订单统计
   * @param userId 用户ID
   * @returns 订单统计信息
   */
  async getUserOrderStats(userId: string): Promise<any> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const pipeline = [
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
      { $sort: { totalAmount: -1 } },
    ];

    return this.aggregate(pipeline);
  }

  /**
   * 获取订单金额统计（按日期分组）
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 按日期分组的订单金额统计
   */
  async getOrderAmountByDate(startDate: Date, endDate: Date): Promise<any> {
    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          totalAmount: 1,
          count: 1,
        },
      },
      { $sort: { date: 1 } },
    ];

    return this.aggregate(pipeline);
  }

  /**
   * 获取最近的订单
   * @param limit 限制数量
   * @returns 最近的订单列表
   */
  async getRecentOrders(limit: number = 10): Promise<OrderDocument[]> {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'username email')
      .exec();

    return orders;
  }
}

// 导出单例实例
export const orderRepository = new OrderRepository();
