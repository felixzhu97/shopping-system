import { describe, it, expect, beforeEach } from 'vitest';
import { useCheckoutStore } from '../lib/store/checkoutStore';

describe('checkoutStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCheckoutStore.getState().resetForm();
  });

  it('should have initial state', () => {
    const state = useCheckoutStore.getState();

    expect(state.formData).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      paymentMethod: 'alipay',
    });
    expect(state.errors).toEqual({});
    expect(state.selectedProvince).toBe('');
    expect(state.selectedCity).toBe('');
    expect(state.isSubmitting).toBe(false);
  });

  it('should set form data', () => {
    const mockData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '416-123-4567',
    };

    useCheckoutStore.getState().setFormData(mockData);

    const state = useCheckoutStore.getState();
    expect(state.formData.firstName).toBe('John');
    expect(state.formData.lastName).toBe('Doe');
    expect(state.formData.email).toBe('john@example.com');
    expect(state.formData.phone).toBe('416-123-4567');
  });

  it('should set form data using function', () => {
    useCheckoutStore.getState().setFormData(prev => ({
      ...prev,
      firstName: 'Jane',
      lastName: 'Smith',
    }));

    const state = useCheckoutStore.getState();
    expect(state.formData.firstName).toBe('Jane');
    expect(state.formData.lastName).toBe('Smith');
  });

  it('should set errors', () => {
    const mockErrors = {
      firstName: 'First name is required',
      email: 'Invalid email format',
    };

    useCheckoutStore.getState().setErrors(mockErrors);

    const state = useCheckoutStore.getState();
    expect(state.errors).toEqual(mockErrors);
  });

  it('should set selected province', () => {
    const province = 'Ontario';

    useCheckoutStore.getState().setSelectedProvince(province);

    const state = useCheckoutStore.getState();
    expect(state.selectedProvince).toBe(province);
  });

  it('should set selected city', () => {
    const city = 'Toronto';

    useCheckoutStore.getState().setSelectedCity(city);

    const state = useCheckoutStore.getState();
    expect(state.selectedCity).toBe(city);
  });

  it('should set submitting state', () => {
    useCheckoutStore.getState().setIsSubmitting(true);

    let state = useCheckoutStore.getState();
    expect(state.isSubmitting).toBe(true);

    useCheckoutStore.getState().setIsSubmitting(false);

    state = useCheckoutStore.getState();
    expect(state.isSubmitting).toBe(false);
  });

  it('should reset form', () => {
    const {
      setFormData,
      setErrors,
      setSelectedProvince,
      setSelectedCity,
      setIsSubmitting,
      resetForm,
    } = useCheckoutStore.getState();

    // Set some data first
    setFormData({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });
    setErrors({ firstName: 'Error' });
    setSelectedProvince('Ontario');
    setSelectedCity('Toronto');
    setIsSubmitting(true);

    // Then reset
    resetForm();

    const state = useCheckoutStore.getState();
    expect(state.formData).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      paymentMethod: 'alipay',
    });
    expect(state.errors).toEqual({});
    expect(state.selectedProvince).toBe('');
    expect(state.selectedCity).toBe('');
    expect(state.isSubmitting).toBe(false);
  });

  it('should update individual form fields', () => {
    const { setFormData } = useCheckoutStore.getState();

    // Set initial data
    setFormData({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    // Update only firstName
    setFormData({ firstName: 'Jane' });

    const state = useCheckoutStore.getState();
    expect(state.formData.firstName).toBe('Jane');
    expect(state.formData.lastName).toBe('Doe');
    expect(state.formData.email).toBe('john@example.com');
  });
});
