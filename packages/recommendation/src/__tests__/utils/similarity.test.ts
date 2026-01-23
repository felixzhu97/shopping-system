import { describe, it, expect } from 'vitest';
import {
  jaccardSimilarity,
  cosineSimilarity,
  calculateProductSimilarity,
  calculateUserSimilarity,
} from '../../utils/similarity';
import { Product } from 'types';

describe('Similarity Utils', () => {
  describe('jaccardSimilarity()', () => {
    it('should return 1 when both sets are empty', () => {
      // Given
      const setA = new Set<string>();
      const setB = new Set<string>();

      // When
      const result = jaccardSimilarity(setA, setB);

      // Then
      expect(result).toBe(1);
    });

    it('should return 0 when one set is empty', () => {
      // Given
      const setA = new Set<string>(['a', 'b']);
      const setB = new Set<string>();

      // When
      const result = jaccardSimilarity(setA, setB);

      // Then
      expect(result).toBe(0);
    });

    it('should return 1 when sets are identical', () => {
      // Given
      const setA = new Set<string>(['a', 'b', 'c']);
      const setB = new Set<string>(['a', 'b', 'c']);

      // When
      const result = jaccardSimilarity(setA, setB);

      // Then
      expect(result).toBe(1);
    });

    it('should calculate similarity correctly for overlapping sets', () => {
      // Given
      const setA = new Set<string>(['a', 'b', 'c']);
      const setB = new Set<string>(['b', 'c', 'd']);

      // When
      const result = jaccardSimilarity(setA, setB);

      // Then
      // intersection: {b, c} = 2, union: {a, b, c, d} = 4, similarity = 2/4 = 0.5
      expect(result).toBe(0.5);
    });

    it('should return 0 when sets have no overlap', () => {
      // Given
      const setA = new Set<string>(['a', 'b']);
      const setB = new Set<string>(['c', 'd']);

      // When
      const result = jaccardSimilarity(setA, setB);

      // Then
      expect(result).toBe(0);
    });
  });

  describe('cosineSimilarity()', () => {
    it('should return 1 for identical vectors', () => {
      // Given
      const vectorA = [1, 2, 3];
      const vectorB = [1, 2, 3];

      // When
      const result = cosineSimilarity(vectorA, vectorB);

      // Then
      expect(result).toBe(1);
    });

    it('should return 0 for orthogonal vectors', () => {
      // Given
      const vectorA = [1, 0];
      const vectorB = [0, 1];

      // When
      const result = cosineSimilarity(vectorA, vectorB);

      // Then
      expect(result).toBe(0);
    });

    it('should calculate similarity correctly', () => {
      // Given
      const vectorA = [1, 2];
      const vectorB = [2, 4];

      // When
      const result = cosineSimilarity(vectorA, vectorB);

      // Then
      // dotProduct = 1*2 + 2*4 = 10
      // normA = sqrt(1*1 + 2*2) = sqrt(5)
      // normB = sqrt(2*2 + 4*4) = sqrt(20)
      // similarity = 10 / (sqrt(5) * sqrt(20)) = 10 / sqrt(100) = 1
      expect(result).toBeCloseTo(1, 5);
    });

    it('should throw error when vectors have different lengths', () => {
      // Given
      const vectorA = [1, 2];
      const vectorB = [1, 2, 3];

      // When & Then
      expect(() => cosineSimilarity(vectorA, vectorB)).toThrow();
    });

    it('should return 0 when denominator is zero', () => {
      // Given
      const vectorA = [0, 0];
      const vectorB = [1, 1];

      // When
      const result = cosineSimilarity(vectorA, vectorB);

      // Then
      expect(result).toBe(0);
    });
  });

  describe('calculateProductSimilarity()', () => {
    it('should return high similarity for products in same category', () => {
      // Given
      const productA: Product = {
        id: '1',
        name: 'Product A',
        description: 'Test',
        price: 100,
        image: '',
        category: 'Electronics',
        stock: 10,
        rating: 4.5,
      };
      const productB: Product = {
        id: '2',
        name: 'Product B',
        description: 'Test',
        price: 120,
        image: '',
        category: 'Electronics',
        stock: 10,
        rating: 4.0,
      };

      // When
      const result = calculateProductSimilarity(productA, productB);

      // Then
      expect(result).toBeGreaterThan(0.5);
    });

    it('should return lower similarity for products in different categories', () => {
      // Given
      const productA: Product = {
        id: '1',
        name: 'Product A',
        description: 'Test',
        price: 100,
        image: '',
        category: 'Electronics',
        stock: 10,
        rating: 4.5,
      };
      const productB: Product = {
        id: '2',
        name: 'Product B',
        description: 'Test',
        price: 200,
        image: '',
        category: 'Clothing',
        stock: 5,
        rating: 3.0,
      };

      // When
      const result = calculateProductSimilarity(productA, productB);

      // Then
      // Different category (0) + price difference + rating difference = lower similarity
      expect(result).toBeLessThan(0.5);
    });

    it('should consider price similarity', () => {
      // Given
      const productA: Product = {
        id: '1',
        name: 'Product A',
        description: 'Test',
        price: 100,
        image: '',
        category: 'Electronics',
        stock: 10,
      };
      const productB: Product = {
        id: '2',
        name: 'Product B',
        description: 'Test',
        price: 105,
        image: '',
        category: 'Electronics',
        stock: 10,
      };

      // When
      const result = calculateProductSimilarity(productA, productB);

      // Then
      expect(result).toBeGreaterThan(0.7);
    });
  });

  describe('calculateUserSimilarity()', () => {
    it('should return 1 for identical purchase sets', () => {
      // Given
      const userAPurchases = new Set<string>(['p1', 'p2', 'p3']);
      const userBPurchases = new Set<string>(['p1', 'p2', 'p3']);

      // When
      const result = calculateUserSimilarity(userAPurchases, userBPurchases);

      // Then
      expect(result).toBe(1);
    });

    it('should calculate similarity based on Jaccard', () => {
      // Given
      const userAPurchases = new Set<string>(['p1', 'p2', 'p3']);
      const userBPurchases = new Set<string>(['p2', 'p3', 'p4']);

      // When
      const result = calculateUserSimilarity(userAPurchases, userBPurchases);

      // Then
      // intersection: {p2, p3} = 2, union: {p1, p2, p3, p4} = 4, similarity = 0.5
      expect(result).toBe(0.5);
    });
  });
});
