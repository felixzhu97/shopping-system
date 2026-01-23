import { Product } from 'types';
import {
  AlgorithmType,
  RecommendationAlgorithm,
  RecommendationOptions,
  RecommendationResult,
} from './types';
import { ContentBasedRecommendationAlgorithm } from './algorithms/content-based';
import { CollaborativeRecommendationAlgorithm } from './algorithms/collaborative';
import { SimpleRecommendationAlgorithm } from './algorithms/simple';
import { HybridRecommendationAlgorithm } from './algorithms/hybrid';

/**
 * 推荐引擎主类
 * 提供统一的推荐接口，支持多种推荐算法
 */
export class RecommendationEngine {
  private products: Product[];
  private algorithms: Map<string, RecommendationAlgorithm>;

  constructor(products: Product[]) {
    this.products = products;
    this.algorithms = new Map();

    // 注册所有算法
    this.algorithms.set(
      AlgorithmType.CONTENT_BASED,
      new ContentBasedRecommendationAlgorithm()
    );
    this.algorithms.set(
      AlgorithmType.COLLABORATIVE,
      new CollaborativeRecommendationAlgorithm()
    );
    this.algorithms.set(
      AlgorithmType.SIMPLE,
      new SimpleRecommendationAlgorithm()
    );
    this.algorithms.set(
      AlgorithmType.HYBRID,
      new HybridRecommendationAlgorithm()
    );
  }

  /**
   * 执行推荐
   */
  async recommend(
    options: RecommendationOptions
  ): Promise<RecommendationResult[]> {
    // 数据预处理：过滤无效商品
    const validProducts = this.preprocessProducts(
      this.products,
      options.excludeProductIds
    );

    if (validProducts.length === 0) {
      return [];
    }

    // 选择算法
    const algorithm = this.selectAlgorithm(options.algorithm);
    if (!algorithm) {
      throw new Error(`不支持的推荐算法: ${options.algorithm}`);
    }

    // 执行推荐
    let results: RecommendationResult[] = [];
    const algorithmResult = algorithm.recommend(validProducts, options);

    if (algorithmResult instanceof Promise) {
      results = await algorithmResult;
    } else {
      results = algorithmResult;
    }

    // 后处理：填充商品信息、过滤、排序
    results = this.postprocessResults(results, validProducts, options.limit);

    return results;
  }

  /**
   * 预处理商品数据
   */
  private preprocessProducts(
    products: Product[],
    excludeIds?: string[]
  ): Product[] {
    const excludeSet = new Set(excludeIds ?? []);
    return products.filter(
      (p) => p.id && p.name && !excludeSet.has(p.id)
    );
  }

  /**
   * 选择推荐算法
   */
  private selectAlgorithm(
    algorithmType: AlgorithmType | string
  ): RecommendationAlgorithm | undefined {
    // 如果是简单推荐类型，使用简单推荐算法
    if (
      algorithmType === 'popular' ||
      algorithmType === 'highest-rated' ||
      algorithmType === 'latest' ||
      algorithmType === 'same-category'
    ) {
      return this.algorithms.get(AlgorithmType.SIMPLE);
    }

    return this.algorithms.get(algorithmType as AlgorithmType);
  }

  /**
   * 后处理推荐结果
   */
  private postprocessResults(
    results: RecommendationResult[],
    products: Product[],
    limit?: number
  ): RecommendationResult[] {
    // 填充商品信息
    const productMap = new Map(products.map((p) => [p.id, p]));
    const enrichedResults = results.map((result) => ({
      ...result,
      product: result.product ?? productMap.get(result.productId),
    }));

    // 过滤掉没有商品信息的项（可选，取决于业务需求）
    // const validResults = enrichedResults.filter(r => r.product);

    // 排序（通常已经排序，但确保）
    const sortedResults = enrichedResults.sort((a, b) => b.score - a.score);

    // 限制数量
    if (limit !== undefined && limit > 0) {
      return sortedResults.slice(0, limit);
    }

    return sortedResults;
  }

  /**
   * 更新商品列表
   */
  updateProducts(products: Product[]): void {
    this.products = products;
  }

  /**
   * 获取当前商品列表
   */
  getProducts(): Product[] {
    return [...this.products];
  }
}