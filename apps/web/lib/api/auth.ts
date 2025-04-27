import { User } from 'shared';
import { API_CONFIG, fetchApi } from './config';

export async function login(email: string, password: string): Promise<User> {
  const url = `${API_CONFIG.usersUrl}/login`;
  const res = await fetchApi<User>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.success || !res.data) {
    throw new Error(res.error || '登录失败');
  }
  // 兼容返回token或user对象
  if (res.data && typeof res.data === 'object' && res.data) {
    return res.data;
  }
  // 直接返回user对象
  return res.data;
}

// 新增注册API
export async function register(email: string, password: string): Promise<User> {
  const username = email.split('@')[0];
  const res = await fetch('/api/proxy/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || data.message || '注册失败');
  }
  return data;
}
