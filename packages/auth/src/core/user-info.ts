import type { OAuthUser } from '../types';
import type { User } from 'types';

/**
 * 用户信息转换工具
 * 将 OAuth 用户信息转换为系统用户格式
 */
export class UserInfoMapper {
  /**
   * 将 OAuth 用户信息映射为系统用户格式
   */
  static toSystemUser(oauthUser: OAuthUser): Partial<User> {
    return {
      email: oauthUser.email || '',
      firstName: oauthUser.firstName || oauthUser.name?.split(' ')[0] || '',
      lastName: oauthUser.lastName || oauthUser.name?.split(' ').slice(1).join(' ') || '',
      phone: oauthUser.phone || '',
    };
  }

  /**
   * 合并 OAuth 用户信息和现有用户信息
   */
  static mergeUserInfo(
    oauthUser: OAuthUser,
    existingUser?: Partial<User>
  ): Partial<User> {
    return {
      ...existingUser,
      email: oauthUser.email || existingUser?.email || '',
      firstName:
        oauthUser.firstName ||
        existingUser?.firstName ||
        oauthUser.name?.split(' ')[0] ||
        '',
      lastName:
        oauthUser.lastName ||
        existingUser?.lastName ||
        oauthUser.name?.split(' ').slice(1).join(' ') ||
        '',
      phone: oauthUser.phone || existingUser?.phone || '',
    };
  }

  /**
   * 验证 OAuth 用户信息是否完整
   */
  static validateUserInfo(oauthUser: OAuthUser): {
    valid: boolean;
    missingFields: string[];
  } {
    const missingFields: string[] = [];

    if (!oauthUser.id) {
      missingFields.push('id');
    }

    // 至少需要邮箱或手机号
    if (!oauthUser.email && !oauthUser.phone) {
      missingFields.push('email or phone');
    }

    return {
      valid: missingFields.length === 0,
      missingFields,
    };
  }
}
