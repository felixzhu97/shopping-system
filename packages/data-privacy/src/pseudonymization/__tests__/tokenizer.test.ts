import { describe, it, expect } from 'vitest';
import {
  tokenize,
  detokenize,
  tokenizeFields,
} from '../tokenizer';

describe('Tokenization', () => {
  describe('tokenize()', () => {
    it('should generate token for value', () => {
      const token = tokenize('sensitive-data');
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate same token for same value (deterministic)', () => {
      const token1 = tokenize('sensitive-data', { format: 'hash' });
      const token2 = tokenize('sensitive-data', { format: 'hash' });
      
      expect(token1).toBe(token2);
    });

    it('should generate reversible token when encryption key is provided', () => {
      const key = 'test-key';
      const token = tokenize('sensitive-data', {
        reversible: true,
        encryptionKey: key,
      });
      
      expect(token).toBeDefined();
      const original = detokenize(token, key);
      expect(original).toBe('sensitive-data');
    });

    it('should throw error when reversible is true but no key provided', () => {
      expect(() => {
        tokenize('data', { reversible: true });
      }).toThrow();
    });
  });

  describe('tokenizeFields()', () => {
    it('should tokenize specified fields in object', () => {
      const obj = {
        name: 'John',
        email: 'john@example.com',
        phone: '13812345678',
      };
      const tokenized = tokenizeFields(obj, ['email', 'phone']);
      
      expect(tokenized.email).not.toBe('john@example.com');
      expect(tokenized.phone).not.toBe('13812345678');
      expect(tokenized.name).toBe('John');
    });
  });
});
