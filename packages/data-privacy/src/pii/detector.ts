/**
 * PII 检测器：检测文本中的个人身份信息
 */

import { classifyPII, classifyPIIList } from './classifier';
import { getAllPatterns, getPatternsByType, type PIIPattern } from './patterns';
import type { DetectedPII, PIIDetectionOptions } from '../types';
import { PIIType } from '../types';

/**
 * 检测文本中的 PII
 * @param text 要检测的文本
 * @param options 检测选项
 * @returns 检测到的 PII 列表
 */
export function detectPII(
  text: string,
  options: PIIDetectionOptions = {}
): DetectedPII[] {
  const {
    types,
    minConfidence = 0.5,
    detailed = false,
  } = options;

  // 获取要使用的模式
  const patterns = types
    ? types.flatMap(type => getPatternsByType(type))
    : getAllPatterns();

  const detected: Omit<DetectedPII, 'sensitivity'>[] = [];
  const seen = new Set<string>(); // 用于去重

  // 对每个模式进行匹配
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern.pattern);
    
    for (const match of matches) {
      if (!match[0] || match.index === undefined) continue;

      const value = match[0];
      const key = `${pattern.type}:${value}:${match.index}`;
      
      // 去重
      if (seen.has(key)) continue;
      seen.add(key);

      // 验证（如果提供了验证函数）
      let confidence = pattern.confidence;
      if (pattern.validator) {
        const isValid = pattern.validator(value);
        if (!isValid) {
          // 验证失败，降低置信度
          confidence *= 0.5;
        }
      }

      // 过滤低置信度结果
      if (confidence < minConfidence) continue;

      detected.push({
        type: pattern.type,
        value,
        startIndex: match.index,
        endIndex: match.index + value.length,
        confidence: detailed ? confidence : undefined,
      });
    }
  }

  // 分类并返回
  return classifyPIIList(detected);
}

/**
 * 检测对象中的 PII
 * @param obj 要检测的对象
 * @param options 检测选项
 * @returns 检测到的 PII 列表（包含字段路径）
 */
export function detectPIIInObject(
  obj: Record<string, unknown>,
  options: PIIDetectionOptions = {}
): Array<DetectedPII & { fieldPath: string }> {
  const detected: Array<DetectedPII & { fieldPath: string }> = [];

  function traverse(
    current: unknown,
    path: string,
    visited: Set<unknown>
  ): void {
    // 防止循环引用
    if (visited.has(current)) return;
    visited.add(current);

    if (typeof current === 'string') {
      const piiList = detectPII(current, options);
      for (const pii of piiList) {
        detected.push({
          ...pii,
          fieldPath: path,
        });
      }
    } else if (Array.isArray(current)) {
      for (let i = 0; i < current.length; i++) {
        traverse(current[i], `${path}[${i}]`, visited);
      }
    } else if (current !== null && typeof current === 'object') {
      for (const [key, value] of Object.entries(current)) {
        const newPath = path ? `${path}.${key}` : key;
        traverse(value, newPath, visited);
      }
    }
  }

  traverse(obj, '', new Set());
  return detected;
}

/**
 * 检查文本是否包含 PII
 * @param text 要检查的文本
 * @param options 检测选项
 * @returns 是否包含 PII
 */
export function hasPII(
  text: string,
  options: PIIDetectionOptions = {}
): boolean {
  const detected = detectPII(text, { ...options, detailed: false });
  return detected.length > 0;
}

/**
 * 统计文本中的 PII 数量
 * @param text 要统计的文本
 * @param options 检测选项
 * @returns PII 统计信息
 */
export function countPII(
  text: string,
  options: PIIDetectionOptions = {}
): Record<PIIType, number> {
  const detected = detectPII(text, options);
  const counts: Partial<Record<PIIType, number>> = {};

  for (const pii of detected) {
    counts[pii.type] = (counts[pii.type] || 0) + 1;
  }

  return counts as Record<PIIType, number>;
}
