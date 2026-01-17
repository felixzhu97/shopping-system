// 推荐引擎主类
export { RecommendationEngine } from './engine';

// 推荐算法
export { ContentBasedRecommendationAlgorithm } from './algorithms/content-based';
export { CollaborativeRecommendationAlgorithm } from './algorithms/collaborative';
export { SimpleRecommendationAlgorithm } from './algorithms/simple';
export { HybridRecommendationAlgorithm } from './algorithms/hybrid';

// 类型定义
export type {
  RecommendationOptions,
  RecommendationResult,
  UserBehavior,
  RecommendationAlgorithm,
  SimilarityResult,
} from './types';

export { AlgorithmType, SimpleRecommendationType } from './types';

// 工具函数（可选导出，供高级用户使用）
export {
  jaccardSimilarity,
  cosineSimilarity,
  calculateProductSimilarity,
  calculateUserSimilarity,
} from './utils/similarity';

export {
  normalizeScore,
  calculatePopularityScore,
  applyTimeDecay,
  mergeRecommendationResults,
  weightedMergeRecommendationResults,
} from './utils/scoring';