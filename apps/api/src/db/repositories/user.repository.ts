import User, { UserDocument, UserType } from '../../models/User';
import { Repository } from '../repository';

/**
 * 用户数据仓库类
 * 提供用户模型的数据访问方法
 */
export class UserRepository extends Repository<UserDocument, UserType> {
  constructor() {
    super(User);
  }

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户文档或null
   */
  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.findOne({ username });
  }

  /**
   * 根据电子邮件查找用户
   * @param email 电子邮件
   * @returns 用户文档或null
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.findOne({ email });
  }

  /**
   * 查找所有管理员用户
   * @returns 管理员用户列表
   */
  async findAdmins(): Promise<UserDocument[]> {
    return this.findAll({ role: 'admin' });
  }

  /**
   * 查找所有普通用户
   * @returns 普通用户列表
   */
  async findRegularUsers(): Promise<UserDocument[]> {
    return this.findAll({ role: 'user' });
  }
}

// 导出单例实例
export const userRepository = new UserRepository();
