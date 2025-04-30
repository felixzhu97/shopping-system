import { Request, Response } from 'express';
import Payment from '../models/Payment';
import { IPayment } from '../models/Payment';
import User from '../models/User';
import Address from '../models/Address';

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = 'ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 创建支付记录
export const createPayment = async (req: Request, res: Response) => {
  try {
    const paymentData: IPayment = req.body;

    // 验证必要字段
    if (!paymentData.userId || !paymentData.paymentMethod) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    // 如果是信用卡支付，验证卡信息
    if (paymentData.paymentMethod === 'credit-card') {
      if (!paymentData.cardNumber || !paymentData.expiration || !paymentData.cvv) {
        return res.status(400).json({ message: '信用卡支付需要提供完整的卡信息' });
      }
    }

    const payment = new Payment(paymentData);
    await payment.save();

    res.status(201).json(payment);
  } catch (error) {
    console.error('创建支付信息失败:', error);
    res.status(500).json({ message: '创建支付信息失败' });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const payment = await Payment.findOneAndUpdate({ userId }, req.body, { new: true });
    if (!payment) {
      return res.status(404).json({ message: '支付信息不存在' });
    }
    res.status(200).json(payment);
  } catch (error) {
    console.error('更新支付信息失败:', error);
    res.status(500).json({ message: '更新支付信息失败' });
  }
};

// 获取用户的支付记录
export const getUserPayments = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const payments = await Payment.findOne({ userId });

    res.status(200).json(payments);
  } catch (error) {
    console.error('获取用户支付信息失败:', error);
    res.status(500).json({ message: '获取用户支付信息失败' });
  }
};

export const savePaymentInfo = async (req: Request, res: Response) => {
  try {
    const { userId, paymentMethod, cardNumber, expiration, cvv } = req.body;

    // 验证用户是否存在
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
    }

    // 创建或更新支付信息
    const payment = await Payment.findOneAndUpdate(
      { userId },
      { paymentMethod, cardNumber, expiration, cvv },
      { new: true, upsert: true }
    );

    res.status(201).json({
      success: true,
      data: { payment },
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
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '保存支付信息失败',
          status: 500,
        },
      });
    }
  }
};

export const getPaymentInfo = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // 获取支付信息
    const payment = await Payment.findOne({ userId });
    if (!payment) {
      throw new ApiError(404, '未找到支付信息', 'PAYMENT_NOT_FOUND');
    }

    // 获取用户信息
    const user = await User.findById(userId).select('firstName lastName email phone');
    if (!user) {
      throw new ApiError(404, '未找到用户信息', 'USER_NOT_FOUND');
    }

    // 获取地址信息
    const address = await Address.findOne({ userId }).select('address city province postalCode');

    res.status(200).json({
      success: true,
      data: {
        payment,
        user,
        address,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          status: error.statusCode,
          details: {
            resource: 'Payment',
            userId: req.params.userId,
          },
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取支付信息失败',
          status: 500,
        },
      });
    }
  }
};
