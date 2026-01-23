/**
 * 身份证脱敏
 * @param idCard 身份证号
 * @param maskChar 脱敏字符，默认 '*'
 * @returns 脱敏后的身份证号，例如 '110***********1234'
 */
export function maskIdCard(idCard: string, maskChar: string = '*'): string {
  if (!idCard) {
    return idCard;
  }

  // 移除所有非数字和X字符
  const cleaned = idCard.replace(/[^0-9Xx]/g, '');

  if (cleaned.length === 0) {
    return idCard;
  }

  // 中国身份证：18位（保留前3位和后4位）或15位（保留前3位和后3位）
  if (cleaned.length === 18) {
    return cleaned.slice(0, 3) + maskChar.repeat(11) + cleaned.slice(-4);
  }

  if (cleaned.length === 15) {
    return cleaned.slice(0, 3) + maskChar.repeat(9) + cleaned.slice(-3);
  }

  // 其他长度：保留前3位和后3位（如果长度足够）
  if (cleaned.length <= 6) {
    // 如果太短，只脱敏中间部分
    if (cleaned.length <= 2) {
      return idCard;
    }
    return cleaned[0] + maskChar.repeat(cleaned.length - 2) + cleaned[cleaned.length - 1];
  }

  const prefixLength = 3;
  const suffixLength = Math.min(3, Math.floor(cleaned.length / 4));
  const maskedLength = cleaned.length - prefixLength - suffixLength;

  return (
    cleaned.slice(0, prefixLength) +
    maskChar.repeat(maskedLength) +
    cleaned.slice(-suffixLength)
  );
}
