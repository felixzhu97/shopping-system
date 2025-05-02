import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'shared';
import { encrypt, decrypt } from '../utils/crypto';

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
          set({ [TOKEN_KEY]: token });
          return token;
        } catch (error) {
          console.error('保存用户信息失败:', error);
          return '';
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

      logout: () => {
        try {
          set({ [TOKEN_KEY]: null });
        } catch (error) {
          console.error('退出登录失败:', error);
        }
      },

      // ---------CHECKOUT_INFO---------
      saveCheckoutInfo: (data: any) => {
        try {
          set({ [CHECKOUT_INFO_KEY]: data });
        } catch (error) {
          console.error('保存结算信息失败:', error);
        }
      },

      getCheckoutInfo: () => {
        try {
          const checkoutInfo = get()[CHECKOUT_INFO_KEY];
          if (!checkoutInfo) return null;
          return JSON.parse(checkoutInfo);
        } catch (error) {
          console.error('获取结算信息失败:', error);
          return null;
        }
      },

      clearCheckoutInfo: () => {
        try {
          set({ [CHECKOUT_INFO_KEY]: null });
        } catch (error) {
          console.error('清除结算信息失败:', error);
        }
      },
    }),
    {
      name: 'user-store',
      partialize: state => ({
        [TOKEN_KEY]: state[TOKEN_KEY],
        [CHECKOUT_INFO_KEY]: state[CHECKOUT_INFO_KEY],
      }),
    }
  )
);

// 导出 hooks
export const useUser = () => useUserStore(state => state.getUser());
export const useToken = () => useUserStore(state => state.getToken());

// 导出操作方法
export const saveToken = (user: User): string => {
  const store = useUserStore.getState();
  return store.saveToken(user);
};

export const getToken = (): string | null => {
  const store = useUserStore.getState();
  return store.getToken();
};

export const getUser = (): User | null => {
  const store = useUserStore.getState();
  return store.getUser();
};

export const getUserId = (): string => {
  const store = useUserStore.getState();
  return store.getUserId();
};

export const logout = () => {
  const store = useUserStore.getState();
  store.logout();
};

export const saveCheckoutInfo = (data: any) => {
  const store = useUserStore.getState();
  store.saveCheckoutInfo(data);
};

export const getCheckoutInfo = () => {
  const store = useUserStore.getState();
  return store.getCheckoutInfo();
};

export const clearCheckoutInfo = () => {
  const store = useUserStore.getState();
  store.clearCheckoutInfo();
};
