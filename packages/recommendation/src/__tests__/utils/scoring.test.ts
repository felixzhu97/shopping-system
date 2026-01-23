import { describe, it, expect } from 'vitest';
import {
  normalizeScore,
  calculatePopularityScore,
  applyTimeDecay,
  mergeRecommendationResults,
  weightedMergeRecommendationResults,
} from '../../utils/scoring';

describe('Scoring Utils', () => {
  describe('normalizeScore()', () => {
    it('should normalize score to 0-1 range', () => {
      // Given
      const score = 50;
      const min = 0;
      const max = 100;

      // When
      const result = normalizeScore(score, min, max);

      // Then
      expect(result).toBe(0.5);
    });

    it('should return 1 when min equals max', () => {
      // Given
      const score = 100;
      const min = 100;
      const max = 100;

      // When
      const result = normalizeScore(score, min, max);

      // Then
      expect(result).toBe(1);
    });

    it('should clamp result to valid range', () => {
      // Given
      const score = 150;
      const min = 0;
      const max = 100;

      // When
      const result = normalizeScore(score, min, max);

      // Then
      expect(result).toBeLessThanOrEqual(1);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculatePopularityScore()', () => {
    it('should return higher score for highly rated products', () => {
      // Given
      const rating = 5;
      const reviewCount = 100;
      const stock = 10;

      // When
      const result = calculatePopularityScore(rating, reviewCount, stock);

      // Then
      expect(result).toBeGreaterThan(0.5);
    });

    it('should return lower score for low rated products', () => {
      // Given
      const rating = 1;
      const reviewCount = 10;
      const stock = 10;

      // When
      const result = calculatePopularityScore(rating, reviewCount, stock);

      // Then
      expect(result).toBeLessThan(0.5);
    });

    it('should handle products with no rating', () => {
      // Given
      const rating = undefined;
      const reviewCount = 0;
      const stock = 10;

      // When
      const result = calculatePopularityScore(rating, reviewCount, stock);

      // Then
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should penalize out of stock products', () => {
      // Given
      const rating = 5;
      const reviewCount = 100;
      const stockIn = 10;
      const stockOut = 0;

      // When
      const inStockScore = calculatePopularityScore(rating, reviewCount, stockIn);
      const outStockScore = calculatePopularityScore(rating, reviewCount, stockOut);

      // Then
      expect(inStockScore).toBeGreaterThan(outStockScore);
    });
  });

  describe('applyTimeDecay()', () => {
    it('should return full score for recent items', () => {
      // Given
      const baseScore = 1.0;
      const daysAgo = 0;

      // When
      const result = applyTimeDecay(baseScore, daysAgo);

      // Then
      expect(result).toBe(baseScore);
    });

    it('should decay score over time', () => {
      // Given
      const baseScore = 1.0;
      const daysAgo = 30; // Half-life

      // When
      const result = applyTimeDecay(baseScore, daysAgo);

      // Then
      expect(result).toBeCloseTo(0.5, 2);
    });

    it('should return lower score for older items', () => {
      // Given
      const baseScore = 1.0;
      const recent = applyTimeDecay(baseScore, 10);
      const old = applyTimeDecay(baseScore, 60);

      // When & Then
      expect(recent).toBeGreaterThan(old);
    });
  });

  describe('mergeRecommendationResults()', () => {
    it('should merge results and calculate average scores', () => {
      // Given
      const results1 = [
        { productId: 'p1', score: 0.8 },
        { productId: 'p2', score: 0.6 },
      ];
      const results2 = [
        { productId: 'p1', score: 0.9 },
        { productId: 'p3', score: 0.7 },
      ];

      // When
      const merged = mergeRecommendationResults([results1, results2]);

      // Then
      expect(merged).toHaveLength(3);
      const p1 = merged.find((r) => r.productId === 'p1');
      expect(p1?.score).toBeCloseTo((0.8 + 0.9) / 2, 5);
    });

    it('should sort results by score descending', () => {
      // Given
      const results1 = [
        { productId: 'p1', score: 0.8 },
        { productId: 'p2', score: 0.6 },
      ];
      const results2 = [
        { productId: 'p3', score: 0.9 },
      ];

      // When
      const merged = mergeRecommendationResults([results1, results2]);

      // Then
      expect(merged[0].productId).toBe('p3');
      expect(merged[0].score).toBe(0.9);
    });

    it('should preserve reason from first occurrence', () => {
      // Given
      const results1 = [
        { productId: 'p1', score: 0.8, reason: 'Reason 1' },
      ];
      const results2 = [
        { productId: 'p1', score: 0.9 },
      ];

      // When
      const merged = mergeRecommendationResults([results1, results2]);

      // Then
      const p1 = merged.find((r) => r.productId === 'p1');
      expect(p1?.reason).toBe('Reason 1');
    });
  });

  describe('weightedMergeRecommendationResults()', () => {
    it('should merge results with weights', () => {
      // Given
      const weightedResults = [
        {
          items: [{ productId: 'p1', score: 0.8 }],
          weight: 0.6,
        },
        {
          items: [{ productId: 'p1', score: 0.9 }],
          weight: 0.4,
        },
      ];

      // When
      const merged = weightedMergeRecommendationResults(weightedResults);

      // Then
      expect(merged).toHaveLength(1);
      const p1 = merged.find((r) => r.productId === 'p1');
      // (0.8 * 0.6 + 0.9 * 0.4) / (0.6 + 0.4) = (0.48 + 0.36) / 1 = 0.84
      expect(p1?.score).toBeCloseTo(0.84, 5);
    });

    it('should handle products with different weights', () => {
      // Given
      const weightedResults = [
        {
          items: [{ productId: 'p1', score: 1.0 }, { productId: 'p2', score: 0.5 }],
          weight: 0.8,
        },
        {
          items: [{ productId: 'p1', score: 0.5 }, { productId: 'p3', score: 0.9 }],
          weight: 0.2,
        },
      ];

      // When
      const merged = weightedMergeRecommendationResults(weightedResults);

      // Then
      expect(merged).toHaveLength(3);
      const p1 = merged.find((r) => r.productId === 'p1');
      // (1.0 * 0.8 + 0.5 * 0.2) / 1.0 = (0.8 + 0.1) / 1 = 0.9
      expect(p1?.score).toBeCloseTo(0.9, 5);
    });
  });
});
