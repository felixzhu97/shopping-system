import { Product } from 'shared';

/**
 * 计算两个集合的 Jaccard 相似度
 * Jaccard 相似度 = 交集大小 / 并集大小
 */
export function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) {
    return 1;
  }
  if (setA.size === 0 || setB.size === 0) {
    return 0;
  }

  const arrayA = Array.from(setA);
  const arrayB = Array.from(setB);
  const intersection = new Set(arrayA.filter((x) => setB.has(x)));
  const union = new Set([...arrayA, ...arrayB]);

  return intersection.size / union.size;
}

/**
 * 计算两个向量的余弦相似度
 * 余弦相似度 = (A · B) / (||A|| * ||B||)
 */
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error('向量长度必须相等');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

/**
 * 基于商品属性计算相似度
 * 使用分类、价格区间等属性
 */
export function calculateProductSimilarity(
  productA: Product,
  productB: Product
): number {
  const features: number[] = [];
  const weights: number[] = [];

  // 分类相似度（最重要，权重0.5）
  if (productA.category === productB.category) {
    features.push(1);
  } else {
    features.push(0);
  }
  weights.push(0.5);

  // 价格相似度（权重0.2）
  // 使用相对价格差异
  const priceA = productA.price;
  const priceB = productB.price;
  const maxPrice = Math.max(priceA, priceB);
  if (maxPrice === 0) {
    features.push(1);
  } else {
    const priceDiff = Math.abs(priceA - priceB) / maxPrice;
    features.push(1 - Math.min(priceDiff, 1));
  }
  weights.push(0.2);

  // 评分相似度（权重0.2）
  const ratingA = productA.rating ?? 0;
  const ratingB = productB.rating ?? 0;
  const maxRating = 5;
  const ratingDiff = Math.abs(ratingA - ratingB) / maxRating;
  features.push(1 - ratingDiff);
  weights.push(0.2);

  // 库存状态相似度（权重0.1）
  const inStockA = productA.inStock ?? true;
  const inStockB = productB.inStock ?? true;
  features.push(inStockA === inStockB ? 1 : 0);
  weights.push(0.1);

  // 加权平均
  let weightedSum = 0;
  let weightSum = 0;
  for (let i = 0; i < features.length; i++) {
    weightedSum += features[i] * weights[i];
    weightSum += weights[i];
  }

  return weightSum > 0 ? weightedSum / weightSum : 0;
}

/**
 * 计算用户相似度（基于购买历史）
 * 使用 Jaccard 相似度
 */
export function calculateUserSimilarity(
  userAPurchases: Set<string>,
  userBPurchases: Set<string>
): number {
  return jaccardSimilarity(userAPurchases, userBPurchases);
}