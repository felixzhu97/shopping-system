import { describe, it, expect, beforeEach } from 'vitest';
import { AuditLogger, createAuditLogger } from '../logger';
import { AuditAction } from '../../types';

describe('Audit Logger', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    logger = createAuditLogger();
  });

  describe('logView()', () => {
    it('should log view action', async () => {
      const entry = await logger.logView('user1', 'user', 'user123');
      
      expect(entry.action).toBe(AuditAction.VIEW);
      expect(entry.userId).toBe('user1');
      expect(entry.resourceType).toBe('user');
      expect(entry.resourceId).toBe('user123');
      expect(entry.result).toBe('success');
    });
  });

  describe('logCreate()', () => {
    it('should log create action', async () => {
      const entry = await logger.logCreate('user1', 'order', 'order123');
      
      expect(entry.action).toBe(AuditAction.CREATE);
      expect(entry.result).toBe('success');
    });
  });

  describe('query()', () => {
    it('should query logs by user', async () => {
      await logger.logView('user1', 'user', 'user123');
      await logger.logView('user2', 'user', 'user456');
      
      const logs = await logger.query({ userId: 'user1' });
      
      expect(logs.length).toBe(1);
      expect(logs[0].userId).toBe('user1');
    });
  });
});
