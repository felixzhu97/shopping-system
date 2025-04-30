import { create } from 'zustand';
import { User } from 'shared';
import { encrypt, decrypt } from '../utils/crypto';

interface UserState {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  getUser: () => User | null;
  getToken: () => string | null;
}

const TOKEN_KEY = 't';

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  token: null,

  setUser: (user: User) => {
    try {
      const token = encrypt(JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token);
      set({ user, token });
    } catch (error) {
      console.error('保存用户信息失败:', error);
    }
  },

  clearUser: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null });
    } catch (error) {
      console.error('清除用户信息失败:', error);
    }
  },

  getUser: () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;
      const user = JSON.parse(decrypt(token));
      return user;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  },

  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('获取token失败:', error);
      return null;
    }
  },
}));
