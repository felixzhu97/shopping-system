import { describe, it, expect } from 'vitest';
import {
  filterFields,
  filterFieldsInArray,
  selectFields,
  excludeFields,
} from '../filter';

describe('Field Filter', () => {
  describe('filterFields()', () => {
    it('should include only specified fields', () => {
      const obj = {
        name: 'John',
        email: 'john@example.com',
        phone: '13812345678',
      };
      const filtered = filterFields(obj, {
        include: ['name', 'email'],
      });
      
      expect(filtered.name).toBe('John');
      expect(filtered.email).toBe('john@example.com');
      expect(filtered.phone).toBeUndefined();
    });

    it('should exclude specified fields', () => {
      const obj = {
        name: 'John',
        email: 'john@example.com',
        phone: '13812345678',
      };
      const filtered = filterFields(obj, {
        exclude: ['email', 'phone'],
      });
      
      expect(filtered.name).toBe('John');
      expect(filtered.email).toBeUndefined();
      expect(filtered.phone).toBeUndefined();
    });
  });

  describe('selectFields()', () => {
    it('should select only specified fields', () => {
      const obj = {
        name: 'John',
        email: 'john@example.com',
        phone: '13812345678',
      };
      const selected = selectFields(obj, ['name', 'email']);
      
      expect(selected.name).toBe('John');
      expect(selected.email).toBe('john@example.com');
      expect(selected.phone).toBeUndefined();
    });
  });

  describe('excludeFields()', () => {
    it('should exclude specified fields', () => {
      const obj = {
        name: 'John',
        email: 'john@example.com',
        phone: '13812345678',
      };
      const excluded = excludeFields(obj, ['email', 'phone']);
      
      expect(excluded.name).toBe('John');
      expect(excluded.email).toBeUndefined();
      expect(excluded.phone).toBeUndefined();
    });
  });
});
