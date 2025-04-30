import express from 'express';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import orderRoutes from './orderRoutes';
import paymentRoutes from './paymentRoutes';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);

export default router;
