import { create } from 'zustand';

interface UserState {
  token: string | null;
  setToken: (token: string | null) => void;
}

export const useUserStore = create<UserState>(set => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  setToken: token => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
}));
