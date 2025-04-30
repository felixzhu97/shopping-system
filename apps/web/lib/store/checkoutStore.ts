import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'shared';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  paymentMethod: string;
  cardNumber?: string;
  expiration?: string;
  cvv?: string;
  [key: string]: any; // 允许动态添加属性
}

interface CheckoutState {
  formData: FormData;
  errors: Partial<FormData>;
  selectedProvince: string;
  selectedCity: string;
  isSubmitting: boolean;
  setFormData: (data: Partial<FormData> | ((prev: FormData) => FormData)) => void;
  setErrors: (errors: Partial<FormData>) => void;
  setSelectedProvince: (province: string) => void;
  setSelectedCity: (city: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  resetForm: () => void;
}

const initialState: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  postalCode: '',
  paymentMethod: '',
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    set => ({
      formData: initialState,
      errors: {},
      selectedProvince: '',
      selectedCity: '',
      isSubmitting: false,
      setFormData: data =>
        set(state => ({
          formData:
            typeof data === 'function' ? data(state.formData) : { ...state.formData, ...data },
        })),
      setErrors: errors =>
        set(() => ({
          errors,
        })),
      setSelectedProvince: province =>
        set(() => ({
          selectedProvince: province,
        })),
      setSelectedCity: city =>
        set(() => ({
          selectedCity: city,
        })),
      setIsSubmitting: isSubmitting =>
        set(() => ({
          isSubmitting,
        })),
      resetForm: () =>
        set(() => ({
          formData: initialState,
          errors: {},
          selectedProvince: '',
          selectedCity: '',
          isSubmitting: false,
        })),
    }),
    {
      name: 'checkout-storage',
    }
  )
);
