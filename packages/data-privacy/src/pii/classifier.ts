/**
 * PII 分类器：将检测到的 PII 按敏感级别分类
 */

import type { DetectedPII } from '../types';
import { PIISensitivity, PIIType } from '../types';

/**
 * PII 类型到敏感级别的映射
 */
const PII_SENSITIVITY_MAP: Record<PIIType, PIISensitivity> = {
  [PIIType.PHONE]: PIISensitivity.DIRECT_IDENTIFIER,
  [PIIType.EMAIL]: PIISensitivity.DIRECT_IDENTIFIER,
  [PIIType.ID_CARD]: PIISensitivity.DIRECT_IDENTIFIER,
  [PIIType.BANK_CARD]: PIISensitivity.SENSITIVE,
  [PIIType.NAME]: PIISensitivity.QUASI_IDENTIFIER,
  [PIIType.IP_ADDRESS]: PIISensitivity.QUASI_IDENTIFIER,
  [PIIType.ADDRESS]: PIISensitivity.QUASI_IDENTIFIER,
  [PIIType.DATE_OF_BIRTH]: PIISensitivity.QUASI_IDENTIFIER,
  [PIIType.PASSPORT]: PIISensitivity.DIRECT_IDENTIFIER,
  [PIIType.DRIVER_LICENSE]: PIISensitivity.DIRECT_IDENTIFIER,
  [PIIType.SSN]: PIISensitivity.DIRECT_IDENTIFIER,
};

/**
 * 分类 PII：为检测到的 PII 分配敏感级别
 * @param pii 检测到的 PII
 * @returns 带有敏感级别的 PII
 */
export function classifyPII(pii: Omit<DetectedPII, 'sensitivity'>): DetectedPII {
  const sensitivity = PII_SENSITIVITY_MAP[pii.type] || PIISensitivity.QUASI_IDENTIFIER;
  
  return {
    ...pii,
    sensitivity,
  };
}

/**
 * 批量分类 PII
 * @param piiList PII 列表
 * @returns 分类后的 PII 列表
 */
export function classifyPIIList(
  piiList: Omit<DetectedPII, 'sensitivity'>[]
): DetectedPII[] {
  return piiList.map(classifyPII);
}

/**
 * 按敏感级别分组 PII
 * @param piiList PII 列表
 * @returns 按敏感级别分组的 PII 映射
 */
export function groupPIIBySensitivity(
  piiList: DetectedPII[]
): Record<PIISensitivity, DetectedPII[]> {
  const grouped: Record<PIISensitivity, DetectedPII[]> = {
    [PIISensitivity.DIRECT_IDENTIFIER]: [],
    [PIISensitivity.QUASI_IDENTIFIER]: [],
    [PIISensitivity.SENSITIVE]: [],
  };

  for (const pii of piiList) {
    grouped[pii.sensitivity].push(pii);
  }

  return grouped;
}

/**
 * 按类型分组 PII
 * @param piiList PII 列表
 * @returns 按类型分组的 PII 映射
 */
export function groupPIIByType(
  piiList: DetectedPII[]
): Record<PIIType, DetectedPII[]> {
  const grouped: Partial<Record<PIIType, DetectedPII[]>> = {};

  for (const pii of piiList) {
    if (!grouped[pii.type]) {
      grouped[pii.type] = [];
    }
    grouped[pii.type]!.push(pii);
  }

  return grouped as Record<PIIType, DetectedPII[]>;
}
