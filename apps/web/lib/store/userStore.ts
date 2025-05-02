import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'shared';
import { encrypt, decrypt } from '../utils/crypto';

export const TOKEN_KEY = 't';
export const USER_INFO_KEY = 'u';

interface UserSlice {
  [TOKEN_KEY]: string | null;
  saveToken: (user: User) => string;
  logout: () => void;
  getToken: () => string | null;
  getUser: () => User | null;
  getUserId: () => string;
}

export const useUserStore = create<UserSlice>()(
  persist(
    (set, get) => ({
      [TOKEN_KEY]: null,
      saveToken: (user: User): string => {
        try {
          const token = encrypt(JSON.stringify(user));
          set({ [TOKEN_KEY]: token });
          return token;
        } catch (error) {
          console.error('保存用户信息失败:', error);
          return '';
        }
      },

      logout: () => {
        try {
          set({ [TOKEN_KEY]: null });
        } catch (error) {
          console.error('退出登录失败:', error);
        }
      },

      getToken: (): string | null => {
        try {
          const token = get()[TOKEN_KEY];
          return token ? token : null;
        } catch (error) {
          console.error('获取用户信息失败:', error);
          return null;
        }
      },

      getUser: (): User | null => {
        try {
          const token = get()[TOKEN_KEY];
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
    }),
    {
      name: USER_INFO_KEY,
      partialize: state => ({
        [TOKEN_KEY]: state[TOKEN_KEY],
      }),
    }
  )
);

export const useUser = () => useUserStore(state => state.getUser());
export const useToken = () => useUserStore(state => state.getToken());
export const useUserId = () => useUserStore(state => state.getUserId());

export const useSaveToken = () => useUserStore(state => state.saveToken);
export const useLogout = () => useUserStore(state => state.logout);
