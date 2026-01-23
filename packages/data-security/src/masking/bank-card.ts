/**
 * 银行卡脱敏
 * @param cardNumber 银行卡号
 * @param maskChar 脱敏字符，默认 '*'
 * @returns 脱敏后的银行卡号，例如 '6222 **** **** 7890'
 */
export function maskBankCard(cardNumber: string, maskChar: string = '*'): string {
  if (!cardNumber) {
    return cardNumber;
  }

  // 移除所有非数字字符
  const digits = cardNumber.replace(/\D/g, '');

  if (digits.length === 0) {
    return cardNumber;
  }

  // 如果长度太短，只脱敏中间部分
  if (digits.length <= 4) {
    if (digits.length <= 2) {
      return cardNumber;
    }
    return digits[0] + maskChar.repeat(digits.length - 2) + digits[digits.length - 1];
  }

  // 标准格式：保留前4位和后4位，中间用空格和星号分隔
  // 例如：6222 **** **** 7890
  const prefix = digits.slice(0, 4);
  const suffix = digits.slice(-4);
  const middleLength = digits.length - 8;

  if (middleLength <= 0) {
    // 如果总长度在4-8位之间，只保留前后各2位
    const prefix2 = digits.slice(0, 2);
    const suffix2 = digits.slice(-2);
    return `${prefix2} ${maskChar.repeat(Math.max(2, digits.length - 4))} ${suffix2}`;
  }

  // 计算中间需要显示的组数（每4位一组）
  const groups = Math.ceil(middleLength / 4);
  const maskedGroups = maskChar.repeat(4).repeat(groups).slice(0, middleLength);

  // 将中间部分分组显示
  const formattedMiddle = maskedGroups
    .match(/.{1,4}/g)
    ?.join(' ') || maskedGroups;

  return `${prefix} ${formattedMiddle} ${suffix}`.trim();
}
