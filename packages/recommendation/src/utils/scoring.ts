/**
 * 将评分归一化到 0-1 范围
 */
export function normalizeScore(score: number, min: number, max: number): number {
  if (max === min) {
    return 1;
  }
  const normalized = (score - min) / (max - min);
  return Math.max(0, Math.min(1, normalized));
}

/**
 * 计算热门度评分（基于评分和销量）
 */
export function calculatePopularityScore(
  rating: number | undefined,
  reviewCount: number | undefined,
  stock: number
): number {
  // 评分权重：0.6
  const ratingScore = rating ? normalizeScore(rating, 0, 5) : 0;
  const ratingWeight = 0.6;

  // 评论数量权重：0.3（使用对数缩放）
  const reviewScore = reviewCount
    ? normalizeScore(Math.log10(reviewCount + 1), 0, Math.log10(1000 + 1))
    : 0;
  const reviewWeight = 0.3;

  // 库存状态权重：0.1
  const stockScore = stock > 0 ? 1 : 0;
  const stockWeight = 0.1;

  return (
    ratingScore * ratingWeight +
    reviewScore * reviewWeight +
    stockScore * stockWeight
  );
}

/**
 * 应用衰减函数（时间越久，评分越低）
 * 用于考虑时间因素
 */
export function applyTimeDecay(baseScore: number, daysAgo: number): number {
  const halfLife = 30; // 30天后评分减半
  const decayFactor = Math.pow(0.5, daysAgo / halfLife);
  return baseScore * decayFactor;
}

/**
 * 合并多个推荐结果，去重并按评分排序
 */
export function mergeRecommendationResults(
  results: Array<{ productId: string; score: number; reason?: string }>[]
): Array<{ productId: string; score: number; reason?: string }> {
  const productMap = new Map<
    string,
    { score: number; reason?: string; count: number }
  >();

  // 合并所有结果
  for (const resultList of results) {
    for (const item of resultList) {
      const existing = productMap.get(item.productId);
      if (existing) {
        // 如果已存在，取平均分
        existing.score = (existing.score * existing.count + item.score) / (existing.count + 1);
        existing.count += 1;
        if (item.reason && !existing.reason) {
          existing.reason = item.reason;
        }
      } else {
        productMap.set(item.productId, {
          score: item.score,
          reason: item.reason,
          count: 1,
        });
      }
    }
  }

  // 转换为数组并排序
  return Array.from(productMap.entries())
    .map(([productId, data]) => ({
      productId,
      score: data.score,
      reason: data.reason,
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * 加权合并推荐结果
 */
export function weightedMergeRecommendationResults(
  results: Array<{
    items: Array<{ productId: string; score: number; reason?: string }>;
    weight: number;
  }>
): Array<{ productId: string; score: number; reason?: string }> {
  const productMap = new Map<
    string,
    { weightedScore: number; totalWeight: number; reason?: string }
  >();

  // 加权合并
  for (const { items, weight } of results) {
    for (const item of items) {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.weightedScore += item.score * weight;
        existing.totalWeight += weight;
      } else {
        productMap.set(item.productId, {
          weightedScore: item.score * weight,
          totalWeight: weight,
          reason: item.reason,
        });
      }
    }
  }

  // 计算加权平均并转换为数组
  return Array.from(productMap.entries())
    .map(([productId, data]) => ({
      productId,
      score: data.totalWeight > 0 ? data.weightedScore / data.totalWeight : 0,
      reason: data.reason,
    }))
    .sort((a, b) => b.score - a.score);
}