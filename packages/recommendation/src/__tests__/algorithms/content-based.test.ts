import { describe, it, expect, beforeEach } from 'vitest';
import { ContentBasedRecommendationAlgorithm } from '../../algorithms/content-based';
import { AlgorithmType, RecommendationOptions, UserBehavior } from '../../types';
import { Product, Order } from 'types';

describe('ContentBasedRecommendationAlgorithm', () => {
  let products: Product[];
  let algorithm: ContentBasedRecommendationAlgorithm;

  beforeEach(() => {
    algorithm = new ContentBasedRecommendationAlgorithm();
    products = [
      {
        id: '1',
        name: 'Laptop',
        description: 'Gaming laptop',
        price: 1000,
        image: '',
        category: 'Electronics',
        stock: 10,
        rating: 4.5,
      },
      {
        id: '2',
        name: 'Smartphone',
        description: 'High-end smartphone',
        price: 800,
        image: '',
        category: 'Electronics',
        stock: 20,
        rating: 4.8,
      },
      {
        id: '3',
        name: 'T-Shirt',
        description: 'Cotton t-shirt',
        price: 20,
        image: '',
        category: 'Clothing',
        stock: 50,
        rating: 4.0,
      },
    ];
  });

  describe('recommend()', () => {
    it('should return empty array when no user behavior provided', () => {
      // Given
      const options: RecommendationOptions = {
        algorithm: AlgorithmType.CONTENT_BASED,
      };

      // When
      const results = algorithm.recommend(products, options);

      // Then
      expect(results).toEqual([]);
    });

    it('should recommend similar products based on purchased items', () => {
      // Given
      const userBehavior: UserBehavior = {
        userId: 'user1',
        purchasedProductIds: ['1'],
      };
      const options: RecommendationOptions = {
        algorithm: AlgorithmType.CONTENT_BASED,
        userBehavior,
        limit: 10,
      };

      // When
      const results = algorithm.recommend(products, options);

      // Then
      expect(results.length).toBeGreaterThan(0);
      // Product 2 should be recommended (same category, similar price)
      expect(results[0].productId).toBe('2');
      expect(results[0].product?.category).toBe('Electronics');
    });

    it('should exclude already purchased products', () => {
      // Given
      const userBehavior: UserBehavior = {
        userId: 'user1',
        purchasedProductIds: ['1', '2'],
      };
      const options: RecommendationOptions = {
        algorithm: AlgorithmType.CONTENT_BASED,
        userBehavior,
      };

      // When
      const results = algorithm.recommend(products, options);

      // Then
      expect(results.find((r) => r.productId === '1')).toBeUndefined();
      expect(results.find((r) => r.productId === '2')).toBeUndefined();
    });

    it('should use orders to extract purchased products', () => {
      // Given
      const orders: Order[] = [
        {
          id: 'order1',
          userId: 'user1',
          items: [
            {
              productId: '1',
              quantity: 1,
            },
          ],
          totalAmount: 1000,
          status: 'delivered',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const userBehavior: UserBehavior = {
        userId: 'user1',
        orders,
      };
      const options: RecommendationOptions = {
        algorithm: AlgorithmType.CONTENT_BASED,
        userBehavior,
      };

      // When
      const results = algorithm.recommend(products, options);

      // Then
      expect(results.length).toBeGreaterThan(0);
      expect(results.find((r) => r.productId === '1')).toBeUndefined();
    });

    it('should respect limit option', () => {
      // Given
      const userBehavior: UserBehavior = {
        userId: 'user1',
        purchasedProductIds: ['1'],
      };
      const options: RecommendationOptions = {
        algorithm: AlgorithmType.CONTENT_BASED,
        userBehavior,
        limit: 1,
      };

      // When
      const results = algorithm.recommend(products, options);

      // Then
      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('should exclude specified product IDs', () => {
      // Given
      const userBehavior: UserBehavior = {
        userId: 'user1',
        purchasedProductIds: ['1'],
      };
      const options: RecommendationOptions = {
        algorithm: AlgorithmType.CONTENT_BASED,
        userBehavior,
        excludeProductIds: ['2'],
      };

      // When
      const results = algorithm.recommend(products, options);

      // Then
      expect(results.find((r) => r.productId === '2')).toBeUndefined();
    });
  });
});
