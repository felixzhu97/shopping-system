import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import mongoose from 'mongoose';
import { CartItemType } from '../models/Order';

// 创建订单
export const createOrder = async (req: any, res: any) => {
  try {
    const { userId } = req.params;

    // 获取用户购物车
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: '购物车为空，无法创建订单' });
    }

    // 计算总金额并检查库存
    let totalAmount = 0;
    const orderItems: CartItemType[] = [];

    for (const item of cart.items) {
      const product = item.productId as any;

      // 检查库存
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `商品 ${product.name} 库存不足，剩余 ${product.stock} 件`,
        });
      }

      totalAmount += product.price * item.quantity;

      // 减少库存
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity },
      });

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
      });
    }

    // 创建订单
    const newOrder = new Order({
      userId,
      items: orderItems,
      totalAmount,
      status: 'pending',
    });

    const savedOrder = await newOrder.save();

    // 清空购物车
    cart.items = [];
    await cart.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({ message: '创建订单失败' });
  }
};

// 获取用户订单列表
export const getUserOrders = async (req: any, res: any) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).populate({
      path: 'items.productId',
      select: 'name price image',
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('获取用户订单失败:', error);
    res.status(500).json({ message: '获取用户订单失败' });
  }
};

// 获取订单详情
export const getOrderById = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate({
      path: 'items.productId',
      select: 'name price image description',
    });

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({ message: '获取订单详情失败' });
  }
};

// 更新订单状态
export const updateOrderStatus = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 验证状态值是否有效
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: '无效的订单状态' });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    // 如果订单被取消，恢复库存
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.status(500).json({ message: '更新订单状态失败' });
  }
};
