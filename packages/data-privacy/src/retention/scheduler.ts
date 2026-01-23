/**
 * 数据保留策略调度器：管理多个保留策略的执行
 */

import {
  findExpiredItems,
  findItemsToDelete,
  findExpiringItems,
} from './policy';
import type {
  RetentionPolicy,
  DataItemMetadata,
  RetentionSchedulerOptions,
} from '../types';

/**
 * 数据项访问器接口（用于从存储中获取和删除数据）
 */
export interface DataItemAccessor {
  /**
   * 获取所有数据项元数据
   */
  getAllMetadata(): Promise<DataItemMetadata[]>;
  /**
   * 删除数据项
   */
  deleteItem(id: string): Promise<void>;
  /**
   * 批量删除数据项
   */
  deleteItems(ids: string[]): Promise<void>;
}

/**
 * 保留策略调度器
 */
export class RetentionScheduler {
  private policies: RetentionPolicy[] = [];
  private accessor: DataItemAccessor;
  private options: Required<RetentionSchedulerOptions>;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    accessor: DataItemAccessor,
    options: RetentionSchedulerOptions = {}
  ) {
    this.accessor = accessor;
    this.options = {
      checkInterval: options.checkInterval || 24 * 60 * 60 * 1000, // 默认24小时
      batchSize: options.batchSize || 100,
      enabled: options.enabled !== false,
    };
  }

  /**
   * 添加保留策略
   */
  addPolicy(policy: RetentionPolicy): void {
    this.policies.push(policy);
  }

  /**
   * 移除保留策略
   */
  removePolicy(policyId: string): void {
    this.policies = this.policies.filter(p => p.id !== policyId);
  }

  /**
   * 获取所有策略
   */
  getPolicies(): RetentionPolicy[] {
    return [...this.policies];
  }

  /**
   * 执行一次检查（查找过期和即将过期的数据）
   */
  async check(): Promise<{
    expired: DataItemMetadata[];
    toDelete: DataItemMetadata[];
    expiring: DataItemMetadata[];
  }> {
    const allItems = await this.accessor.getAllMetadata();
    const expired: DataItemMetadata[] = [];
    const toDelete: DataItemMetadata[] = [];
    const expiring: DataItemMetadata[] = [];

    for (const policy of this.policies) {
      const policyExpired = findExpiredItems(allItems, policy);
      const policyToDelete = findItemsToDelete(allItems, policy);
      const policyExpiring = findExpiringItems(allItems, policy);

      expired.push(...policyExpired);
      toDelete.push(...policyToDelete);
      expiring.push(...policyExpiring);
    }

    // 去重
    const uniqueExpired = Array.from(
      new Map(expired.map(item => [item.id, item])).values()
    );
    const uniqueToDelete = Array.from(
      new Map(toDelete.map(item => [item.id, item])).values()
    );
    const uniqueExpiring = Array.from(
      new Map(expiring.map(item => [item.id, item])).values()
    );

    return {
      expired: uniqueExpired,
      toDelete: uniqueToDelete,
      expiring: uniqueExpiring,
    };
  }

  /**
   * 执行删除操作
   */
  async executeDeletion(): Promise<number> {
    const { toDelete } = await this.check();
    
    if (toDelete.length === 0) {
      return 0;
    }

    // 批量删除
    const ids = toDelete.map(item => item.id);
    const batchSize = this.options.batchSize;
    let deletedCount = 0;

    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      await this.accessor.deleteItems(batch);
      deletedCount += batch.length;
    }

    return deletedCount;
  }

  /**
   * 启动自动调度
   */
  start(): void {
    if (this.isRunning || !this.options.enabled) {
      return;
    }

    this.isRunning = true;
    
    // 立即执行一次
    this.executeDeletion().catch(error => {
      console.error('Retention scheduler execution error:', error);
    });

    // 设置定时执行
    this.intervalId = setInterval(() => {
      this.executeDeletion().catch(error => {
        console.error('Retention scheduler execution error:', error);
      });
    }, this.options.checkInterval);
  }

  /**
   * 停止自动调度
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  /**
   * 是否正在运行
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * 更新选项
   */
  updateOptions(options: Partial<RetentionSchedulerOptions>): void {
    const wasRunning = this.isRunning;
    
    if (wasRunning) {
      this.stop();
    }

    this.options = {
      ...this.options,
      ...options,
    };

    if (wasRunning && this.options.enabled) {
      this.start();
    }
  }
}

/**
 * 创建保留策略调度器
 */
export function createRetentionScheduler(
  accessor: DataItemAccessor,
  options?: RetentionSchedulerOptions
): RetentionScheduler {
  return new RetentionScheduler(accessor, options);
}
