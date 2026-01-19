/**
 * 审计日志记录器：记录数据访问、修改、删除等操作
 */

import { createMemoryAuditLogStorage, type MemoryAuditLogStorage } from './storage';
import type {
  AuditLogEntry,
  AuditLogQueryOptions,
  AuditLogStorageAdapter,
} from '../types';
import { AuditAction } from '../types';

/**
 * 审计日志记录器
 */
export class AuditLogger {
  private storage: AuditLogStorageAdapter;
  private defaultUserId?: string;
  private defaultIpAddress?: string;
  private defaultUserAgent?: string;

  constructor(storage?: AuditLogStorageAdapter) {
    this.storage = storage || createMemoryAuditLogStorage();
  }

  /**
   * 设置默认用户 ID
   */
  setDefaultUserId(userId: string): void {
    this.defaultUserId = userId;
  }

  /**
   * 设置默认 IP 地址
   */
  setDefaultIpAddress(ipAddress: string): void {
    this.defaultIpAddress = ipAddress;
  }

  /**
   * 设置默认用户代理
   */
  setDefaultUserAgent(userAgent: string): void {
    this.defaultUserAgent = userAgent;
  }

  /**
   * 记录日志
   */
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const fullEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      userId: entry.userId || this.defaultUserId || 'unknown',
      ipAddress: entry.ipAddress || this.defaultIpAddress,
      userAgent: entry.userAgent || this.defaultUserAgent,
      ...entry,
    };

    await this.storage.save(fullEntry);
    return fullEntry;
  }

  /**
   * 记录查看操作
   */
  async logView(
    userId: string,
    resourceType: string,
    resourceId: string,
    options?: {
      ipAddress?: string;
      userAgent?: string;
      details?: Record<string, unknown>;
    }
  ): Promise<AuditLogEntry> {
    return this.log({
      userId,
      action: AuditAction.VIEW,
      resourceType,
      resourceId,
      result: 'success',
      ...options,
    });
  }

  /**
   * 记录创建操作
   */
  async logCreate(
    userId: string,
    resourceType: string,
    resourceId: string,
    options?: {
      ipAddress?: string;
      userAgent?: string;
      details?: Record<string, unknown>;
    }
  ): Promise<AuditLogEntry> {
    return this.log({
      userId,
      action: AuditAction.CREATE,
      resourceType,
      resourceId,
      result: 'success',
      ...options,
    });
  }

  /**
   * 记录更新操作
   */
  async logUpdate(
    userId: string,
    resourceType: string,
    resourceId: string,
    options?: {
      ipAddress?: string;
      userAgent?: string;
      details?: Record<string, unknown>;
    }
  ): Promise<AuditLogEntry> {
    return this.log({
      userId,
      action: AuditAction.UPDATE,
      resourceType,
      resourceId,
      result: 'success',
      ...options,
    });
  }

  /**
   * 记录删除操作
   */
  async logDelete(
    userId: string,
    resourceType: string,
    resourceId: string,
    options?: {
      ipAddress?: string;
      userAgent?: string;
      details?: Record<string, unknown>;
    }
  ): Promise<AuditLogEntry> {
    return this.log({
      userId,
      action: AuditAction.DELETE,
      resourceType,
      resourceId,
      result: 'success',
      ...options,
    });
  }

  /**
   * 记录导出操作
   */
  async logExport(
    userId: string,
    resourceType: string,
    resourceId: string,
    options?: {
      ipAddress?: string;
      userAgent?: string;
      details?: Record<string, unknown>;
    }
  ): Promise<AuditLogEntry> {
    return this.log({
      userId,
      action: AuditAction.EXPORT,
      resourceType,
      resourceId,
      result: 'success',
      ...options,
    });
  }

  /**
   * 记录访问操作
   */
  async logAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    options?: {
      ipAddress?: string;
      userAgent?: string;
      details?: Record<string, unknown>;
    }
  ): Promise<AuditLogEntry> {
    return this.log({
      userId,
      action: AuditAction.ACCESS,
      resourceType,
      resourceId,
      result: 'success',
      ...options,
    });
  }

  /**
   * 记录失败的操作
   */
  async logFailure(
    userId: string,
    action: AuditAction,
    resourceType: string,
    resourceId: string,
    error: string,
    options?: {
      ipAddress?: string;
      userAgent?: string;
      details?: Record<string, unknown>;
    }
  ): Promise<AuditLogEntry> {
    return this.log({
      userId,
      action,
      resourceType,
      resourceId,
      result: 'failure',
      error,
      ...options,
    });
  }

  /**
   * 查询日志
   */
  async query(options: AuditLogQueryOptions): Promise<AuditLogEntry[]> {
    return this.storage.query(options);
  }

  /**
   * 获取日志总数
   */
  async count(options: AuditLogQueryOptions = {}): Promise<number> {
    return this.storage.count(options);
  }

  /**
   * 删除日志
   */
  async delete(id: string): Promise<void> {
    await this.storage.delete(id);
  }

  /**
   * 批量删除日志
   */
  async deleteMany(ids: string[]): Promise<void> {
    await this.storage.deleteMany(ids);
  }

  /**
   * 更新存储适配器
   */
  setStorage(storage: AuditLogStorageAdapter): void {
    this.storage = storage;
  }
}

/**
 * 创建审计日志记录器
 */
export function createAuditLogger(
  storage?: AuditLogStorageAdapter
): AuditLogger {
  return new AuditLogger(storage);
}
