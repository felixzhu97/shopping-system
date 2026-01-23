import { describe, it, expect } from 'vitest';
import {
  isExpired,
  calculateExpirationTime,
  shouldDelete,
  isPolicyApplicable,
} from '../policy';
import { RetentionPolicy, DataItemMetadata } from '../../types';

describe('Retention Policy', () => {
  const policy: RetentionPolicy = {
    id: 'test-policy',
    name: 'Test Policy',
    retentionDays: 30,
    autoDelete: true,
  };

  describe('isExpired()', () => {
    it('should return true when data is expired', () => {
      const metadata: DataItemMetadata = {
        id: 'item1',
        type: 'user_data',
        createdAt: Date.now() - 31 * 24 * 60 * 60 * 1000, // 31 days ago
      };
      
      expect(isExpired(metadata, policy)).toBe(true);
    });

    it('should return false when data is not expired', () => {
      const metadata: DataItemMetadata = {
        id: 'item1',
        type: 'user_data',
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
      };
      
      expect(isExpired(metadata, policy)).toBe(false);
    });
  });

  describe('shouldDelete()', () => {
    it('should return true when autoDelete is enabled and data is expired', () => {
      const metadata: DataItemMetadata = {
        id: 'item1',
        type: 'user_data',
        createdAt: Date.now() - 31 * 24 * 60 * 60 * 1000,
      };
      
      expect(shouldDelete(metadata, policy)).toBe(true);
    });

    it('should return false when autoDelete is disabled', () => {
      const noAutoDeletePolicy: RetentionPolicy = {
        ...policy,
        autoDelete: false,
      };
      const metadata: DataItemMetadata = {
        id: 'item1',
        type: 'user_data',
        createdAt: Date.now() - 31 * 24 * 60 * 60 * 1000,
      };
      
      expect(shouldDelete(metadata, noAutoDeletePolicy)).toBe(false);
    });
  });

  describe('isPolicyApplicable()', () => {
    it('should return true when policy applies to data type', () => {
      const typedPolicy: RetentionPolicy = {
        ...policy,
        dataTypes: ['user_data'],
      };
      const metadata: DataItemMetadata = {
        id: 'item1',
        type: 'user_data',
        createdAt: Date.now(),
      };
      
      expect(isPolicyApplicable(metadata, typedPolicy)).toBe(true);
    });
  });
});
