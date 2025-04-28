import { User } from 'shared';
import { API_CONFIG, fetchApi } from './config';
import { encrypt } from '../crypto';

export async function login(email: string, password: string): Promise<string> {
  const url = `${API_CONFIG.usersUrl}/login`;
  const res = await fetchApi<User>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.success || !res.data) {
    throw new Error(res.error || '登录失败');
  }

  // 直接返回token
  return encrypt(JSON.stringify(res.data));
}

// 新增注册API
export async function register(email: string, password: string): Promise<string> {
  const url = `${API_CONFIG.usersUrl}/register`;
  const username = email.split('@')[0];
  const res = await fetchApi<User>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });
  if (!res.success || !res.data) {
    throw new Error(res.error || '注册失败');
  }
  // 直接返回token
  return encrypt(JSON.stringify(res.data));
}
