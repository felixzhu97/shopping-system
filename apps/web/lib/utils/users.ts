import { User } from 'shared';
import { decrypt, encrypt } from './crypto';

export const saveToken = (user: User): string => {
  const token = encrypt(JSON.stringify(user));
  localStorage.setItem('token', token);
  return token;
};

export const getToken = (): string | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    return token;
  } catch (error) {
    console.error('获取token失败:', error);
    return null;
  }
};

export const getUser = (): User | null => {
  const token = getToken();
  if (!token) {
    return null;
  }

  return JSON.parse(decrypt(token));
};

export const getUserId = (): string | null => {
  const user = getUser();
  if (!user) {
    return null;
  }
  return user.id;
};

export const logout = () => {
  localStorage.removeItem('token');
};
