import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'shared';
import { encryptedStorage } from '../utils/crypto';

export const TOKEN_KEY = 'ss-u-t';
export const INFO_KEY = 'ss-u-i';
export const USER_KEY = 'ss-u';

interface UserSlice {
  [TOKEN_KEY]: string | null;
  [INFO_KEY]: User | null;
  saveToken: (token: string) => string;
  clearToken: () => void;
  saveUserInfo: (info: User) => User;
  clearUserInfo: () => void;
  getToken: () => string | null;
  getUserInfo: () => User | null;
  getUserId: () => string;
}

export const useUserStore = create<UserSlice>()(
  persist(
    (set, get) => ({
      [TOKEN_KEY]: null,
      [INFO_KEY]: null,
      saveToken: (token: string): string => {
        set({ [TOKEN_KEY]: token });
        return token;
      },

      saveUserInfo: (info: User) => {
        set({ [INFO_KEY]: info });

        return info;
      },

      clearToken: () => {
        set({ [TOKEN_KEY]: null });
      },

      clearUserInfo: () => {
        set({ [INFO_KEY]: null });
      },

      getToken: (): string | null => {
        const token = get()[TOKEN_KEY];
        return token ? token : null;
      },

      getUserInfo: (): User | null => {
        const info = get()[INFO_KEY];
        if (!info) {
          return null;
        }

        return info;
      },

      getUserId: (): string => {
        const user = get().getUserInfo();
        return user?.id || '';
      },
    }),
    {
      name: USER_KEY,
      storage: {
        getItem: name => {
          const str = encryptedStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          encryptedStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: encryptedStorage.removeItem,
      },
    }
  )
);

export const useSaveToken = () => useUserStore(state => state.saveToken);
export const useSaveUserInfo = () => useUserStore(state => state.saveUserInfo);

export const useToken = () => useUserStore(state => state.getToken());
export const useUserInfo = () => useUserStore(state => state.getUserInfo());
export const useUserId = () => useUserStore(state => state.getUserId());

export const clearUserStore = () => {
  encryptedStorage.removeItem(USER_KEY);
};

export function getTokenFromStore() {
  try {
    const store = encryptedStorage.getItem(USER_KEY);
    if (store) {
      const parsed = JSON.parse(store);
      if (parsed && parsed.state && parsed.state[TOKEN_KEY]) {
        return parsed.state[TOKEN_KEY];
      }
    }
  } catch (e) {
    console.error('getTokenFromStore error', e);
  }
}
