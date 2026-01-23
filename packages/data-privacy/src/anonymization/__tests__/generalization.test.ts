import { describe, it, expect } from 'vitest';
import {
  generalizeValue,
  generalizeObject,
  generalizeArray,
} from '../generalization';
import { GeneralizationLevel } from '../../types';

describe('Data Generalization', () => {
  describe('generalizeValue()', () => {
    it('should generalize age values', () => {
      const age25 = generalizeValue(25, 'age', GeneralizationLevel.PARTIAL);
      expect(typeof age25).toBe('string');
      expect(age25).toContain('-');
    });

    it('should generalize date values', () => {
      const date = generalizeValue('2023-06-15', 'date', GeneralizationLevel.FULL);
      expect(date).toBe('2023');
    });

    it('should use custom function when provided', () => {
      const customFn = (value: unknown) => `custom_${value}`;
      const result = generalizeValue('test', 'field', GeneralizationLevel.FULL, customFn);
      expect(result).toBe('custom_test');
    });
  });

  describe('generalizeObject()', () => {
    it('should generalize object fields according to rules', () => {
      const obj = {
        age: 25,
        name: 'John',
      };
      const rules = [
        {
          field: 'age',
          level: GeneralizationLevel.PARTIAL,
        },
      ];
      const generalized = generalizeObject(obj, rules);
      
      expect(generalized.age).not.toBe(25);
      expect(generalized.name).toBe('John');
    });
  });

  describe('generalizeArray()', () => {
    it('should generalize array of objects', () => {
      const data = [
        { age: 25, name: 'John' },
        { age: 30, name: 'Jane' },
      ];
      const rules = [
        {
          field: 'age',
          level: GeneralizationLevel.PARTIAL,
        },
      ];
      const generalized = generalizeArray(data, rules);
      
      expect(generalized.length).toBe(2);
      expect(generalized[0].age).not.toBe(25);
      expect(generalized[1].age).not.toBe(30);
    });
  });
});
