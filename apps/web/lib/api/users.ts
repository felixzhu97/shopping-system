import { API_CONFIG, fetchApi } from './config';
import { User, ApiResponse } from 'shared';

// 获取用户信息
export async function getUserById(id: string): Promise<User> {
  const url = `${API_CONFIG.usersUrl}/${id}`;
  const response = await fetchApi<ApiResponse<User>>(url);
  if (!response.success || !response.data) {
    throw new Error('获取用户信息失败');
  }
  return response.data;
}

// 更新用户信息
export async function updateUserById(id: string, data: Partial<User>): Promise<User> {
  const url = `${API_CONFIG.usersUrl}/${id}`;
  const response = await fetchApi<ApiResponse<User>>(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.success || !response.data) {
    throw new Error('更新用户信息失败');
  }
  return response.data;
}

export async function login(email: string, password: string): Promise<User> {
  const url = `${API_CONFIG.usersUrl}/login`;
  const res = await fetchApi<ApiResponse<User>>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.success || !res.data) {
    throw new Error(res.error || '登录失败');
  }
  return res.data;
}

// 新增注册API
export async function register(user: Omit<User, 'id'>): Promise<User> {
  const url = `${API_CONFIG.usersUrl}/register`;
  const res = await fetchApi<ApiResponse<User>>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.success || !res.data) {
    throw new Error(res.error || '注册失败');
  }
  return res.data;
}

// 更新用户地址
export async function updateUserAddress(id: string, address: User['address']): Promise<User> {
  const url = `${API_CONFIG.usersUrl}/${id}`;
  const response = await fetchApi<ApiResponse<User>>(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  });
  if (!response.success || !response.data) {
    throw new Error('更新用户地址失败');
  }
  return response.data;
}

// 重置密码
export async function resetPassword(emailOrPhone: string, newPassword: string): Promise<User> {
  const url = `${API_CONFIG.usersUrl}/reset-password`;
  const response = await fetchApi<ApiResponse<User>>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone, newPassword }),
  });
  if (!response.success || !response.data) {
    throw new Error(response.error || '重置密码失败');
  }
  return response.data;
}
