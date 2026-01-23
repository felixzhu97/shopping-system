import { create } from 'zustand';
import { User } from 'types';

export interface CheckoutFormData extends User {}

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
  // 收货地址
  address: '',
  city: '',
  province: '',
  postalCode: '',
  // 支付信息
  paymentMethod: 'alipay',
};

export const useCheckoutStore = create<CheckoutState>()(set => ({
  formData: initialState,
  errors: {},
  selectedProvince: '',
  selectedCity: '',
  isSubmitting: false,
  setFormData: data =>
    set(state => ({
      formData: typeof data === 'function' ? data(state.formData) : { ...state.formData, ...data },
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
}));
