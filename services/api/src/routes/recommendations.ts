import express from 'express';
import { getRecommendationsByProductId } from '../controllers/recommendationController';

const router = express.Router();

router.get('/:productId', getRecommendationsByProductId);

export default router;
