import { User } from 'shared';
import { useUserStore } from '../store/userStore';

// 导出 store 的 hooks
export const useUser = () => useUserStore(state => state.user);
export const useToken = () => useUserStore(state => state.token);

// 导出操作方法
export const saveToken = (user: User): string => {
  const store = useUserStore.getState();
  store.setUser(user);
  return store.getToken() || '';
};

export const getToken = (): string | null => {
  const store = useUserStore.getState();
  return store.getToken();
};

export const getUser = (): User | null => {
  const store = useUserStore.getState();
  return store.getUser();
};

export const getUserId = (): string => {
  const store = useUserStore.getState();
  return store.getUser()?.id || '';
};

export const logout = () => {
  const store = useUserStore.getState();
  store.clearUser();
};

// ---------CHECKOUT_INFO---------
const CHECKOUT_INFO_KEY = 'c';

export const saveCheckoutInfo = (data: any) => {
  try {
    localStorage.setItem(CHECKOUT_INFO_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('保存结算信息失败:', error);
  }
};

export const getCheckoutInfo = () => {
  try {
    const checkoutInfo = localStorage.getItem(CHECKOUT_INFO_KEY);
    if (!checkoutInfo) return null;
    return JSON.parse(checkoutInfo);
  } catch (error) {
    console.error('获取结算信息失败:', error);
    return null;
  }
};

export const clearCheckoutInfo = () => {
  try {
    localStorage.removeItem(CHECKOUT_INFO_KEY);
  } catch (error) {
    console.error('清除结算信息失败:', error);
  }
};
