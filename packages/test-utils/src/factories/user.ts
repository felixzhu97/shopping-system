import { User, UserRole, PaymentMethod } from 'types';

export interface UserFactoryOptions {
  id?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  paymentMethod?: PaymentMethod;
  token?: string;
}

let userCounter = 0;

function generateUserId() {
  return `user-${++userCounter}`;
}

function generateEmail(index?: number) {
  const idx = index ?? userCounter;
  return `user${idx}@example.com`;
}

function generatePhone(index?: number) {
  const idx = index ?? userCounter;
  return `138${String(idx).padStart(8, '0')}`;
}

/**
 * User 数据工厂
 */
export const createUser = {
  /**
   * 创建完整的用户对象
   */
  create: (overrides: UserFactoryOptions = {}): User => {
    const id = overrides.id || generateUserId();
    const email = overrides.email || generateEmail();

    return {
      id,
      email,
      password: overrides.password || 'password123',
      firstName: overrides.firstName || 'John',
      lastName: overrides.lastName || 'Doe',
      phone: overrides.phone || generatePhone(),
      role: overrides.role || 'user',
      address: overrides.address || '123 Main St',
      city: overrides.city || 'Beijing',
      province: overrides.province || 'Beijing',
      postalCode: overrides.postalCode || '100000',
      paymentMethod: overrides.paymentMethod || 'credit-card',
      ...(overrides.token && { token: overrides.token }),
    };
  },

  /**
   * 批量创建用户
   */
  createMany: (count: number, overrides: UserFactoryOptions = {}): User[] => {
    return Array.from({ length: count }, (_, index) => {
      const baseIndex = userCounter;
      userCounter++;
      return createUser.create({
        ...overrides,
        id: overrides.id || generateUserId(),
        email: overrides.email || generateEmail(baseIndex),
        phone: overrides.phone || generatePhone(baseIndex),
      });
    });
  },

  /**
   * 创建部分用户对象（用于更新操作）
   */
  createPartial: (overrides: Partial<UserFactoryOptions> = {}): Partial<User> => {
    return {
      ...(overrides.firstName && { firstName: overrides.firstName }),
      ...(overrides.lastName && { lastName: overrides.lastName }),
      ...(overrides.phone && { phone: overrides.phone }),
      ...(overrides.address && { address: overrides.address }),
      ...(overrides.city && { city: overrides.city }),
      ...(overrides.province && { province: overrides.province }),
      ...(overrides.postalCode && { postalCode: overrides.postalCode }),
      ...(overrides.paymentMethod && { paymentMethod: overrides.paymentMethod }),
    };
  },

  /**
   * 创建最小用户对象（仅必需字段）
   */
  createMinimal: (overrides: Partial<UserFactoryOptions> = {}): Pick<User, 'email' | 'password' | 'firstName' | 'lastName' | 'phone'> => {
    return {
      email: overrides.email || generateEmail(),
      password: overrides.password || 'password123',
      firstName: overrides.firstName || 'John',
      lastName: overrides.lastName || 'Doe',
      phone: overrides.phone || generatePhone(),
    };
  },

  /**
   * 创建管理员用户
   */
  createAdmin: (overrides: UserFactoryOptions = {}): User => {
    return createUser.create({
      ...overrides,
      role: 'admin',
    });
  },
};
