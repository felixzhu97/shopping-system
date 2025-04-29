import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { decrypt, encrypt } from '../utils/crypto';
import { User } from 'shared';

export const TOKEN_KEY = 't';
export const CHECKOUT_INFO_KEY = 'c';

interface UserState {
  [TOKEN_KEY]: string | null;
  [CHECKOUT_INFO_KEY]: any;
  saveToken: (user: User) => string;
  getToken: () => string | null;
  getUser: () => User | null;
  getUserId: () => string;
  logout: () => void;
  saveCheckoutInfo: (data: any) => void;
  getCheckoutInfo: () => any | null;
  clearCheckoutInfo: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // ---------USER_INFO---------
      [TOKEN_KEY]: null,
      [CHECKOUT_INFO_KEY]: null,

      saveToken: (user: User): string => {
        try {
          const token = encrypt(JSON.stringify(user));
          localStorage.setItem(TOKEN_KEY, token);
          return token;
        } catch (error) {
          console.error('保存用户信息失败:', error);
          return '';
        }
      },

      getToken: (): string | null => {
        try {
          const token = localStorage.getItem(TOKEN_KEY);
          return token ? token : null;
        } catch (error) {
          console.error('获取用户信息失败:', error);
          return null;
        }
      },

      getUser: (): User | null => {
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
      },

      getUserId: (): string => {
        try {
          const user = get().getUser();
          return user?.id || '';
        } catch (error) {
          console.error('获取用户ID失败:', error);
          return '';
        }
      },

      logout: () => {
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch (error) {
          console.error('退出登录失败:', error);
        }
      },

      // ---------CHECKOUT_INFO---------
      saveCheckoutInfo: (data: any) => {
        try {
          localStorage.setItem(CHECKOUT_INFO_KEY, JSON.stringify(data));
        } catch (error) {
          console.error('保存结算信息失败:', error);
        }
      },

      getCheckoutInfo: () => {
        try {
          const checkoutInfo = localStorage.getItem(CHECKOUT_INFO_KEY);
          if (!checkoutInfo) return null;
          return JSON.parse(checkoutInfo);
        } catch (error) {
          console.error('获取结算信息失败:', error);
          return null;
        }
      },
      clearCheckoutInfo: () => {
        try {
          localStorage.removeItem(CHECKOUT_INFO_KEY);
        } catch (error) {
          console.error('清除结算信息失败:', error);
        }
      },
    }),
    {
      name: 'u',
      partialize: state => ({
        [TOKEN_KEY]: state[TOKEN_KEY],
      }),
    }
  )
);
