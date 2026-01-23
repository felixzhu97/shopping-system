/**
 * 邮箱脱敏
 * @param email 邮箱地址
 * @param maskChar 脱敏字符，默认 '*'
 * @returns 脱敏后的邮箱，例如 'abc***@example.com'
 */
export function maskEmail(email: string, maskChar: string = '*'): string {
  if (!email) {
    return email;
  }

  const parts = email.split('@');

  if (parts.length !== 2) {
    // 如果不是有效的邮箱格式，返回原值
    return email;
  }

  const [localPart, domain] = parts;

  if (!localPart || !domain) {
    return email;
  }

  // 如果本地部分长度小于等于2，全部脱敏
  if (localPart.length <= 2) {
    return maskChar.repeat(localPart.length) + '@' + domain;
  }

  // 如果本地部分长度在3-4之间，保留第一个字符，其余脱敏
  if (localPart.length <= 4) {
    return localPart[0] + maskChar.repeat(localPart.length - 1) + '@' + domain;
  }

  // 标准格式：保留前3个字符和后1个字符（如果存在），其余脱敏
  const visibleLength = Math.min(3, Math.floor(localPart.length / 2));
  const prefix = localPart.slice(0, visibleLength);
  const suffix = localPart.length > visibleLength ? localPart.slice(-1) : '';
  const maskedLength = localPart.length - visibleLength - (suffix ? 1 : 0);

  return prefix + maskChar.repeat(Math.max(3, maskedLength)) + suffix + '@' + domain;
}
