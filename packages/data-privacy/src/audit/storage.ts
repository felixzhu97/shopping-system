/**
 * 审计日志存储：内存存储适配器（默认实现）
 */

import type { AuditLogEntry, AuditLogQueryOptions, AuditLogStorageAdapter } from '../types';

/**
 * 内存存储适配器（用于测试和简单场景）
 */
export class MemoryAuditLogStorage implements AuditLogStorageAdapter {
  private storage: Map<string, AuditLogEntry> = new Map();
  private idCounter = 1;

  /**
   * 生成日志 ID
   */
  private generateId(): string {
    return `audit_${Date.now()}_${this.idCounter++}`;
  }

  /**
   * 保存日志条目
   */
  async save(entry: AuditLogEntry): Promise<void> {
    const id = entry.id || this.generateId();
    this.storage.set(id, { ...entry, id });
  }

  /**
   * 查询日志
   */
  async query(options: AuditLogQueryOptions = {}): Promise<AuditLogEntry[]> {
    let results: AuditLogEntry[] = Array.from(this.storage.values());

    // 过滤
    if (options.userId) {
      results = results.filter(entry => entry.userId === options.userId);
    }
    if (options.action) {
      results = results.filter(entry => entry.action === options.action);
    }
    if (options.resourceType) {
      results = results.filter(entry => entry.resourceType === options.resourceType);
    }
    if (options.resourceId) {
      results = results.filter(entry => entry.resourceId === options.resourceId);
    }
    if (options.startTime) {
      results = results.filter(entry => entry.timestamp >= options.startTime!);
    }
    if (options.endTime) {
      results = results.filter(entry => entry.timestamp <= options.endTime!);
    }

    // 排序
    const sortBy = options.sortBy || 'timestamp';
    const sortOrder = options.sortOrder || 'desc';

    results.sort((a, b) => {
      let aValue: unknown;
      let bValue: unknown;

      switch (sortBy) {
        case 'userId':
          aValue = a.userId;
          bValue = b.userId;
          break;
        case 'action':
          aValue = a.action;
          bValue = b.action;
          break;
        case 'timestamp':
        default:
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
      }

      if (aValue === bValue) return 0;
      // Type-safe comparison for sortable values
      const aComparable = typeof aValue === 'number' ? aValue : String(aValue);
      const bComparable = typeof bValue === 'number' ? bValue : String(bValue);
      const comparison = aComparable < bComparable ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // 分页
    if (options.page !== undefined && options.pageSize !== undefined) {
      const start = (options.page - 1) * options.pageSize;
      const end = start + options.pageSize;
      results = results.slice(start, end);
    }

    return results;
  }

  /**
   * 获取日志总数
   */
  async count(options: AuditLogQueryOptions = {}): Promise<number> {
    const results = await this.query({ ...options, page: undefined, pageSize: undefined });
    return results.length;
  }

  /**
   * 删除日志
   */
  async delete(id: string): Promise<void> {
    this.storage.delete(id);
  }

  /**
   * 批量删除日志
   */
  async deleteMany(ids: string[]): Promise<void> {
    for (const id of ids) {
      this.storage.delete(id);
    }
  }

  /**
   * 清空所有日志（用于测试）
   */
  clear(): void {
    this.storage.clear();
  }
}

/**
 * 创建内存存储适配器
 */
export function createMemoryAuditLogStorage(): MemoryAuditLogStorage {
  return new MemoryAuditLogStorage();
}
