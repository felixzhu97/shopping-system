import { User } from 'shared';
import { encrypt, decrypt } from './crypto';

const TOKEN_KEY = 't';
const CHECKOUT_INFO_KEY = 'c';

// ---------USER_INFO---------
export const saveToken = (user: User): string => {
  try {
    const token = encrypt(JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
    return token;
  } catch (error) {
    console.error('保存用户信息失败:', error);
    return '';
  }
};

export const getToken = (): string | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? token : null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
};

export const getUser = (): User | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }

    // 解密并缓存用户信息
    const user = JSON.parse(decrypt(token));
    return user;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
};

export const getUserId = (): string => {
  try {
    const user = getUser();
    return user?.id || '';
  } catch (error) {
    console.error('获取用户ID失败:', error);
    return '';
  }
};

export const logout = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('退出登录失败:', error);
  }
};

// ---------CHECKOUT_INFO---------
export const saveCheckoutInfo = (data: any) => {
  try {
    localStorage.setItem(CHECKOUT_INFO_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('保存结算信息失败:', error);
  }
};

export const getCheckoutInfo = () => {
  try {
    const checkoutInfo = localStorage.getItem(CHECKOUT_INFO_KEY);
    if (!checkoutInfo) return null;
    return JSON.parse(checkoutInfo);
  } catch (error) {
    console.error('获取结算信息失败:', error);
    return null;
  }
};
export const clearCheckoutInfo = () => {
  try {
    localStorage.removeItem(CHECKOUT_INFO_KEY);
  } catch (error) {
    console.error('清除结算信息失败:', error);
  }
};
