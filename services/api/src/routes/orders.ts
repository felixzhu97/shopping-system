import express from 'express';
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController';
import { adminAuth } from '../middleware/adminAuth';

const router = express.Router();

router.post('/:userId', createOrder);

router.get('/user/:userId', getUserOrders);

router.get('/admin/:status', adminAuth, getAllOrders);

router.get('/:id', getOrderById);

router.put('/:id/status', updateOrderStatus);

router.post('/:id/cancel', cancelOrder);

export default router;
