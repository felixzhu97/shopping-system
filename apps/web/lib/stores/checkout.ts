import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'shared';

interface FormData
  extends Pick<
    User,
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'phone'
    | 'address'
    | 'city'
    | 'province'
    | 'postalCode'
    | 'paymentMethod'
    | 'cardNumber'
    | 'expiration'
    | 'cvv'
  > {}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  cardNumber?: string;
  expiration?: string;
  cvv?: string;
}

interface CheckoutState {
  formData: FormData;
  errors: FormErrors;
  selectedProvince: string;
  selectedCity: string;
  isSubmitting: boolean;
  setFormData: (data: Partial<FormData>) => void;
  setErrors: (errors: Partial<FormErrors>) => void;
  setSelectedProvince: (province: string) => void;
  setSelectedCity: (city: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  resetForm: () => void;
}

const initialState: Omit<
  CheckoutState,
  | 'setFormData'
  | 'setErrors'
  | 'setSelectedProvince'
  | 'setSelectedCity'
  | 'setIsSubmitting'
  | 'resetForm'
> = {
  formData: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    expiration: '',
    cvv: '',
  },
  errors: {},
  selectedProvince: '',
  selectedCity: '',
  isSubmitting: false,
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    set => ({
      ...initialState,
      setFormData: data =>
        set(state => ({
          formData: { ...state.formData, ...data },
          errors: {
            ...state.errors,
            ...Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: undefined }), {}),
          },
        })),
      setErrors: errors =>
        set(state => ({
          errors: { ...state.errors, ...errors },
        })),
      setSelectedProvince: province =>
        set(state => ({
          selectedProvince: province,
          formData: { ...state.formData, province, city: '' },
          errors: { ...state.errors, province: undefined, city: undefined },
          selectedCity: '',
        })),
      setSelectedCity: city =>
        set(state => ({
          selectedCity: city,
          formData: { ...state.formData, city },
          errors: { ...state.errors, city: undefined },
        })),
      setIsSubmitting: isSubmitting =>
        set(() => ({
          isSubmitting,
        })),
      resetForm: () => set(initialState),
    }),
    {
      name: 'checkout-storage',
    }
  )
);
