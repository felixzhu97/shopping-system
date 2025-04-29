import { Request, Response } from 'express';
import Payment from '../models/Payment';
import { PaymentType } from '../models/Payment';

// 创建支付记录
export const createPayment = async (req: Request, res: Response) => {
  try {
    const paymentData: PaymentType = req.body;

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
