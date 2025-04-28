import { API_CONFIG, fetchApi } from './config';
import { User } from 'shared';
import { saveToken } from '@/lib/utils/users';

// 获取用户信息
export async function getUserById(id: string) {
  const url = `${API_CONFIG.usersUrl}/${id}`;
  const response = await fetchApi(url);
  if (!response.success || !response.data) {
    throw new Error('获取用户信息失败');
  }
  return response.data;
}

// 更新用户信息
export async function updateUserById(id: string, data: any) {
  const url = `${API_CONFIG.usersUrl}/${id}`;
  const response = await fetchApi(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.success || !response.data) {
    throw new Error('更新用户信息失败');
  }
  return response.data;
}

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
  return saveToken(res.data);
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
  return saveToken(res.data);
}
