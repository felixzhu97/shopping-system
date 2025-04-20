declare module 'bcryptjs' {
  /**
   * 生成盐值
   * @param rounds 加密轮数，默认为10
   * @param callback 回调函数
   */
  export function genSalt(
    rounds?: number,
    callback?: (err: Error, salt: string) => void
  ): Promise<string>;

  /**
   * 对密码进行加密
   * @param data 要加密的明文密码
   * @param saltOrRounds 盐值或加密轮数
   * @param callback 回调函数
   */
  export function hash(
    data: string,
    saltOrRounds: string | number,
    callback?: (err: Error, encrypted: string) => void
  ): Promise<string>;

  /**
   * 比较密码是否匹配
   * @param data 明文密码
   * @param encrypted 加密后的密码
   * @param callback 回调函数
   */
  export function compare(
    data: string,
    encrypted: string,
    callback?: (err: Error, same: boolean) => void
  ): Promise<boolean>;
}
