import { describe, it, expect, beforeEach } from 'vitest';
import { ConsentManager, createConsentManager } from '../manager';
import { ConsentPurpose, ConsentStatus } from '../../types';

describe('Consent Manager', () => {
  let manager: ConsentManager;

  beforeEach(() => {
    manager = createConsentManager();
  });

  describe('grantConsent()', () => {
    it('should grant consent for user', async () => {
      const record = await manager.grantConsent('user1', ConsentPurpose.MARKETING);
      
      expect(record.status).toBe(ConsentStatus.GRANTED);
      expect(record.userId).toBe('user1');
      expect(record.purpose).toBe(ConsentPurpose.MARKETING);
    });
  });

  describe('denyConsent()', () => {
    it('should deny consent for user', async () => {
      const record = await manager.denyConsent('user1', ConsentPurpose.MARKETING);
      
      expect(record.status).toBe(ConsentStatus.DENIED);
    });
  });

  describe('hasConsent()', () => {
    it('should return true when consent is granted', async () => {
      await manager.grantConsent('user1', ConsentPurpose.MARKETING);
      const hasConsent = await manager.hasConsent('user1', ConsentPurpose.MARKETING);
      
      expect(hasConsent).toBe(true);
    });

    it('should return false when consent is not granted', async () => {
      const hasConsent = await manager.hasConsent('user1', ConsentPurpose.MARKETING);
      
      expect(hasConsent).toBe(false);
    });
  });

  describe('withdrawConsent()', () => {
    it('should withdraw granted consent', async () => {
      await manager.grantConsent('user1', ConsentPurpose.MARKETING);
      const record = await manager.withdrawConsent('user1', ConsentPurpose.MARKETING);
      
      expect(record).not.toBeNull();
      expect(record?.status).toBe(ConsentStatus.WITHDRAWN);
      expect(record?.withdrawnAt).toBeDefined();
    });
  });
});
