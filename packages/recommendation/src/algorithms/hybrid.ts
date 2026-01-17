import { Product } from 'shared';
import {
  AlgorithmType,
  RecommendationAlgorithm,
  RecommendationOptions,
  RecommendationResult,
  SimpleRecommendationType,
} from '../types';
import { ContentBasedRecommendationAlgorithm } from './content-based';
import { CollaborativeRecommendationAlgorithm } from './collaborative';
import { SimpleRecommendationAlgorithm } from './simple';
import { weightedMergeRecommendationResults } from '../utils/scoring';

/**
 * 混合推荐算法
 * 组合多种推荐算法的结果
 */
export class HybridRecommendationAlgorithm implements RecommendationAlgorithm {
  name = 'hybrid';

  private contentBasedAlgorithm: ContentBasedRecommendationAlgorithm;
  private collaborativeAlgorithm: CollaborativeRecommendationAlgorithm;
  private simpleAlgorithm: SimpleRecommendationAlgorithm;

  constructor() {
    this.contentBasedAlgorithm = new ContentBasedRecommendationAlgorithm();
    this.collaborativeAlgorithm = new CollaborativeRecommendationAlgorithm();
    this.simpleAlgorithm = new SimpleRecommendationAlgorithm();
  }

  recommend(
    products: Product[],
    options: RecommendationOptions
  ): RecommendationResult[] {
    const limit = options.limit ?? 10;
    const weights = options.hybridWeights ?? {
      contentBased: 0.4,
      collaborative: 0.3,
      simple: 0.3,
    };

    const results: Array<{
      items: RecommendationResult[];
      weight: number;
    }> = [];

    // 执行基于内容的推荐
    try {
      const contentBasedOptions: RecommendationOptions = {
        ...options,
        algorithm: AlgorithmType.CONTENT_BASED,
        limit: limit * 2, // 获取更多结果用于混合
      };
      const contentBasedResults =
        this.contentBasedAlgorithm.recommend(products, contentBasedOptions);
      if (contentBasedResults.length > 0 && weights.contentBased && weights.contentBased > 0) {
        results.push({
          items: contentBasedResults,
          weight: weights.contentBased,
        });
      }
    } catch (error) {
      console.warn('基于内容的推荐失败:', error);
    }

    // 执行协同过滤推荐
    try {
      const collaborativeOptions: RecommendationOptions = {
        ...options,
        algorithm: AlgorithmType.COLLABORATIVE,
        limit: limit * 2,
      };
      const collaborativeResults =
        this.collaborativeAlgorithm.recommend(products, collaborativeOptions);
      if (collaborativeResults.length > 0 && weights.collaborative && weights.collaborative > 0) {
        results.push({
          items: collaborativeResults,
          weight: weights.collaborative,
        });
      }
    } catch (error) {
      console.warn('协同过滤推荐失败:', error);
    }

    // 执行简单推荐（热门商品）
    try {
      const simpleOptions: RecommendationOptions = {
        ...options,
        algorithm: AlgorithmType.SIMPLE,
        simpleType: SimpleRecommendationType.POPULAR,
        limit: limit * 2,
      };
      const simpleResults = this.simpleAlgorithm.recommend(products, simpleOptions);
      if (simpleResults.length > 0 && weights.simple && weights.simple > 0) {
        results.push({
          items: simpleResults,
          weight: weights.simple,
        });
      }
    } catch (error) {
      console.warn('简单推荐失败:', error);
    }

    // 如果没有结果，返回空数组
    if (results.length === 0) {
      return [];
    }

    // 加权合并结果
    const mergedResults = weightedMergeRecommendationResults(results);

    // 限制数量并添加推荐原因
    return mergedResults.slice(0, limit).map((result) => ({
      ...result,
      reason: result.reason || '混合推荐',
    }));
  }
}