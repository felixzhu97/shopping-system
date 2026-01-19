import { describe, it, expect } from 'vitest';
import { maskName } from '../../masking/name';

describe('Name Masking', () => {
  describe('maskName()', () => {
    it('should mask two-character name', () => {
      expect(maskName('张三')).toBe('张*');
      expect(maskName('李四')).toBe('李*');
    });

    it('should mask three-character name', () => {
      expect(maskName('张三丰')).toBe('张**');
    });

    it('should mask four-character name', () => {
      expect(maskName('张三丰四')).toBe('张**四');
    });

    it('should handle single character', () => {
      expect(maskName('张')).toBe('*');
    });

    it('should handle empty string', () => {
      expect(maskName('')).toBe('');
    });

    it('should handle names with spaces', () => {
      expect(maskName('张 三')).toBeTruthy();
    });

    it('should handle custom mask character', () => {
      expect(maskName('张三', '#')).toBe('张#');
    });
  });
});
