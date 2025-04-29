import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { decrypt, encrypt } from '../utils/crypto';
import { User } from 'shared';

export const TOKEN_KEY = 't';

interface UserState {
  [TOKEN_KEY]: string | null;
  saveToken: (user: User) => string;
  getUser: () => User | null;
  getUserId: () => string | null;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      [TOKEN_KEY]: null,
      saveToken: (user: User): string => {
        const token = encrypt(JSON.stringify(user));

        set({ [TOKEN_KEY]: token });
        return token;
      },
      getUser: (): User | null => {
        const user = get()[TOKEN_KEY];
        if (!user) {
          return null;
        }
        return JSON.parse(decrypt(user));
      },
      getUserId: (): string | null => {
        const user = get().getUser();
        if (!user) {
          return null;
        }
        return user.id;
      },
      logout: () => {
        set({ [TOKEN_KEY]: null });
      },
    }),
    {
      name: 'user',
      partialize: state => ({
        [TOKEN_KEY]: state[TOKEN_KEY],
      }),
    }
  )
);
