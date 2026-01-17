import { Product } from 'shared';
import {
  RecommendationAlgorithm,
  RecommendationOptions,
  RecommendationResult,
} from '../types';
import { calculateProductSimilarity } from '../utils/similarity';

/**
 * 基于内容的推荐算法
 * 根据用户历史购买的商品，推荐相似的商品
 */
export class ContentBasedRecommendationAlgorithm
  implements RecommendationAlgorithm
{
  name = 'content-based';

  recommend(
    products: Product[],
    options: RecommendationOptions
  ): RecommendationResult[] {
    const limit = options.limit ?? 10;
    const excludeIds = new Set(options.excludeProductIds ?? []);
    const userBehavior = options.userBehavior;

    if (!userBehavior) {
      return [];
    }

    // 获取用户购买过的商品
    const purchasedProductIds = this.getPurchasedProductIds(userBehavior);
    if (purchasedProductIds.length === 0) {
      return [];
    }

    // 获取用户已购买的商品
    const purchasedProducts = products.filter((p) =>
      purchasedProductIds.includes(p.id)
    );

    if (purchasedProducts.length === 0) {
      return [];
    }

    // 计算每个商品的相似度评分
    const productScores = new Map<string, number>();

    for (const candidateProduct of products) {
      if (excludeIds.has(candidateProduct.id)) {
        continue;
      }

      // 跳过已购买的商品
      if (purchasedProductIds.includes(candidateProduct.id)) {
        continue;
      }

      // 计算与所有已购买商品的最高相似度
      let maxSimilarity = 0;
      for (const purchasedProduct of purchasedProducts) {
        const similarity = calculateProductSimilarity(
          candidateProduct,
          purchasedProduct
        );
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }

      // 如果有多个已购买商品，使用平均相似度
      let avgSimilarity = 0;
      for (const purchasedProduct of purchasedProducts) {
        avgSimilarity += calculateProductSimilarity(
          candidateProduct,
          purchasedProduct
        );
      }
      avgSimilarity /= purchasedProducts.length;

      // 使用最大值和平均值的加权平均（更倾向于最大值）
      const finalScore = maxSimilarity * 0.7 + avgSimilarity * 0.3;
      productScores.set(candidateProduct.id, finalScore);
    }

    // 转换为推荐结果并排序
    const results: RecommendationResult[] = Array.from(productScores.entries())
      .map(([productId, score]) => {
        const product = products.find((p) => p.id === productId);
        return {
          productId,
          score,
          product,
          reason: '基于您购买过的相似商品',
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results;
  }

  /**
   * 从用户行为中提取购买过的商品ID列表
   */
  private getPurchasedProductIds(userBehavior: {
    purchasedProductIds?: string[];
    orders?: any[];
  }): string[] {
    const ids = new Set<string>();

    // 从 purchasedProductIds 获取
    if (userBehavior.purchasedProductIds) {
      userBehavior.purchasedProductIds.forEach((id) => ids.add(id));
    }

    // 从订单中提取商品ID
    if (userBehavior.orders) {
      for (const order of userBehavior.orders) {
        if (order.items) {
          for (const item of order.items) {
            if (item.productId) {
              ids.add(item.productId);
            } else if (item.product?.id) {
              ids.add(item.product.id);
            }
          }
        }
      }
    }

    return Array.from(ids);
  }
}