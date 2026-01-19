/**
 * 同意存储：内存存储适配器（默认实现）
 */

import type {
  ConsentRecord,
  ConsentPurpose,
  ConsentStorageAdapter,
} from '../types';

/**
 * 内存存储适配器（用于测试和简单场景）
 */
export class MemoryConsentStorage implements ConsentStorageAdapter {
  private storage: Map<string, ConsentRecord> = new Map();

  /**
   * 生成存储键
   */
  private getKey(userId: string, purpose: ConsentPurpose): string {
    return `${userId}:${purpose}`;
  }

  /**
   * 保存同意记录
   */
  async save(record: ConsentRecord): Promise<void> {
    const key = this.getKey(record.userId, record.purpose);
    this.storage.set(key, { ...record });
  }

  /**
   * 获取同意记录
   */
  async get(
    userId: string,
    purpose: ConsentPurpose
  ): Promise<ConsentRecord | null> {
    const key = this.getKey(userId, purpose);
    const record = this.storage.get(key);
    return record ? { ...record } : null;
  }

  /**
   * 获取用户的所有同意记录
   */
  async getAll(userId: string): Promise<ConsentRecord[]> {
    const records: ConsentRecord[] = [];
    for (const [key, record] of this.storage.entries()) {
      if (key.startsWith(`${userId}:`)) {
        records.push({ ...record });
      }
    }
    return records;
  }

  /**
   * 删除同意记录
   */
  async delete(userId: string, purpose: ConsentPurpose): Promise<void> {
    const key = this.getKey(userId, purpose);
    this.storage.delete(key);
  }

  /**
   * 清空所有记录（用于测试）
   */
  clear(): void {
    this.storage.clear();
  }
}

/**
 * 创建内存存储适配器
 */
export function createMemoryConsentStorage(): MemoryConsentStorage {
  return new MemoryConsentStorage();
}
