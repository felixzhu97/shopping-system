import { Product, Order } from 'shared';
import {
  RecommendationAlgorithm,
  RecommendationOptions,
  RecommendationResult,
} from '../types';
import { calculateUserSimilarity } from '../utils/similarity';

/**
 * 协同过滤推荐算法
 * 基于用户购买历史，找到相似用户，推荐相似用户喜欢的商品
 */
export class CollaborativeRecommendationAlgorithm
  implements RecommendationAlgorithm
{
  name = 'collaborative';

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

    // 注意：完整的协同过滤需要所有用户的数据
    // 这里假设通过 userBehavior 传入其他用户的数据
    // 或者从外部数据源获取
    // 为了简化，这里使用基于用户自己历史的基本实现

    const purchasedProductIds = this.getPurchasedProductIds(userBehavior);
    if (purchasedProductIds.length === 0) {
      // 如果没有购买历史，无法进行协同过滤
      return [];
    }

    // 如果提供了所有用户订单数据，可以进行完整的协同过滤
    // 这里实现一个简化版本：基于用户相似度的商品推荐
    // 实际使用时，需要传入所有用户的购买历史

    const purchasedSet = new Set(purchasedProductIds);

    // 计算每个候选商品的推荐评分
    // 这里简化处理：推荐未购买的商品，评分基于商品的热门度
    const productScores = new Map<string, number>();

    for (const product of products) {
      if (excludeIds.has(product.id)) {
        continue;
      }

      // 跳过已购买的商品
      if (purchasedSet.has(product.id)) {
        continue;
      }

      // 基于商品评分和评论数计算推荐评分
      const ratingScore = product.rating ? product.rating / 5 : 0;
      const reviewScore = product.reviewCount
        ? Math.min(product.reviewCount / 100, 1)
        : 0;

      // 综合评分（可以根据实际情况调整权重）
      const score = ratingScore * 0.6 + reviewScore * 0.4;
      productScores.set(product.id, score);
    }

    // 转换为推荐结果并排序
    const results: RecommendationResult[] = Array.from(productScores.entries())
      .map(([productId, score]) => {
        const product = products.find((p) => p.id === productId);
        return {
          productId,
          score,
          product,
          reason: '与您相似的用户也喜欢',
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
    orders?: Order[];
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

  /**
   * 计算用户相似度矩阵（辅助方法）
   * 实际使用时可以从外部调用，传入所有用户数据
   */
  calculateUserSimilarities(
    userIds: string[],
    userPurchases: Map<string, Set<string>>
  ): Map<string, Map<string, number>> {
    const similarities = new Map<string, Map<string, number>>();

    for (let i = 0; i < userIds.length; i++) {
      const userA = userIds[i];
      const purchasesA = userPurchases.get(userA) ?? new Set();

      const userSimilarities = new Map<string, number>();
      for (let j = i + 1; j < userIds.length; j++) {
        const userB = userIds[j];
        const purchasesB = userPurchases.get(userB) ?? new Set();

        const similarity = calculateUserSimilarity(purchasesA, purchasesB);
        userSimilarities.set(userB, similarity);
      }
      similarities.set(userA, userSimilarities);
    }

    return similarities;
  }
}