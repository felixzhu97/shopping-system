import { describe, it, expect } from 'vitest';
import {
  calculateDiscountPercentage,
  getProductImages,
  isProductOnSale,
  getProductDiscount,
  getProductMainImage,
  hasProductRating,
  getProductAverageRating,
} from '../src/product';
import type { Product } from 'shared';

describe('Product Utils', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test',
    price: 80,
    originalPrice: 100,
    image: 'main.jpg',
    category: 'test',
    stock: 10,
    rating: 4.5,
    reviewCount: 100,
  };

  describe('calculateDiscountPercentage()', () => {
    it('should calculate discount percentage correctly', () => {
      // Given & When & Then
      expect(calculateDiscountPercentage(100, 80)).toBe(20);
      expect(calculateDiscountPercentage(100, 50)).toBe(50);
    });

    it('should return null when there is no discount', () => {
      // Given & When & Then
      expect(calculateDiscountPercentage(100, 100)).toBe(null);
      expect(calculateDiscountPercentage(100, 120)).toBe(null);
    });

    it('should return null when original price is not provided', () => {
      // Given & When & Then
      expect(calculateDiscountPercentage(undefined, 80)).toBe(null);
      expect(calculateDiscountPercentage(0, 80)).toBe(null);
    });
  });

  describe('getProductImages()', () => {
    it('should return main image', () => {
      // Given
      const product = mockProduct;

      // When
      const images = getProductImages(product);

      // Then
      expect(images).toContain('main.jpg');
      expect(images.length).toBe(1);
    });

    it('should support default image', () => {
      // Given
      const productWithoutImage = { ...mockProduct, image: '' };
      const options = { defaultImage: 'default.jpg' };

      // When
      const images = getProductImages(productWithoutImage, options);

      // Then
      expect(images).toContain('default.jpg');
    });

    it('should exclude main image when specified', () => {
      // Given
      const product = mockProduct;
      const options = { includeMainImage: false };

      // When
      const images = getProductImages(product, options);

      // Then
      expect(images).not.toContain('main.jpg');
    });
  });

  describe('isProductOnSale()', () => {
    it('should identify products on sale', () => {
      // Given
      const product = mockProduct;

      // When & Then
      expect(isProductOnSale(product)).toBe(true);
    });

    it('should identify products not on sale', () => {
      // Given
      const regularProduct = { ...mockProduct, originalPrice: undefined };
      const samePriceProduct = { ...mockProduct, price: 100, originalPrice: 100 };

      // When & Then
      expect(isProductOnSale(regularProduct)).toBe(false);
      expect(isProductOnSale(samePriceProduct)).toBe(false);
    });
  });

  describe('getProductDiscount()', () => {
    it('should return discount information', () => {
      // Given
      const product = mockProduct;

      // When
      const discount = getProductDiscount(product);

      // Then
      expect(discount).not.toBe(null);
      if (discount) {
        expect(discount.percentage).toBe(20);
        expect(discount.amount).toBe(20);
      }
    });

    it('should return null when there is no discount', () => {
      // Given
      const regularProduct = { ...mockProduct, originalPrice: undefined };

      // When
      const result = getProductDiscount(regularProduct);

      // Then
      expect(result).toBe(null);
    });
  });

  describe('getProductMainImage()', () => {
    it('should return main image', () => {
      // Given
      const product = mockProduct;

      // When
      const result = getProductMainImage(product);

      // Then
      expect(result).toBe('main.jpg');
    });

    it('should return default image when main image is not available', () => {
      // Given
      const productWithoutImage = { ...mockProduct, image: '' };
      const defaultImage = 'default.jpg';

      // When
      const result = getProductMainImage(productWithoutImage, defaultImage);

      // Then
      expect(result).toBe('default.jpg');
    });

    it('should return empty string when no image and no default image', () => {
      // Given
      const productWithoutImage = { ...mockProduct, image: '' };

      // When
      const result = getProductMainImage(productWithoutImage);

      // Then
      expect(result).toBe('');
    });
  });

  describe('hasProductRating()', () => {
    it('should identify products with rating', () => {
      // Given
      const product = mockProduct;

      // When & Then
      expect(hasProductRating(product)).toBe(true);
    });

    it('should identify products without rating', () => {
      // Given
      const productWithoutRating = { ...mockProduct, rating: undefined };
      const productWithZeroRating = { ...mockProduct, rating: 0 };

      // When & Then
      expect(hasProductRating(productWithoutRating)).toBe(false);
      expect(hasProductRating(productWithZeroRating)).toBe(false);
    });
  });

  describe('getProductAverageRating()', () => {
    it('should return average rating', () => {
      // Given
      const product = mockProduct;

      // When
      const result = getProductAverageRating(product);

      // Then
      expect(result).toBe(4.5);
    });

    it('should round to one decimal place', () => {
      // Given
      const product = { ...mockProduct, rating: 4.56 };

      // When
      const result = getProductAverageRating(product);

      // Then
      expect(result).toBe(4.6);
    });

    it('should return null when there is no rating', () => {
      // Given
      const productWithoutRating = { ...mockProduct, rating: undefined };

      // When
      const result = getProductAverageRating(productWithoutRating);

      // Then
      expect(result).toBe(null);
    });
  });
});
