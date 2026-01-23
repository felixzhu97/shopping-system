import { Product, Order } from 'types';

/**
 * 推荐算法类型枚举
 */
export enum AlgorithmType {
  /** 基于内容的推荐 */
  CONTENT_BASED = 'content-based',
  /** 协同过滤推荐 */
  COLLABORATIVE = 'collaborative',
  /** 简单推荐（热门、评分、最新等） */
  SIMPLE = 'simple',
  /** 混合推荐（组合多种算法） */
  HYBRID = 'hybrid',
}

/**
 * 简单推荐类型
 */
export enum SimpleRecommendationType {
  /** 热门商品（基于评分和销量） */
  POPULAR = 'popular',
  /** 评分最高 */
  HIGHEST_RATED = 'highest-rated',
  /** 最新上架 */
  LATEST = 'latest',
  /** 同类商品 */
  SAME_CATEGORY = 'same-category',
}

/**
 * 用户行为数据
 */
export interface UserBehavior {
  /** 用户ID */
  userId: string;
  /** 用户购买过的商品ID列表 */
  purchasedProductIds?: string[];
  /** 用户浏览过的商品ID列表 */
  viewedProductIds?: string[];
  /** 用户订单列表 */
  orders?: Order[];
  /** 用户当前查看的商品ID（用于推荐相关商品） */
  currentProductId?: string;
}

/**
 * 推荐结果项
 */
export interface RecommendationResult {
  /** 商品ID */
  productId: string;
  /** 推荐评分（0-1之间的值） */
  score: number;
  /** 商品信息（可选） */
  product?: Product;
  /** 推荐原因（可选） */
  reason?: string;
}

/**
 * 推荐选项
 */
export interface RecommendationOptions {
  /** 算法类型 */
  algorithm: AlgorithmType | SimpleRecommendationType;
  /** 推荐数量限制 */
  limit?: number;
  /** 用户行为数据 */
  userBehavior?: UserBehavior;
  /** 需要排除的商品ID列表 */
  excludeProductIds?: string[];
  /** 针对特定商品推荐（用于相关商品推荐） */
  targetProductId?: string;
  /** 混合推荐时的权重配置（仅用于 HYBRID 算法） */
  hybridWeights?: {
    contentBased?: number;
    collaborative?: number;
    simple?: number;
  };
  /** 简单推荐的具体类型（仅用于 SIMPLE 算法） */
  simpleType?: SimpleRecommendationType;
}

/**
 * 算法接口
 */
export interface RecommendationAlgorithm {
  /** 算法名称 */
  name: string;
  /** 执行推荐 */
  recommend(
    products: Product[],
    options: RecommendationOptions
  ): RecommendationResult[] | Promise<RecommendationResult[]>;
}

/**
 * 相似度计算结果
 */
export interface SimilarityResult {
  /** 目标ID */
  targetId: string;
  /** 相似度评分（0-1之间的值） */
  similarity: number;
}