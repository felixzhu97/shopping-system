import { Request, Response } from 'express';
import Order, { IPaymentDetails } from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import User from '../models/User';
import Payment from '../models/Payment';
import { ApiError } from '../utils/ApiError';

// 创建订单
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { userId, orderItems, shippingAddress, paymentMethod } = req.body;

    // 获取用户的支付信息
    const paymentInfo = await Payment.findOne({ userId });
    if (!paymentInfo) {
      throw new ApiError(404, '未找到支付信息', 'PAYMENT_NOT_FOUND');
    }

    // 构建支付详情
    const paymentDetails: IPaymentDetails = {
      paymentMethod: paymentInfo.paymentMethod,
      paymentStatus: 'pending',
    };

    // 如果是信用卡支付，添加卡信息
    if (paymentInfo.paymentMethod === 'credit-card') {
      Object.assign(paymentDetails, {
        cardNumber: paymentInfo.cardNumber,
        expiration: paymentInfo.expiration,
      });
    }

    // 计算总金额
    const totalAmount = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // 创建订单
    const order = await Order.create({
      userId,
      orderItems,
      shippingAddress,
      paymentDetails,
      totalAmount,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          status: error.statusCode,
        },
      });
    } else {
      console.error('创建订单失败:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '创建订单失败',
          status: 500,
        },
      });
    }
  }
};

// 获取用户订单列表
export const getUserOrders = async (req: any, res: any) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200 as number).json(orders);
  } catch (error) {
    console.error('获取用户订单失败:', error);
    res.status(500 as number).json({ message: '获取用户订单失败' });
  }
};

// 获取订单详情
export const getOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('userId', 'firstName lastName email phone')
      .populate('orderItems.productId');

    if (!order) {
      throw new ApiError(404, '未找到订单', 'ORDER_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          status: error.statusCode,
        },
      });
    } else {
      console.error('获取订单失败:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取订单失败',
          status: 500,
        },
      });
    }
  }
};

// 更新订单状态
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, '未找到订单', 'ORDER_NOT_FOUND');
    }

    order.status = status;

    // 如果订单状态更新为已支付，更新支付状态和时间
    if (status === 'processing') {
      order.paymentDetails.paymentStatus = 'completed';
      order.paymentDetails.paidAt = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          status: error.statusCode,
        },
      });
    } else {
      console.error('更新订单状态失败:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '更新订单状态失败',
          status: 500,
        },
      });
    }
  }
};

export const getAllOrders = async (req: any, res: any) => {
  try {
    const { status } = req.params;

    let query = {};
    if (status && status !== 'all') {
      query = { status };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'username email');

    res.status(200 as number).json(orders);
  } catch (error) {
    console.error('获取所有订单失败:', error);
    res.status(500 as number).json({ message: '获取所有订单失败' });
  }
};
