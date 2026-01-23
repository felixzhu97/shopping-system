import { describe, it, expect } from 'vitest';
import {
  classifyPII,
  classifyPIIList,
  groupPIIBySensitivity,
  groupPIIByType,
} from '../classifier';
import { PIIType, PIISensitivity } from '../../types';

describe('PII Classifier', () => {
  describe('classifyPII()', () => {
    it('should classify phone number as direct identifier', () => {
      const pii = {
        type: PIIType.PHONE,
        value: '13812345678',
        startIndex: 0,
        endIndex: 11,
      };
      const classified = classifyPII(pii);
      
      expect(classified.sensitivity).toBe(PIISensitivity.DIRECT_IDENTIFIER);
    });

    it('should classify email as direct identifier', () => {
      const pii = {
        type: PIIType.EMAIL,
        value: 'test@example.com',
        startIndex: 0,
        endIndex: 15,
      };
      const classified = classifyPII(pii);
      
      expect(classified.sensitivity).toBe(PIISensitivity.DIRECT_IDENTIFIER);
    });

    it('should classify name as quasi identifier', () => {
      const pii = {
        type: PIIType.NAME,
        value: 'John Doe',
        startIndex: 0,
        endIndex: 8,
      };
      const classified = classifyPII(pii);
      
      expect(classified.sensitivity).toBe(PIISensitivity.QUASI_IDENTIFIER);
    });

    it('should classify bank card as sensitive', () => {
      const pii = {
        type: PIIType.BANK_CARD,
        value: '6222021234567890',
        startIndex: 0,
        endIndex: 16,
      };
      const classified = classifyPII(pii);
      
      expect(classified.sensitivity).toBe(PIISensitivity.SENSITIVE);
    });
  });

  describe('classifyPIIList()', () => {
    it('should classify multiple PII items', () => {
      const piiList = [
        {
          type: PIIType.PHONE,
          value: '13812345678',
          startIndex: 0,
          endIndex: 11,
        },
        {
          type: PIIType.EMAIL,
          value: 'test@example.com',
          startIndex: 0,
          endIndex: 15,
        },
      ];
      const classified = classifyPIIList(piiList);
      
      expect(classified.length).toBe(2);
      expect(classified.every(pii => pii.sensitivity)).toBe(true);
    });
  });

  describe('groupPIIBySensitivity()', () => {
    it('should group PII by sensitivity level', () => {
      const piiList = [
        {
          type: PIIType.PHONE,
          value: '13812345678',
          startIndex: 0,
          endIndex: 11,
          sensitivity: PIISensitivity.DIRECT_IDENTIFIER,
        },
        {
          type: PIIType.NAME,
          value: 'John',
          startIndex: 0,
          endIndex: 4,
          sensitivity: PIISensitivity.QUASI_IDENTIFIER,
        },
      ];
      const grouped = groupPIIBySensitivity(piiList);
      
      expect(grouped[PIISensitivity.DIRECT_IDENTIFIER].length).toBe(1);
      expect(grouped[PIISensitivity.QUASI_IDENTIFIER].length).toBe(1);
      expect(grouped[PIISensitivity.SENSITIVE].length).toBe(0);
    });
  });

  describe('groupPIIByType()', () => {
    it('should group PII by type', () => {
      const piiList = [
        {
          type: PIIType.PHONE,
          value: '13812345678',
          startIndex: 0,
          endIndex: 11,
          sensitivity: PIISensitivity.DIRECT_IDENTIFIER,
        },
        {
          type: PIIType.EMAIL,
          value: 'test@example.com',
          startIndex: 0,
          endIndex: 15,
          sensitivity: PIISensitivity.DIRECT_IDENTIFIER,
        },
      ];
      const grouped = groupPIIByType(piiList);
      
      expect(grouped[PIIType.PHONE].length).toBe(1);
      expect(grouped[PIIType.EMAIL].length).toBe(1);
    });
  });
});
