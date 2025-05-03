import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { encryptedStorage } from '@/lib/utils/crypto';

interface AccountFormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: {
    street: string;
    apt: string;
    city: string;
    province: string;
    zip: string;
    country: string;
    firstName: string;
    lastName: string;
    company: string;
    phone: string;
  };
}

interface AccountStore {
  formData: AccountFormData;
  setFormData: (data: Partial<AccountFormData>) => void;
  resetForm: () => void;
}

const initialFormData: AccountFormData = {
  firstName: '',
  lastName: '',
  phone: '',
  address: {
    street: '',
    apt: '',
    city: '',
    province: '',
    zip: '',
    country: '中国',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
  },
};

export const useAccountStore = create<AccountStore>()(
  persist(
    (set, get) => ({
      formData: initialFormData,
      setFormData: data =>
        set(state => ({
          formData: {
            ...state.formData,
            ...data,
            address: {
              ...state.formData.address,
              ...(data.address || {}),
            },
          },
        })),
      resetForm: () => set({ formData: initialFormData }),
    }),
    {
      name: 'account',
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
