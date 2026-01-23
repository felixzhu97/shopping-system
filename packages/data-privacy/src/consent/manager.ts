/**
 * 同意管理：管理用户同意记录
 */

import { createMemoryConsentStorage, type MemoryConsentStorage } from './storage';
import type {
  ConsentRecord,
  ConsentPurpose,
  ConsentStorageAdapter,
} from '../types';
import { ConsentStatus } from '../types';

/**
 * 同意管理器
 */
export class ConsentManager {
  private storage: ConsentStorageAdapter;

  constructor(storage?: ConsentStorageAdapter) {
    this.storage = storage || createMemoryConsentStorage();
  }

  /**
   * 授予同意
   * @param userId 用户 ID
   * @param purpose 同意目的
   * @param metadata 额外元数据
   * @returns 同意记录
   */
  async grantConsent(
    userId: string,
    purpose: ConsentPurpose,
    metadata?: Record<string, unknown>
  ): Promise<ConsentRecord> {
    const record: ConsentRecord = {
      userId,
      purpose,
      status: ConsentStatus.GRANTED,
      timestamp: Date.now(),
      version: '1.0',
      metadata,
    };

    await this.storage.save(record);
    return record;
  }

  /**
   * 拒绝同意
   * @param userId 用户 ID
   * @param purpose 同意目的
   * @param metadata 额外元数据
   * @returns 同意记录
   */
  async denyConsent(
    userId: string,
    purpose: ConsentPurpose,
    metadata?: Record<string, unknown>
  ): Promise<ConsentRecord> {
    const record: ConsentRecord = {
      userId,
      purpose,
      status: ConsentStatus.DENIED,
      timestamp: Date.now(),
      version: '1.0',
      metadata,
    };

    await this.storage.save(record);
    return record;
  }

  /**
   * 撤回同意
   * @param userId 用户 ID
   * @param purpose 同意目的
   * @returns 同意记录
   */
  async withdrawConsent(
    userId: string,
    purpose: ConsentPurpose
  ): Promise<ConsentRecord | null> {
    const existing = await this.storage.get(userId, purpose);
    
    if (!existing) {
      return null;
    }

    const record: ConsentRecord = {
      ...existing,
      status: ConsentStatus.WITHDRAWN,
      withdrawnAt: Date.now(),
    };

    await this.storage.save(record);
    return record;
  }

  /**
   * 检查是否已同意
   * @param userId 用户 ID
   * @param purpose 同意目的
   * @returns 是否已同意
   */
  async hasConsent(
    userId: string,
    purpose: ConsentPurpose
  ): Promise<boolean> {
    const record = await this.storage.get(userId, purpose);
    return record?.status === ConsentStatus.GRANTED;
  }

  /**
   * 获取同意状态
   * @param userId 用户 ID
   * @param purpose 同意目的
   * @returns 同意状态
   */
  async getConsentStatus(
    userId: string,
    purpose: ConsentPurpose
  ): Promise<ConsentStatus> {
    const record = await this.storage.get(userId, purpose);
    return record?.status || ConsentStatus.NOT_SET;
  }

  /**
   * 获取同意记录
   * @param userId 用户 ID
   * @param purpose 同意目的
   * @returns 同意记录
   */
  async getConsent(
    userId: string,
    purpose: ConsentPurpose
  ): Promise<ConsentRecord | null> {
    return this.storage.get(userId, purpose);
  }

  /**
   * 获取用户的所有同意记录
   * @param userId 用户 ID
   * @returns 同意记录列表
   */
  async getAllConsents(userId: string): Promise<ConsentRecord[]> {
    return this.storage.getAll(userId);
  }

  /**
   * 批量检查同意状态
   * @param userId 用户 ID
   * @param purposes 同意目的列表
   * @returns 同意状态映射
   */
  async checkMultipleConsents(
    userId: string,
    purposes: ConsentPurpose[]
  ): Promise<Record<ConsentPurpose, ConsentStatus>> {
    const result: Partial<Record<ConsentPurpose, ConsentStatus>> = {};

    for (const purpose of purposes) {
      result[purpose] = await this.getConsentStatus(userId, purpose);
    }

    return result as Record<ConsentPurpose, ConsentStatus>;
  }

  /**
   * 删除同意记录
   * @param userId 用户 ID
   * @param purpose 同意目的
   */
  async deleteConsent(
    userId: string,
    purpose: ConsentPurpose
  ): Promise<void> {
    await this.storage.delete(userId, purpose);
  }

  /**
   * 更新存储适配器
   * @param storage 新的存储适配器
   */
  setStorage(storage: ConsentStorageAdapter): void {
    this.storage = storage;
  }
}

/**
 * 创建同意管理器
 * @param storage 存储适配器（可选）
 * @returns 同意管理器实例
 */
export function createConsentManager(
  storage?: ConsentStorageAdapter
): ConsentManager {
  return new ConsentManager(storage);
}
