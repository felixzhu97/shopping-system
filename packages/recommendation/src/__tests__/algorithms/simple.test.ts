import { describe, it, expect, beforeEach } from 'vitest';
import { SimpleRecommendationAlgorithm } from '../../algorithms/simple';
import { SimpleRecommendationType, RecommendationOptions } from '../../types';
import { Product } from 'shared';

describe('SimpleRecommendationAlgorithm', () => {
  let products: Product[];
  let algorithm: SimpleRecommendationAlgorithm;

  beforeEach(() => {
    algorithm = new SimpleRecommendationAlgorithm();
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
  });

  describe('recommend()', () => {
    describe('when using POPULAR type', () => {
      it('should return products sorted by popularity', () => {
        // Given
        const options: RecommendationOptions = {
          algorithm: 'simple',
          simpleType: SimpleRecommendationType.POPULAR,
          limit: 10,
        };

        // When
        const results = algorithm.recommend(products, options);

        // Then
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].productId).toBe('2'); // Highest rated with most reviews
        expect(results[0].score).toBeGreaterThan(results[1].score);
      });

      it('should respect limit option', () => {
        // Given
        const options: RecommendationOptions = {
          algorithm: 'simple',
          simpleType: SimpleRecommendationType.POPULAR,
          limit: 2,
        };

        // When
        const results = algorithm.recommend(products, options);

        // Then
        expect(results.length).toBe(2);
      });

      it('should exclude specified product IDs', () => {
        // Given
        const options: RecommendationOptions = {
          algorithm: 'simple',
          simpleType: SimpleRecommendationType.POPULAR,
          excludeProductIds: ['2'],
        };

        // When
        const results = algorithm.recommend(products, options);

        // Then
        expect(results.find((r) => r.productId === '2')).toBeUndefined();
      });
    });

    describe('when using HIGHEST_RATED type', () => {
      it('should return products sorted by rating', () => {
        // Given
        const options: RecommendationOptions = {
          algorithm: 'simple',
          simpleType: SimpleRecommendationType.HIGHEST_RATED,
          limit: 10,
        };

        // When
        const results = algorithm.recommend(products, options);

        // Then
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].productId).toBe('2'); // Highest rating (4.8)
        expect(results[0].score).toBeGreaterThan(results[1].score);
      });

      it('should only include products with ratings', () => {
        // Given
        const productsWithoutRating: Product[] = [
          ...products,
          {
            id: '4',
            name: 'Product 4',
            description: 'Test',
            price: 100,
            image: '',
            category: 'Electronics',
            stock: 10,
          },
        ];
        const options: RecommendationOptions = {
          algorithm: 'simple',
          simpleType: SimpleRecommendationType.HIGHEST_RATED,
        };

        // When
        const results = algorithm.recommend(productsWithoutRating, options);

        // Then
        expect(results.find((r) => r.productId === '4')).toBeUndefined();
      });
    });

    describe('when using SAME_CATEGORY type', () => {
      it('should return products in same category as target', () => {
        // Given
        const options: RecommendationOptions = {
          algorithm: 'simple',
          simpleType: SimpleRecommendationType.SAME_CATEGORY,
          targetProductId: '1',
        };

        // When
        const results = algorithm.recommend(products, options);

        // Then
        expect(results.length).toBe(1); // Only Product 2 is in same category
        expect(results[0].productId).toBe('2');
        expect(results[0].product?.category).toBe('Electronics');
      });

      it('should exclude target product', () => {
        // Given
        const options: RecommendationOptions = {
          algorithm: 'simple',
          simpleType: SimpleRecommendationType.SAME_CATEGORY,
          targetProductId: '1',
        };

        // When
        const results = algorithm.recommend(products, options);

        // Then
        expect(results.find((r) => r.productId === '1')).toBeUndefined();
      });

      it('should return empty array when target product not found', () => {
        // Given
        const options: RecommendationOptions = {
          algorithm: 'simple',
          simpleType: SimpleRecommendationType.SAME_CATEGORY,
          targetProductId: 'nonexistent',
        };

        // When
        const results = algorithm.recommend(products, options);

        // Then
        expect(results).toEqual([]);
      });
    });
  });
});
