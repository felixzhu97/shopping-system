import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'shared';

export interface CheckoutFormData {
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
}

interface CheckoutState {
  formData: CheckoutFormData;
  errors: Partial<CheckoutFormData>;
  selectedProvince: string;
  selectedCity: string;
  isSubmitting: boolean;
  setFormData: (
    data: Partial<CheckoutFormData> | ((prev: CheckoutFormData) => CheckoutFormData)
  ) => void;
  setErrors: (errors: Partial<CheckoutFormData>) => void;
  setSelectedProvince: (province: string) => void;
  setSelectedCity: (city: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  resetForm: () => void;
}

const initialState: CheckoutFormData = {
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
