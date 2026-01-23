import { Product } from 'types';
import {
  RecommendationAlgorithm,
  RecommendationOptions,
  RecommendationResult,
  SimpleRecommendationType,
} from '../types';
import { calculatePopularityScore } from '../utils/scoring';

/**
 * 简单推荐算法
 * 支持热门商品、评分最高、最新商品、同类商品推荐
 */
export class SimpleRecommendationAlgorithm implements RecommendationAlgorithm {
  name = 'simple';

  recommend(
    products: Product[],
    options: RecommendationOptions
  ): RecommendationResult[] {
    const type =
      options.simpleType ?? SimpleRecommendationType.POPULAR;
    const limit = options.limit ?? 10;
    const excludeIds = new Set(options.excludeProductIds ?? []);

    let results: RecommendationResult[] = [];

    switch (type) {
      case SimpleRecommendationType.POPULAR:
        results = this.recommendPopular(products, excludeIds);
        break;
      case SimpleRecommendationType.HIGHEST_RATED:
        results = this.recommendHighestRated(products, excludeIds);
        break;
      case SimpleRecommendationType.LATEST:
        results = this.recommendLatest(products, excludeIds);
        break;
      case SimpleRecommendationType.SAME_CATEGORY:
        results = this.recommendSameCategory(
          products,
          options.targetProductId ?? options.userBehavior?.currentProductId,
          excludeIds
        );
        break;
    }

    return results.slice(0, limit);
  }

  /**
   * 推荐热门商品（基于评分和销量）
   */
  private recommendPopular(
    products: Product[],
    excludeIds: Set<string>
  ): RecommendationResult[] {
    const results: RecommendationResult[] = products
      .filter((p) => !excludeIds.has(p.id))
      .map((product) => {
        const score = calculatePopularityScore(
          product.rating,
          product.reviewCount,
          product.stock
        );
        return {
          productId: product.id,
          score,
          product,
          reason: '热门商品',
        };
      })
      .sort((a, b) => b.score - a.score);

    return results;
  }

  /**
   * 推荐评分最高的商品
   */
  private recommendHighestRated(
    products: Product[],
    excludeIds: Set<string>
  ): RecommendationResult[] {
    const results: RecommendationResult[] = products
      .filter((p) => !excludeIds.has(p.id) && p.rating !== undefined)
      .map((product) => ({
        productId: product.id,
        score: (product.rating ?? 0) / 5, // 归一化到 0-1
        product,
        reason: '评分最高',
      }))
      .sort((a, b) => b.score - a.score);

    return results;
  }

  /**
   * 推荐最新商品
   * 注意：如果 Product 类型没有 createdAt 字段，这里假设所有商品都是可用的
   * 实际使用时可能需要根据实际数据结构调整
   */
  private recommendLatest(
    products: Product[],
    excludeIds: Set<string>
  ): RecommendationResult[] {
    // 由于 Product 类型可能没有时间字段，这里返回所有商品
    // 实际使用时应该根据商品的创建时间排序
    const results: RecommendationResult[] = products
      .filter((p) => !excludeIds.has(p.id))
      .map((product, index) => ({
        productId: product.id,
        // 如果没有时间信息，使用索引作为简单排序
        score: 1 - index / products.length,
        product,
        reason: '最新商品',
      }));

    return results;
  }

  /**
   * 推荐同类商品
   */
  private recommendSameCategory(
    products: Product[],
    targetProductId: string | undefined,
    excludeIds: Set<string>
  ): RecommendationResult[] {
    if (!targetProductId) {
      return [];
    }

    const targetProduct = products.find((p) => p.id === targetProductId);
    if (!targetProduct) {
      return [];
    }

    const category = targetProduct.category;
    const results: RecommendationResult[] = products
      .filter(
        (p) =>
          p.id !== targetProductId &&
          !excludeIds.has(p.id) &&
          p.category === category
      )
      .map((product) => ({
        productId: product.id,
        score: 1, // 同类商品给相同的基础评分
        product,
        reason: `同类商品：${category}`,
      }));

    return results;
  }
}