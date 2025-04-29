import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { decrypt, encrypt } from '../utils/crypto';
import { User } from 'shared';

export const TOKEN_KEY = 't';
export const CHECKOUT_INFO_KEY = 'c';

interface UserState {
  [TOKEN_KEY]: string | null;
  [CHECKOUT_INFO_KEY]: any;
  cachedUser: User | null;
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
  devtools(
    persist(
      (set, get) => ({
        // ---------USER_INFO---------
        [TOKEN_KEY]: null,
        [CHECKOUT_INFO_KEY]: null,
        cachedUser: null,

        saveToken: (user: User): string => {
          try {
            const token = encrypt(JSON.stringify(user));
            localStorage.setItem(TOKEN_KEY, token);
            set({ [TOKEN_KEY]: token, cachedUser: user });
            return token;
          } catch (error) {
            console.error('保存用户信息失败:', error);
            return '';
          }
        },

        getToken: (): string | null => {
          try {
            const token = get()[TOKEN_KEY] as string | null;
            return token ? token : null;
          } catch (error) {
            console.error('获取用户信息失败:', error);
            return null;
          }
        },

        getUser: (): User | null => {
          try {
            // 优先返回缓存的用户信息
            const cachedUser = get().cachedUser;
            if (cachedUser) {
              return cachedUser;
            }

            const token = get()[TOKEN_KEY];
            if (!token) {
              return null;
            }

            // 解密并缓存用户信息
            const user = JSON.parse(decrypt(token));
            set({ cachedUser: user });
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
            set({ [TOKEN_KEY]: null, cachedUser: null });
          } catch (error) {
            console.error('退出登录失败:', error);
          }
        },

        // ---------CHECKOUT_INFO---------
        saveCheckoutInfo: (data: any) => {
          try {
            const encryptedData = encrypt(JSON.stringify(data));
            localStorage.setItem(CHECKOUT_INFO_KEY, encryptedData);
          } catch (error) {
            console.error('保存结算信息失败:', error);
          }
        },

        getCheckoutInfo: () => {
          try {
            const encryptedData = localStorage.getItem(CHECKOUT_INFO_KEY);
            if (!encryptedData) return null;
            return JSON.parse(decrypt(encryptedData));
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
  )
);
