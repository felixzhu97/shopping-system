/**
 * 姓名脱敏
 * @param name 姓名
 * @param maskChar 脱敏字符，默认 '*'
 * @returns 脱敏后的姓名，例如 '张*' 或 '李**'
 */
export function maskName(name: string, maskChar: string = '*'): string {
  if (!name) {
    return name;
  }

  // 移除空格
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return name;
  }

  // 单个字符：返回原值或脱敏
  if (trimmed.length === 1) {
    return maskChar;
  }

  // 两个字符：保留第一个，第二个脱敏，例如 '张*'
  if (trimmed.length === 2) {
    return trimmed[0] + maskChar;
  }

  // 三个字符：保留第一个，其余脱敏，例如 '张**'
  if (trimmed.length === 3) {
    return trimmed[0] + maskChar.repeat(2);
  }

  // 四个及以上字符：保留第一个和最后一个，中间脱敏
  // 例如 '张三丰' -> '张*丰'，'张三四五' -> '张**五'
  if (trimmed.length >= 4) {
    return trimmed[0] + maskChar.repeat(trimmed.length - 2) + trimmed[trimmed.length - 1];
  }

  return name;
}
