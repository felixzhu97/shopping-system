import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  username: string | null;
  token: string | null;
  setUser: (username: string, token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      username: null,
      token: null,
      setUser: (username: string, token: string) => {
        set({ username, token });
      },
      logout: () => {
        set({ username: null, token: null });
      },
    }),
    {
      name: 'user-storage',
    }
  )
);
