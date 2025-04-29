import express from 'express';
import { createPayment, updatePayment, getUserPayments } from '../controllers/paymentController';

const router = express.Router();

// 创建支付信息
router.post('/', createPayment);

// 更新支付信息
router.put('/:userId', updatePayment);

// 获取用户的支付信息
router.get('/:userId', getUserPayments);

export default router;
