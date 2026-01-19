import { describe, it, expect } from 'vitest';
import {
  cleanData,
  cleanDataArray,
  removeEmptyValues,
  removeNullish,
} from '../cleaner';

describe('Data Cleaner', () => {
  describe('cleanData()', () => {
    it('should remove empty strings when removeEmpty is true', () => {
      const obj = {
        name: 'John',
        email: '',
        phone: '13812345678',
      };
      const cleaned = cleanData(obj, { removeEmpty: true });
      
      expect(cleaned.email).toBeUndefined();
      expect(cleaned.name).toBe('John');
    });

    it('should remove null values when removeNull is true', () => {
      const obj = {
        name: 'John',
        email: null,
        phone: '13812345678',
      };
      const cleaned = cleanData(obj, { removeNull: true });
      
      expect(cleaned.email).toBeUndefined();
    });

    it('should remove undefined values when removeUndefined is true', () => {
      const obj = {
        name: 'John',
        email: undefined,
        phone: '13812345678',
      };
      const cleaned = cleanData(obj, { removeUndefined: true });
      
      expect(cleaned.email).toBeUndefined();
    });
  });

  describe('removeEmptyValues()', () => {
    it('should remove null, undefined, and empty strings', () => {
      const obj = {
        name: 'John',
        email: '',
        phone: null,
        address: undefined,
      };
      const cleaned = removeEmptyValues(obj);
      
      expect(cleaned.name).toBe('John');
      expect(cleaned.email).toBeUndefined();
      expect(cleaned.phone).toBeUndefined();
      expect(cleaned.address).toBeUndefined();
    });
  });

  describe('removeNullish()', () => {
    it('should remove null and undefined but keep empty strings', () => {
      const obj = {
        name: 'John',
        email: '',
        phone: null,
        address: undefined,
      };
      const cleaned = removeNullish(obj);
      
      expect(cleaned.name).toBe('John');
      expect(cleaned.email).toBe('');
      expect(cleaned.phone).toBeUndefined();
      expect(cleaned.address).toBeUndefined();
    });
  });
});
