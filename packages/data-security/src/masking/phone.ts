/**
 * 手机号脱敏
 * @param phone 手机号
 * @param maskChar 脱敏字符，默认 '*'
 * @returns 脱敏后的手机号，例如 '138****5678'
 */
export function maskPhone(phone: string, maskChar: string = '*'): string {
  if (!phone) {
    return phone;
  }

  // 移除所有非数字字符
  const digits = phone.replace(/\D/g, '');

  if (digits.length < 7) {
    // 如果手机号太短，只保留前后各1位
    if (digits.length <= 2) {
      return phone;
    }
    return digits[0] + maskChar.repeat(digits.length - 2) + digits[digits.length - 1];
  }

  // 中国手机号标准格式：保留前3位和后4位
  if (digits.length === 11) {
    return digits.slice(0, 3) + maskChar.repeat(4) + digits.slice(-4);
  }

  // 其他长度的手机号：保留前3位和后4位
  if (digits.length > 7) {
    return digits.slice(0, 3) + maskChar.repeat(digits.length - 7) + digits.slice(-4);
  }

  // 长度在7-10位之间：保留前3位和后3位
  return digits.slice(0, 3) + maskChar.repeat(digits.length - 6) + digits.slice(-3);
}
