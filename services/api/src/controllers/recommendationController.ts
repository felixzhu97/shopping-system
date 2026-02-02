import type { Request, Response } from 'express';
import Product from '../models/Product';
import { recommendForProduct } from '../utils/recommendations';

type ProductView = Parameters<typeof recommendForProduct>[1][number];

function parseLimit(value: unknown, fallback: number) {
  const n = typeof value === 'string' ? Number.parseInt(value, 10) : Array.isArray(value) ? Number.parseInt(String(value[0]), 10) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(50, n));
}

export const getRecommendationsByProductId = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const limit = parseLimit(req.query.limit, 8);

    const docs = await Product.find(
      {},
      'name description category modelKey price image stock originalPrice rating reviewCount inStock'
    );
    const products: ProductView[] = docs.map(doc => {
      const v = doc.toJSON() as any;
      return {
        id: String(v.id ?? v._id),
        name: String(v.name ?? ''),
        description: String(v.description ?? ''),
        category: String(v.category ?? ''),
        modelKey: typeof v.modelKey === 'string' ? v.modelKey : undefined,
        price: typeof v.price === 'number' ? v.price : 0,
        image: String(v.image ?? ''),
        stock: typeof v.stock === 'number' ? v.stock : 0,
        originalPrice: typeof v.originalPrice === 'number' ? v.originalPrice : undefined,
        rating: typeof v.rating === 'number' ? v.rating : 0,
        reviewCount: typeof v.reviewCount === 'number' ? v.reviewCount : 0,
        inStock: typeof v.inStock === 'boolean' ? v.inStock : true,
      };
    });

    const exists = products.some(p => String(p.id) === String(productId));
    if (!exists) {
      return res.status(404 as number).json({ message: 'Product not found' });
    }

    const recommended = recommendForProduct(String(productId), products, limit);
    return res.status(200 as number).json(recommended);
  } catch (error) {
    return res.status(500 as number).json({ message: 'Failed to get recommendations' });
  }
};
