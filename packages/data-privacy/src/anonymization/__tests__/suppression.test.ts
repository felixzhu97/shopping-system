import { describe, it, expect } from 'vitest';
import {
  suppressFields,
  suppressFieldsInArray,
  suppressFieldsDeep,
} from '../suppression';

describe('Data Suppression', () => {
  describe('suppressFields()', () => {
    it('should remove fields when method is remove', () => {
      const obj = {
        name: 'John',
        email: 'john@example.com',
        phone: '13812345678',
      };
      const suppressed = suppressFields(obj, {
        fields: ['email', 'phone'],
        method: 'remove',
      });
      
      expect(suppressed.email).toBeUndefined();
      expect(suppressed.phone).toBeUndefined();
      expect(suppressed.name).toBe('John');
    });

    it('should mask fields when method is mask', () => {
      const obj = {
        email: 'john@example.com',
      };
      const suppressed = suppressFields(obj, {
        fields: ['email'],
        method: 'mask',
      });
      
      expect(suppressed.email).toBeDefined();
      expect(suppressed.email).not.toBe('john@example.com');
    });

    it('should use custom mask character', () => {
      const obj = {
        email: 'test@example.com',
      };
      const suppressed = suppressFields(obj, {
        fields: ['email'],
        method: 'mask',
        maskChar: '#',
      });
      
      expect(suppressed.email).toContain('#');
    });
  });

  describe('suppressFieldsInArray()', () => {
    it('should suppress fields in array of objects', () => {
      const data = [
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' },
      ];
      const suppressed = suppressFieldsInArray(data, {
        fields: ['email'],
        method: 'remove',
      });
      
      expect(suppressed.length).toBe(2);
      expect(suppressed[0].email).toBeUndefined();
      expect(suppressed[1].email).toBeUndefined();
    });
  });

  describe('suppressFieldsDeep()', () => {
    it('should suppress fields in nested objects', () => {
      const obj = {
        user: {
          email: 'test@example.com',
          name: 'John',
        },
      };
      const suppressed = suppressFieldsDeep(obj, {
        fields: ['email'],
        method: 'remove',
      });
      
      expect((suppressed.user as Record<string, unknown>).email).toBeUndefined();
    });
  });
});
