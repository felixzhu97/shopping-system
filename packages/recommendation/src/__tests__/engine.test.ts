import { describe, it, expect, beforeEach } from 'vitest';
import { RecommendationEngine } from '../engine';
import { AlgorithmType, SimpleRecommendationType, UserBehavior } from '../types';
import { Product, Order } from 'types';

describe('RecommendationEngine', () => {
  let products: Product[];
  let engine: RecommendationEngine;

  beforeEach(() => {
    products = [
      {
        id: '1',
        name: 'Product 1',
        description: 'Test',
        price: 100,
        image: '',
        category: 'Electronics',
        stock: 10,
        rating: 4.5,
        reviewCount: 100,
      },
      {
        id: '2',
        name: 'Product 2',
        description: 'Test',
        price: 200,
        image: '',
        category: 'Electronics',
        stock: 20,
        rating: 4.8,
        reviewCount: 200,
      },
      {
        id: '3',
        name: 'Product 3',
        description: 'Test',
        price: 150,
        image: '',
        category: 'Clothing',
        stock: 5,
        rating: 3.5,
        reviewCount: 50,
      },
    ];
    engine = new RecommendationEngine(products);
  });

  describe('recommend()', () => {
    it('should return recommendations using hybrid algorithm', async () => {
      // Given
      const userBehavior: UserBehavior = {
        userId: 'user1',
        purchasedProductIds: ['1'],
      };

      // When
      const results = await engine.recommend({
        algorithm: AlgorithmType.HYBRID,
        userBehavior,
        limit: 5,
      });

      // Then
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('productId');
      expect(results[0]).toHaveProperty('score');
    });

    it('should return recommendations using content-based algorithm', async () => {
      // Given
      const userBehavior: UserBehavior = {
        userId: 'user1',
        purchasedProductIds: ['1'],
      };

      // When
      const results = await engine.recommend({
        algorithm: AlgorithmType.CONTENT_BASED,
        userBehavior,
        limit: 5,
      });

      // Then
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].productId).not.toBe('1');
    });

    it('should return recommendations using simple algorithm', async () => {
      // When
      const results = await engine.recommend({
        algorithm: SimpleRecommendationType.POPULAR,
        limit: 5,
      });

      // Then
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('product');
    });

    it('should respect limit option', async () => {
      // When
      const results = await engine.recommend({
        algorithm: AlgorithmType.SIMPLE,
        simpleType: SimpleRecommendationType.POPULAR,
        limit: 2,
      });

      // Then
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should exclude specified product IDs', async () => {
      // When
      const results = await engine.recommend({
        algorithm: AlgorithmType.SIMPLE,
        simpleType: SimpleRecommendationType.POPULAR,
        excludeProductIds: ['1', '2'],
      });

      // Then
      expect(results.find((r) => r.productId === '1')).toBeUndefined();
      expect(results.find((r) => r.productId === '2')).toBeUndefined();
    });

    it('should filter out invalid products', async () => {
      // Given
      const invalidProducts: Product[] = [
        ...products,
        {
          id: '',
          name: 'Invalid',
          description: '',
          price: 0,
          image: '',
          category: '',
          stock: 0,
        } as Product,
      ];
      const invalidEngine = new RecommendationEngine(invalidProducts);

      // When
      const results = await invalidEngine.recommend({
        algorithm: AlgorithmType.SIMPLE,
        simpleType: SimpleRecommendationType.POPULAR,
      });

      // Then
      expect(results.every((r) => r.productId && r.product?.name)).toBe(true);
    });

    it('should throw error for unsupported algorithm', async () => {
      // When & Then
      await expect(
        engine.recommend({
          algorithm: 'unsupported' as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('updateProducts()', () => {
    it('should update products list', () => {
      // Given
      const newProducts: Product[] = [
        {
          id: '4',
          name: 'Product 4',
          description: 'Test',
          price: 300,
          image: '',
          category: 'Electronics',
          stock: 15,
          rating: 5.0,
        },
      ];

      // When
      engine.updateProducts(newProducts);

      // Then
      expect(engine.getProducts()).toEqual(newProducts);
    });
  });

  describe('getProducts()', () => {
    it('should return copy of products list', () => {
      // When
      const returnedProducts = engine.getProducts();

      // Then
      expect(returnedProducts).toEqual(products);
      expect(returnedProducts).not.toBe(products); // Should be a copy
    });
  });
});
