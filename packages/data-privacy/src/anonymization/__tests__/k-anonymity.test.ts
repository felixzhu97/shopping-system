import { describe, it, expect } from 'vitest';
import {
  kAnonymize,
  checkKAnonymity,
  getKAnonymityStats,
} from '../k-anonymity';

describe('K-Anonymity', () => {
  describe('kAnonymize()', () => {
    it('should throw error when data length is less than k', () => {
      const data = [{ age: 25, zipcode: '10001' }];
      
      expect(() => {
        kAnonymize(data, {
          k: 2,
          quasiIdentifiers: ['age', 'zipcode'],
        });
      }).toThrow();
    });

    it('should return anonymized data when k-anonymity is satisfied', () => {
      const data = [
        { age: 25, zipcode: '10001', disease: 'flu' },
        { age: 25, zipcode: '10001', disease: 'flu' },
        { age: 26, zipcode: '10002', disease: 'cancer' },
        { age: 26, zipcode: '10002', disease: 'cancer' },
      ];
      
      const anonymized = kAnonymize(data, {
        k: 2,
        quasiIdentifiers: ['age', 'zipcode'],
        sensitiveFields: ['disease'],
      });
      
      expect(anonymized.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('checkKAnonymity()', () => {
    it('should return true when k-anonymity is satisfied', () => {
      const data = [
        { age: 25, zipcode: '10001' },
        { age: 25, zipcode: '10001' },
        { age: 26, zipcode: '10002' },
        { age: 26, zipcode: '10002' },
      ];
      
      const satisfies = checkKAnonymity(data, 2, ['age', 'zipcode']);
      expect(satisfies).toBe(true);
    });

    it('should return false when k-anonymity is not satisfied', () => {
      const data = [
        { age: 25, zipcode: '10001' },
        { age: 26, zipcode: '10002' },
      ];
      
      const satisfies = checkKAnonymity(data, 2, ['age', 'zipcode']);
      expect(satisfies).toBe(false);
    });
  });

  describe('getKAnonymityStats()', () => {
    it('should return statistics about k-anonymity', () => {
      const data = [
        { age: 25, zipcode: '10001' },
        { age: 25, zipcode: '10001' },
        { age: 26, zipcode: '10002' },
        { age: 26, zipcode: '10002' },
      ];
      
      const stats = getKAnonymityStats(data, 2, ['age', 'zipcode']);
      
      expect(stats.totalRecords).toBe(4);
      expect(stats.groupCount).toBe(2);
      expect(stats.satisfiesKAnonymity).toBe(true);
    });
  });
});
