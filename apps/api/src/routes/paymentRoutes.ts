import express from 'express';
import { savePaymentInfo, getPaymentInfo } from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 保存支付信息
router.post('/', authenticateToken, savePaymentInfo);

// 获取支付信息
router.get('/:userId', authenticateToken, getPaymentInfo);

export default router;
