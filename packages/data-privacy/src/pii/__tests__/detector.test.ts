import { describe, it, expect } from 'vitest';
import { detectPII, detectPIIInObject, hasPII, countPII } from '../detector';
import { PIIType } from '../../types';

describe('PII Detector', () => {
  describe('detectPII()', () => {
    it('should detect phone numbers in text', () => {
      const text = 'Contact me at 13812345678';
      const detected = detectPII(text);
      
      expect(detected.length).toBeGreaterThan(0);
      expect(detected.some(pii => pii.type === PIIType.PHONE)).toBe(true);
    });

    it('should detect email addresses in text', () => {
      const text = 'Send email to test@example.com';
      const detected = detectPII(text);
      
      expect(detected.length).toBeGreaterThan(0);
      expect(detected.some(pii => pii.type === PIIType.EMAIL)).toBe(true);
    });

    it('should detect multiple PII types', () => {
      const text = 'Contact 13812345678 or test@example.com';
      const detected = detectPII(text);
      
      expect(detected.length).toBeGreaterThanOrEqual(2);
      const types = detected.map(pii => pii.type);
      expect(types).toContain(PIIType.PHONE);
      expect(types).toContain(PIIType.EMAIL);
    });

    it('should filter by specified types', () => {
      const text = 'Contact 13812345678 or test@example.com';
      const detected = detectPII(text, { types: [PIIType.EMAIL] });
      
      expect(detected.every(pii => pii.type === PIIType.EMAIL)).toBe(true);
    });

    it('should return empty array when no PII found', () => {
      const text = 'This is a normal text without any personal information';
      const detected = detectPII(text);
      
      expect(detected).toEqual([]);
    });

    it('should include confidence when detailed option is true', () => {
      const text = 'Contact 13812345678';
      const detected = detectPII(text, { detailed: true });
      
      expect(detected.length).toBeGreaterThan(0);
      expect(detected[0].confidence).toBeDefined();
    });
  });

  describe('detectPIIInObject()', () => {
    it('should detect PII in object fields', () => {
      const obj = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '13812345678',
      };
      const detected = detectPIIInObject(obj);
      
      expect(detected.length).toBeGreaterThan(0);
      expect(detected.some(pii => pii.fieldPath === 'email')).toBe(true);
      expect(detected.some(pii => pii.fieldPath === 'phone')).toBe(true);
    });

    it('should detect PII in nested objects', () => {
      const obj = {
        user: {
          contact: {
            email: 'test@example.com',
          },
        },
      };
      const detected = detectPIIInObject(obj);
      
      expect(detected.length).toBeGreaterThan(0);
      expect(detected.some(pii => pii.fieldPath === 'user.contact.email')).toBe(true);
    });

    it('should detect PII in arrays', () => {
      const obj = {
        contacts: ['test@example.com', 'another@example.com'],
      };
      const detected = detectPIIInObject(obj);
      
      expect(detected.length).toBeGreaterThan(0);
      expect(detected.some(pii => pii.fieldPath.startsWith('contacts['))).toBe(true);
    });
  });

  describe('hasPII()', () => {
    it('should return true when PII is present', () => {
      const text = 'Contact 13812345678';
      expect(hasPII(text)).toBe(true);
    });

    it('should return false when no PII is present', () => {
      const text = 'This is a normal text';
      expect(hasPII(text)).toBe(false);
    });
  });

  describe('countPII()', () => {
    it('should count PII by type', () => {
      const text = 'Contact 13812345678 or 15987654321 or test@example.com';
      const counts = countPII(text);
      
      expect(counts[PIIType.PHONE]).toBeGreaterThanOrEqual(2);
      expect(counts[PIIType.EMAIL]).toBeGreaterThanOrEqual(1);
    });
  });
});
